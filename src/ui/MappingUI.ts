import {
    VisualMappings,
    VisualMapping
} from '../types';

export class MappingUI {
    private container: HTMLElement;
    private bodyContainer: HTMLElement;
    private leftColumn: HTMLElement;
    private rightColumn: HTMLElement;
    private svgOverlay: SVGSVGElement;
    private typeSelect: HTMLSelectElement;

    private mappings: VisualMappings | null = null;
    private availableAttributes: Record<string, string[]> = {};
    private onUpdate: ((mappings: VisualMappings) => void) | null = null;
    private currentType: string = '';

    // Drag-and-Drop state
    private activeDrag: {
        startDot: HTMLElement;
        isLeft: boolean;
        sourceName: string;
        visualPropName: string;
        tempPath: SVGPathElement;
    } | null = null;

    constructor(containerId: string) {
        const el = document.getElementById(containerId);
        if (!el) throw new Error(`Element ${containerId} not found`);
        this.container = el;

        // Ensure glassmorphism theme and base structure
        this.container.innerHTML = `
            <div class="mapping-header">
                <span>Mapping</span>
                <div class="mapping-header-controls">
                    <select class="mapping-type-select" id="mappingTypeSelect"></select>
                    <div class="mapping-toggle" id="mappingToggle">▼</div>
                </div>
            </div>
            <div class="mapping-body" id="mappingBody">
                <div class="mapping-column left" id="mappingLeftCol">
                    <div class="mapping-column-title">Attribute (Daten)</div>
                </div>
                <div class="mapping-column right" id="mappingRightCol">
                    <div class="mapping-column-title">Visualisierung</div>
                </div>
                <svg class="mapping-svg-overlay" id="mappingSvg"></svg>
            </div>
        `;

        this.bodyContainer = this.container.querySelector('#mappingBody') as HTMLElement;
        this.leftColumn = this.container.querySelector('#mappingLeftCol') as HTMLElement;
        this.rightColumn = this.container.querySelector('#mappingRightCol') as HTMLElement;
        this.svgOverlay = this.container.querySelector('#mappingSvg') as SVGSVGElement;
        this.typeSelect = this.container.querySelector('#mappingTypeSelect') as HTMLSelectElement;

        // Toggle logic (Expand/Collapse)
        const toggle = this.container.querySelector('#mappingToggle') as HTMLElement;
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.container.classList.toggle('collapsed');
            toggle.textContent = this.container.classList.contains('collapsed') ? '▲' : '▼';
            if (!this.container.classList.contains('collapsed')) {
                // Redraw curves when expanded
                requestAnimationFrame(() => this.drawCurves());
            }
        });

        // Type select listener
        this.typeSelect.addEventListener('change', () => {
            this.currentType = this.typeSelect.value;
            this.renderColumns();
        });

        // Handle global window resize and scroll events to keep curves aligned
        window.addEventListener('resize', () => this.drawCurves());
        this.leftColumn.addEventListener('scroll', () => this.drawCurves());
        this.rightColumn.addEventListener('scroll', () => this.drawCurves());

        // Global mouse/pointer move and up handlers for dragging curves
        window.addEventListener('pointermove', (e) => this.handlePointerMove(e));
        window.addEventListener('pointerup', (e) => this.handlePointerUp(e));
    }

    public bind(
        mappings: VisualMappings,
        availableAttributes: Record<string, string[]>,
        onUpdate: (newMappings: VisualMappings) => void
    ) {
        this.mappings = mappings;
        this.availableAttributes = availableAttributes;
        this.onUpdate = onUpdate;

        // Populate type selector if not yet populated or if types changed
        const types = Object.keys(availableAttributes);
        const currentSelection = this.typeSelect.value;
        this.typeSelect.innerHTML = '';
        
        types.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            if (t === currentSelection) opt.selected = true;
            this.typeSelect.appendChild(opt);
        });

        if (types.length > 0) {
            if (!types.includes(this.currentType)) {
                this.currentType = types[0];
            }
            this.typeSelect.value = this.currentType;
        }

        // Inform user when loaded: Auto-expand mapping panel
        this.container.classList.remove('collapsed');
        const toggleBtn = this.container.querySelector('#mappingToggle') as HTMLElement;
        if (toggleBtn) toggleBtn.textContent = '▼';

        this.renderColumns();
    }

    private renderColumns() {
        // Clear columns except titles
        const leftTitle = this.leftColumn.querySelector('.mapping-column-title') as HTMLElement;
        const rightTitle = this.rightColumn.querySelector('.mapping-column-title') as HTMLElement;

        this.leftColumn.innerHTML = '';
        this.rightColumn.innerHTML = '';

        this.leftColumn.appendChild(leftTitle);
        this.rightColumn.appendChild(rightTitle);

        if (!this.mappings || !this.currentType) return;

        // 1. Render Left Column: Attributes
        const attributes = this.availableAttributes[this.currentType] || [];
        attributes.forEach(attr => {
            const item = document.createElement('div');
            item.className = 'mapping-item left';
            item.dataset.attr = attr;

            const label = document.createElement('span');
            label.textContent = attr;
            item.appendChild(label);

            const dot = document.createElement('div');
            dot.className = 'snapdot left-dot';
            dot.dataset.attr = attr;
            item.appendChild(dot);

            // Pointer down listener to start drag
            dot.addEventListener('pointerdown', (e) => this.startDrag(e, dot, true, attr, ''));

            this.leftColumn.appendChild(item);
        });

        // 2. Render Right Column: Visual Properties
        const preset = this.mappings.defaultPresets[this.currentType];
        if (preset) {
            Object.keys(preset).forEach(prop => {
                const item = document.createElement('div');
                item.className = 'mapping-item right';
                item.dataset.prop = prop;

                const label = document.createElement('span');
                label.textContent = prop.charAt(0).toUpperCase() + prop.slice(1);
                item.appendChild(label);

                const dot = document.createElement('div');
                dot.className = 'snapdot right-dot';
                dot.dataset.prop = prop;
                item.appendChild(dot);

                // Pointer down listener to start drag
                dot.addEventListener('pointerdown', (e) => this.startDrag(e, dot, false, '', prop));

                this.rightColumn.appendChild(item);
            });
        }

        // Draw active curves after browser layout pass
        requestAnimationFrame(() => this.drawCurves());
    }

    private drawCurves() {
        // Clear previous paths
        this.svgOverlay.innerHTML = '';

        if (!this.mappings || !this.currentType) return;

        const preset = this.mappings.defaultPresets[this.currentType];
        if (!preset) return;

        const bodyRect = this.bodyContainer.getBoundingClientRect();

        Object.entries(preset).forEach(([prop, mapping]) => {
            if (typeof mapping === 'object' && mapping !== null && 'source' in mapping) {
                const sourceAttr = (mapping as VisualMapping).source;
                if (sourceAttr && sourceAttr !== 'constant') {
                    // Find output dot (left) and input dot (right)
                    const leftDot = this.leftColumn.querySelector(`.snapdot[data-attr="${sourceAttr}"]`) as HTMLElement;
                    const rightDot = this.rightColumn.querySelector(`.snapdot[data-prop="${prop}"]`) as HTMLElement;

                    if (leftDot && rightDot) {
                        leftDot.classList.add('connected');
                        rightDot.classList.add('connected');

                        const leftRect = leftDot.getBoundingClientRect();
                        const rightRect = rightDot.getBoundingClientRect();

                        const x1 = leftRect.left + leftRect.width / 2 - bodyRect.left;
                        const y1 = leftRect.top + leftRect.height / 2 - bodyRect.top;
                        const x2 = rightRect.left + rightRect.width / 2 - bodyRect.left;
                        const y2 = rightRect.top + rightRect.height / 2 - bodyRect.top;

                        // Create curve
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('class', 'mapping-curve');
                        
                        // Control points for nice S-curve
                        const dx = Math.abs(x2 - x1) * 0.5;
                        const dStr = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
                        path.setAttribute('d', dStr);

                        // Click path to disconnect
                        path.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.disconnectMapping(prop);
                        });

                        this.svgOverlay.appendChild(path);
                    }
                } else {
                    const rightDot = this.rightColumn.querySelector(`.snapdot[data-prop="${prop}"]`) as HTMLElement;
                    if (rightDot) rightDot.classList.remove('connected');
                }
            }
        });
    }

    private startDrag(e: PointerEvent, dot: HTMLElement, isLeft: boolean, attrName: string, propName: string) {
        e.preventDefault();
        e.stopPropagation();


        // Create temporary SVG path
        const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tempPath.setAttribute('class', 'mapping-curve active-drag');
        this.svgOverlay.appendChild(tempPath);

        this.activeDrag = {
            startDot: dot,
            isLeft,
            sourceName: attrName,
            visualPropName: propName,
            tempPath
        };

        // Capture pointer
        dot.setPointerCapture(e.pointerId);
    }

    private handlePointerMove(e: PointerEvent) {
        if (!this.activeDrag) return;

        const bodyRect = this.bodyContainer.getBoundingClientRect();
        const startRect = this.activeDrag.startDot.getBoundingClientRect();
        
        const x1 = startRect.left + startRect.width / 2 - bodyRect.left;
        const y1 = startRect.top + startRect.height / 2 - bodyRect.top;
        const x2 = e.clientX - bodyRect.left;
        const y2 = e.clientY - bodyRect.top;

        const dx = Math.abs(x2 - x1) * 0.5;
        const dStr = this.activeDrag.isLeft
            ? `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`
            : `M ${x2} ${y2} C ${x2 + dx} ${y2}, ${x1 - dx} ${y1}, ${x1} ${y1}`;

        this.activeDrag.tempPath.setAttribute('d', dStr);
    }

    private handlePointerUp(e: PointerEvent) {
        if (!this.activeDrag) return;

        this.activeDrag.startDot.releasePointerCapture(e.pointerId);

        // Find element under pointer
        const element = document.elementFromPoint(e.clientX, e.clientY);
        const targetDot = element ? element.closest('.snapdot') as HTMLElement : null;

        if (targetDot) {
            const isTargetLeft = targetDot.classList.contains('left-dot');
            
            // Connect output (left) to input (right)
            if (this.activeDrag.isLeft && !isTargetLeft) {
                const targetProp = targetDot.dataset.prop || '';
                const sourceAttr = this.activeDrag.sourceName;
                this.connectMapping(sourceAttr, targetProp);
            } 
            // Connect input (right) to output (left)
            else if (!this.activeDrag.isLeft && isTargetLeft) {
                const sourceAttr = targetDot.dataset.attr || '';
                const targetProp = this.activeDrag.visualPropName;
                this.connectMapping(sourceAttr, targetProp);
            }
        } else {
            // Dropped in empty space: if dragged from a visual property, disconnect it
            if (!this.activeDrag.isLeft && this.activeDrag.visualPropName) {
                this.disconnectMapping(this.activeDrag.visualPropName);
            }
        }

        // Clean up temporary path
        if (this.activeDrag.tempPath.parentNode) {
            this.activeDrag.tempPath.parentNode.removeChild(this.activeDrag.tempPath);
        }
        this.activeDrag = null;
        this.drawCurves();
    }

    private connectMapping(sourceAttr: string, propName: string) {
        if (!this.mappings || !this.currentType || !this.onUpdate) return;

        const preset = this.mappings.defaultPresets[this.currentType] as any;
        if (!preset || !preset[propName]) return;

        // Update mapping source and function
        preset[propName] = {
            ...preset[propName],
            source: sourceAttr,
            function: sourceAttr === 'constant' ? 'constant' : 'linear'
        };

        this.onUpdate(this.mappings);
    }

    private disconnectMapping(propName: string) {
        if (!this.mappings || !this.currentType || !this.onUpdate) return;

        const preset = this.mappings.defaultPresets[this.currentType] as any;
        if (!preset || !preset[propName]) return;

        // Reset to constant source
        preset[propName] = {
            ...preset[propName],
            source: 'constant',
            function: 'constant'
        };

        this.onUpdate(this.mappings);
    }
}
