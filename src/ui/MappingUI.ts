import {
    VisualMappings,
    VisualMapping,
    DataModel
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
    private dataModel: DataModel | null = null;
    private onUpdate: ((mappings: VisualMappings) => void) | null = null;
    private currentType: string = '';
    private expandedProps = new Set<string>();

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
        dataModel: DataModel | null,
        onUpdate: (newMappings: VisualMappings) => void
    ) {
        this.mappings = mappings;
        this.availableAttributes = availableAttributes;
        this.dataModel = dataModel;
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

                const mapping = (preset as any)[prop] as VisualMapping;
                const isConnected = mapping && mapping.source && mapping.source !== 'constant';

                if (isConnected && this.expandedProps.has(prop)) {
                    item.classList.add('expanded');
                }

                // Create Header
                const header = document.createElement('div');
                header.className = 'mapping-item-header';

                const label = document.createElement('span');
                label.textContent = prop.charAt(0).toUpperCase() + prop.slice(1);
                header.appendChild(label);

                if (isConnected) {
                    const gear = document.createElement('span');
                    gear.className = 'mapping-item-gear';
                    gear.textContent = '⚙️';
                    header.appendChild(gear);

                    // Toggle expansion
                    header.onclick = (e) => {
                        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLOptionElement) {
                            return;
                        }
                        if (item.classList.contains('expanded')) {
                            item.classList.remove('expanded');
                            this.expandedProps.delete(prop);
                        } else {
                            item.classList.add('expanded');
                            this.expandedProps.add(prop);
                        }
                        this.drawCurves();
                    };
                }

                item.appendChild(header);

                // If connected, render detailed controls
                if (isConnected) {
                    const details = document.createElement('div');
                    details.className = 'mapping-item-details';

                    // 1. Function Selector
                    const funcGroup = document.createElement('div');
                    funcGroup.className = 'mapping-control-group';
                    const funcLabel = document.createElement('label');
                    funcLabel.textContent = 'Funktion';
                    funcGroup.appendChild(funcLabel);

                    const funcSelect = document.createElement('select');
                    funcSelect.className = 'mapping-control-select';
                    const functions = ['linear', 'exponential', 'logarithmic', 'heatmap', 'bipolar', 'pulse', 'sphereComplexity', 'categorical'];
                    functions.forEach(f => {
                        const opt = document.createElement('option');
                        opt.value = f;
                        opt.textContent = f;
                        opt.selected = mapping.function === f;
                        funcSelect.appendChild(opt);
                    });
                    funcSelect.onchange = () => {
                        this.updatePropertyMapping(prop, { function: funcSelect.value as any });
                    };
                    funcGroup.appendChild(funcSelect);
                    details.appendChild(funcGroup);

                    // 2. Domain Min/Max
                    let defaultDomain: [number, number] = [0, 1];
                    if (this.dataModel && this.dataModel.entities && this.dataModel.entities[this.currentType]) {
                        const propSchema = this.dataModel.entities[this.currentType].properties?.[mapping.source];
                        if (propSchema && propSchema.range) {
                            defaultDomain = propSchema.range;
                        }
                    } else if (this.dataModel && this.dataModel.relationships && this.dataModel.relationships[this.currentType]) {
                        const propSchema = this.dataModel.relationships[this.currentType].properties?.[mapping.source];
                        if (propSchema && propSchema.range) {
                            defaultDomain = propSchema.range;
                        }
                    }

                    const domainMinVal = mapping.domain ? mapping.domain[0] : defaultDomain[0];
                    const domainMaxVal = mapping.domain ? mapping.domain[1] : defaultDomain[1];

                    const domainGroup = document.createElement('div');
                    domainGroup.className = 'mapping-control-group';
                    const domainLabel = document.createElement('label');
                    domainLabel.textContent = `Domain (${mapping.source})`;
                    domainGroup.appendChild(domainLabel);

                    const domainRow = document.createElement('div');
                    domainRow.className = 'mapping-control-row';

                    const domainMinInput = document.createElement('input');
                    domainMinInput.className = 'mapping-control-input';
                    domainMinInput.type = 'number';
                    domainMinInput.placeholder = 'Min';
                    domainMinInput.value = String(domainMinVal);
                    domainMinInput.onchange = () => {
                        const min = parseFloat(domainMinInput.value);
                        const max = parseFloat(domainMaxInput.value);
                        if (!isNaN(min) && !isNaN(max)) {
                            this.updatePropertyMapping(prop, { domain: [min, max] });
                        }
                    };

                    const domainMaxInput = document.createElement('input');
                    domainMaxInput.className = 'mapping-control-input';
                    domainMaxInput.type = 'number';
                    domainMaxInput.placeholder = 'Max';
                    domainMaxInput.value = String(domainMaxVal);
                    domainMaxInput.onchange = () => {
                        const min = parseFloat(domainMinInput.value);
                        const max = parseFloat(domainMaxInput.value);
                        if (!isNaN(min) && !isNaN(max)) {
                            this.updatePropertyMapping(prop, { domain: [min, max] });
                        }
                    };

                    domainRow.appendChild(domainMinInput);
                    domainRow.appendChild(domainMaxInput);
                    domainGroup.appendChild(domainRow);
                    details.appendChild(domainGroup);

                    // 3. Range or Palette / Color params depending on function
                    if (['heatmap', 'categorical'].includes(mapping.function)) {
                        // Palette Selector
                        const palGroup = document.createElement('div');
                        palGroup.className = 'mapping-control-group';
                        const palLabel = document.createElement('label');
                        palLabel.textContent = 'Farbpalette';
                        palGroup.appendChild(palLabel);

                        const palSelect = document.createElement('select');
                        palSelect.className = 'mapping-control-select';
                        const palettes = ['blue-red', 'grayscale'];
                        palettes.forEach(p => {
                            const opt = document.createElement('option');
                            opt.value = p;
                            opt.textContent = p;
                            opt.selected = mapping.palette === p;
                            palSelect.appendChild(opt);
                        });
                        palSelect.onchange = () => {
                            this.updatePropertyMapping(prop, { palette: palSelect.value });
                        };
                        palGroup.appendChild(palSelect);
                        details.appendChild(palGroup);
                    } else if (mapping.function === 'bipolar') {
                        // Color Pickers
                        const bipGroup = document.createElement('div');
                        bipGroup.className = 'mapping-control-group';
                        const bipLabel = document.createElement('label');
                        bipLabel.textContent = 'Farben (- / +)';
                        bipGroup.appendChild(bipLabel);

                        const bipRow = document.createElement('div');
                        bipRow.className = 'mapping-control-row';

                        const posColor = mapping.params?.positive || '#00ff00';
                        const negColor = mapping.params?.negative || '#ff0000';

                        const negInput = document.createElement('input');
                        negInput.className = 'mapping-control-input';
                        negInput.type = 'color';
                        negInput.value = negColor;
                        negInput.style.padding = '0';
                        negInput.style.height = '18px';
                        negInput.style.cursor = 'pointer';
                        negInput.onchange = () => {
                            const params = { ...(mapping.params || {}), negative: negInput.value };
                            this.updatePropertyMapping(prop, { params });
                        };

                        const posInput = document.createElement('input');
                        posInput.className = 'mapping-control-input';
                        posInput.type = 'color';
                        posInput.value = posColor;
                        posInput.style.padding = '0';
                        posInput.style.height = '18px';
                        posInput.style.cursor = 'pointer';
                        posInput.onchange = () => {
                            const params = { ...(mapping.params || {}), positive: posInput.value };
                            this.updatePropertyMapping(prop, { params });
                        };

                        bipRow.appendChild(negInput);
                        bipRow.appendChild(posInput);
                        bipGroup.appendChild(bipRow);
                        details.appendChild(bipGroup);
                    } else if (['linear', 'exponential', 'logarithmic'].includes(mapping.function) || mapping.range) {
                        // Range input (Min/Max)
                        const rangeMinVal = mapping.range ? mapping.range[0] : 0.1;
                        const rangeMaxVal = mapping.range ? mapping.range[1] : 3.0;

                        const rangeGroup = document.createElement('div');
                        rangeGroup.className = 'mapping-control-group';
                        const rangeLabel = document.createElement('label');
                        rangeLabel.textContent = 'Visual Range (Min/Max)';
                        rangeGroup.appendChild(rangeLabel);

                        const rangeRow = document.createElement('div');
                        rangeRow.className = 'mapping-control-row';

                        const rangeMinInput = document.createElement('input');
                        rangeMinInput.className = 'mapping-control-input';
                        rangeMinInput.type = 'number';
                        rangeMinInput.step = '0.05';
                        rangeMinInput.value = String(rangeMinVal);
                        rangeMinInput.onchange = () => {
                            const min = parseFloat(rangeMinInput.value);
                            const max = parseFloat(rangeMaxInput.value);
                            if (!isNaN(min) && !isNaN(max)) {
                                this.updatePropertyMapping(prop, { range: [min, max] });
                            }
                        };

                        const rangeMaxInput = document.createElement('input');
                        rangeMaxInput.className = 'mapping-control-input';
                        rangeMaxInput.type = 'number';
                        rangeMaxInput.step = '0.05';
                        rangeMaxInput.value = String(rangeMaxVal);
                        rangeMaxInput.onchange = () => {
                            const min = parseFloat(rangeMinInput.value);
                            const max = parseFloat(rangeMaxInput.value);
                            if (!isNaN(min) && !isNaN(max)) {
                                this.updatePropertyMapping(prop, { range: [min, max] });
                            }
                        };

                        rangeRow.appendChild(rangeMinInput);
                        rangeRow.appendChild(rangeMaxInput);
                        rangeGroup.appendChild(rangeRow);
                        details.appendChild(rangeGroup);

                        // Exponent Base Slider if exponential
                        if (mapping.function === 'exponential') {
                            const baseGroup = document.createElement('div');
                            baseGroup.className = 'mapping-control-group';
                            const baseLabel = document.createElement('label');
                            const baseVal = mapping.params?.base || 2;
                            baseLabel.textContent = `Exponent Base: ${baseVal}`;
                            baseGroup.appendChild(baseLabel);

                            const baseInput = document.createElement('input');
                            baseInput.className = 'mapping-control-input';
                            baseInput.type = 'range';
                            baseInput.min = '1';
                            baseInput.max = '5';
                            baseInput.step = '0.1';
                            baseInput.value = String(baseVal);
                            baseInput.oninput = () => {
                                baseLabel.textContent = `Exponent Base: ${baseInput.value}`;
                            };
                            baseInput.onchange = () => {
                                const params = { ...(mapping.params || {}), base: parseFloat(baseInput.value) };
                                this.updatePropertyMapping(prop, { params });
                            };
                            baseGroup.appendChild(baseInput);
                            details.appendChild(baseGroup);
                        }
                    } else if (mapping.function === 'pulse') {
                        // Pulse Frequency Selector
                        const freqGroup = document.createElement('div');
                        freqGroup.className = 'mapping-control-group';
                        const freqLabel = document.createElement('label');
                        freqLabel.textContent = 'Frequenz';
                        freqGroup.appendChild(freqLabel);

                        const freqSelect = document.createElement('select');
                        freqSelect.className = 'mapping-control-select';
                        const frequencies = ['slow', 'heartbeat', 'fast'];
                        frequencies.forEach(f => {
                            const opt = document.createElement('option');
                            opt.value = f;
                            opt.textContent = f;
                            opt.selected = (mapping.params?.frequency || 'heartbeat') === f;
                            freqSelect.appendChild(opt);
                        });
                        freqSelect.onchange = () => {
                            const params = { ...(mapping.params || {}), frequency: freqSelect.value };
                            this.updatePropertyMapping(prop, { params });
                        };
                        freqGroup.appendChild(freqSelect);
                        details.appendChild(freqGroup);
                    }

                    item.appendChild(details);
                }

                // Snapdot for dragging
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

    private updatePropertyMapping(propName: string, updates: Partial<VisualMapping>) {
        if (!this.mappings || !this.currentType || !this.onUpdate) return;

        const preset = this.mappings.defaultPresets[this.currentType] as any;
        if (!preset || !preset[propName]) return;

        preset[propName] = {
            ...preset[propName],
            ...updates
        };

        this.onUpdate(this.mappings);
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

        // Auto-expand connected mapping property
        this.expandedProps.add(propName);

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

        // Auto-collapse disconnected property
        this.expandedProps.delete(propName);

        this.onUpdate(this.mappings);
    }
}
