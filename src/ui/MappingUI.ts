import {
    VisualMappings,
    VisualMapping,
    DataModel
} from '../types';
import * as THREE from 'three';
import { PanelUtils } from '../utils/PanelUtils';

export class MappingUI {
    private container: HTMLElement;
    private bodyContainer: HTMLElement;
    private leftColumn: HTMLElement;
    private rightColumn: HTMLElement;
    private svgOverlay: SVGSVGElement;
    private categoryTabs: HTMLElement;
    private typeSelect: HTMLSelectElement;

    private mappings: VisualMappings | null = null;
    private availableAttributes: Record<string, string[]> = {};
    private dataModel: DataModel | null = null;
    private entities: any[] = [];
    private relationships: any[] = [];
    private onUpdate: ((mappings: VisualMappings) => void) | null = null;
    private currentCategory: 'entities' | 'relationships' = 'entities';
    private currentType: string = '';
    private expandedProps = new Set<string>();
    private selectedDesignOption: Record<string, string> = {};
    private isDraggingSlider = false;

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

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
                <span style="display: flex; align-items: center; gap: 8px;">
                    Mapping
                    <span id="mappingSchemaVersionBadge" style="font-size: 10px; padding: 2px 6px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; display: none;">Schema: 1</span>
                </span>
                <div class="mapping-toggle" id="mappingToggle">▼</div>
            </div>
            <div class="mapping-selection-area" id="mappingSelectionArea" style="display: flex; gap: 10px; align-items: center; padding: 10px;">
                <div class="mapping-tabs" id="categoryTabs" style="flex: 1; display: flex;">
                    <button class="mapping-tab active" data-val="entities" style="flex: 1;">Nodes</button>
                    <button class="mapping-tab" data-val="relationships" style="flex: 1;">Edges</button>
                </div>
                <select id="mappingTypeSelect" class="mapping-control-select" style="display: none;"></select>
                <button id="btnTakeoverMapping" style="display: none; margin-left: auto; font-size: 11px; padding: 4px 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #e0e0e0; cursor: pointer; border-radius: 4px; transition: all 0.2s ease;" title="Übernimmt die mitgelieferten Mappings dieser Datei in deine aktive Konfiguration" onmouseover="this.style.background='rgba(255, 255, 255, 0.15)'; this.style.borderColor='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.borderColor='rgba(255, 255, 255, 0.1)'">Datei-Mappings übernehmen</button>
            </div>
            <div class="mapping-body" id="mappingBody" style="gap: 150px;">
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
        this.categoryTabs = this.container.querySelector('#categoryTabs') as HTMLElement;
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

        // Type Select listener
        this.typeSelect.addEventListener('change', () => {
            this.currentType = this.typeSelect.value;
            this.renderColumns();
        });

        // Takeover Button listener
        const btnTakeover = this.container.querySelector('#btnTakeoverMapping') as HTMLButtonElement;
        if (btnTakeover) {
            btnTakeover.addEventListener('click', () => {
                this.takeoverOriginalMappings();
            });
        }

        // Category tabs listener
        this.categoryTabs.querySelectorAll('.mapping-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                if (!target.dataset.val) return;
                this.currentCategory = target.dataset.val as 'entities' | 'relationships';
                
                this.categoryTabs.querySelectorAll('.mapping-tab').forEach(b => b.classList.remove('active'));
                target.classList.add('active');
                
                this.currentType = this.currentCategory === 'entities' ? 'global_node' : 'global_edge';
                this.updateTypeSelect();
                this.renderColumns();
            });
        });

        // Handle global window resize and scroll events to keep curves aligned
        window.addEventListener('resize', () => this.drawCurves());
        this.leftColumn.addEventListener('scroll', () => this.drawCurves());
        this.rightColumn.addEventListener('scroll', () => this.drawCurves());

        // Observe panel resize to update curves when resized via drag handle
        const resizeObserver = new ResizeObserver(() => {
            if (!this.container.classList.contains('collapsed')) {
                this.drawCurves();
            }
        });
        resizeObserver.observe(this.container);

        // Global mouse/pointer move and up handlers for dragging curves
        window.addEventListener('pointermove', (e) => this.handlePointerMove(e));
        window.addEventListener('pointerup', (e) => this.handlePointerUp(e));

        // Make panel draggable and resizable
        const header = this.container.querySelector('.mapping-header') as HTMLElement;
        if (header) {
            header.style.cursor = 'grab';
            PanelUtils.makeDraggableAndResizable(this.container, header, { minWidth: 350, minHeight: 250 });
            
            // Allow clicking header to bring to front
            header.addEventListener('mousedown', () => {
                this.container.dispatchEvent(new MouseEvent('mousedown'));
            });
        }
    }

    private originalMappings: VisualMappings | null = null;

    public bind(
        mappings: VisualMappings,
        availableAttributes: Record<string, string[]>,
        dataModel: DataModel | null,
        entities: any[],
        relationships: any[],
        originalMappings: VisualMappings | null,
        onUpdate: (newMappings: VisualMappings) => void
    ) {
        if (this.isDraggingSlider) {
            return;
        }

        this.mappings = mappings;
        this.originalMappings = originalMappings;
        this.availableAttributes = availableAttributes;
        this.dataModel = dataModel;
        this.entities = entities;
        this.relationships = relationships;
        this.onUpdate = onUpdate;

        // Sync category if we already have a type selected
        if (!this.currentType) {
            this.currentType = this.currentCategory === 'entities' ? 'global_node' : 'global_edge';
        } else if (this.currentType === 'global_node') {
            this.currentCategory = 'entities';
        } else if (this.currentType === 'global_edge') {
            this.currentCategory = 'relationships';
        } else if (this.dataModel) {
            if (this.dataModel.relationships && this.dataModel.relationships[this.currentType]) {
                this.currentCategory = 'relationships';
            } else {
                this.currentCategory = 'entities';
            }
        }
        
        this.categoryTabs.querySelectorAll('.mapping-tab').forEach(b => {
            if ((b as HTMLElement).dataset.val === this.currentCategory) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });

        // Inform user when loaded: Auto-expand mapping panel
        this.container.classList.remove('collapsed');
        const toggleBtn = this.container.querySelector('#mappingToggle') as HTMLElement;
        if (toggleBtn) toggleBtn.textContent = '▼';

        this.updateTypeSelect();
        this.renderColumns();
    }

    public updateSchema(schemaVersion: string) {
        const badge = this.container.querySelector('#mappingSchemaVersionBadge') as HTMLElement;
        if (badge) {
            badge.textContent = `Schema: ${schemaVersion}`;
            badge.style.display = 'inline-block';
        }
    }

    private updateTypeSelect() {
        this.typeSelect.innerHTML = '';
        const globalOpt = document.createElement('option');
        globalOpt.value = this.currentCategory === 'entities' ? 'global_node' : 'global_edge';
        this.typeSelect.appendChild(globalOpt);
        
        // Force currentType to global
        this.currentType = globalOpt.value;
        this.typeSelect.value = this.currentType;
    }

    private renderColumns() {
        // Clear columns except titles
        const leftTitle = this.leftColumn.querySelector('.mapping-column-title') as HTMLElement;
        const rightTitle = this.rightColumn.querySelector('.mapping-column-title') as HTMLElement;

        this.leftColumn.innerHTML = '';
        this.rightColumn.innerHTML = '';

        this.leftColumn.appendChild(leftTitle);
        this.rightColumn.appendChild(rightTitle);

        this.rightColumn.appendChild(rightTitle);
        
        if (!this.mappings || !this.currentType) return;
        
        const getEffectiveMapping = (prop: string): VisualMapping => {
            let mapping = ((this.mappings!.defaultPresets as any)[this.currentType] || {})[prop] as VisualMapping;
            if (mapping && mapping.source && mapping.source !== 'constant') {
                return mapping;
            }
            
            // Check original mappings if not found or constant
            const typesToCheck = this.getTypesToCheck();
            for (const t of typesToCheck) {
                const am = (this.mappings!.defaultPresets as any)[t]?.[prop] as VisualMapping;
                if (am && am.source && am.source !== 'constant') return am;
            }
            
            if (this.originalMappings && this.originalMappings.defaultPresets) {
                for (const t of typesToCheck) {
                    const om = (this.originalMappings.defaultPresets as any)[t]?.[prop] as VisualMapping;
                    if (om && om.source && om.source !== 'constant') return om;
                }
            }
            
            return mapping || { source: 'constant', function: 'constant' };
        };

        // 1. Render Left Column: Attributes
        const attributes = this.availableAttributes[this.currentType] || [];
        const isEntityType = this.currentCategory === 'entities';
        const currentDataItems = isEntityType ? this.entities : this.relationships;

        attributes.forEach(attr => {
            if (attr === 'constant') return; // Hide 'constant' from the attribute list

            const item = document.createElement('div');
            item.className = 'mapping-item left';
            item.dataset.attr = attr;

            const labelContainer = document.createElement('div');
            labelContainer.className = 'mapping-item-label-container';
            labelContainer.style.display = 'flex';
            labelContainer.style.flexDirection = 'column';
            labelContainer.style.gap = '2px';

            const label = document.createElement('span');
            label.textContent = attr;
            label.style.fontWeight = '500';
            labelContainer.appendChild(label);

            // Calculate presence count and unique values count
            if (attr !== 'constant') {
                let presenceCount = 0;
                const uniqueValues = new Set<any>();
                let minVal = Infinity;
                let maxVal = -Infinity;
                let hasNumeric = false;

                currentDataItems.forEach(dItem => {
                    if (this.currentType === 'global_node' || this.currentType === 'global_edge' || dItem.type === this.currentType) {
                        const val = this.getNestedValue(dItem, attr);
                        if (val !== undefined && val !== null) {
                            presenceCount++;
                            uniqueValues.add(val);
                            if (typeof val === 'number') {
                                hasNumeric = true;
                                if (val < minVal) minVal = val;
                                if (val > maxVal) maxVal = val;
                            }
                        }
                    }
                });

                const stats = document.createElement('span');
                stats.className = 'mapping-item-stats';
                stats.style.fontSize = '9px';
                stats.style.color = 'var(--text-muted)';
                const labelNoun = isEntityType ? (presenceCount === 1 ? 'Node' : 'Nodes') : (presenceCount === 1 ? 'Kante' : 'Kanten');
                
                let statsText = `${presenceCount} ${labelNoun} • ${uniqueValues.size} versch. Werte`;
                if (hasNumeric && minVal !== Infinity && maxVal !== -Infinity) {
                    const formatNum = (num: number) => Number.isInteger(num) ? num.toString() : num.toFixed(2);
                    statsText += ` • [${formatNum(minVal)} ... ${formatNum(maxVal)}]`;
                } else if (uniqueValues.size > 0 && !hasNumeric) {
                    statsText += ` (Text/Kategorie)`;
                }

                stats.textContent = statsText;
                labelContainer.appendChild(stats);

                // Values Container (collapsible)
                if (uniqueValues.size > 0) {
                    const valuesContainer = document.createElement('div');
                    valuesContainer.className = 'mapping-item-values';
                    valuesContainer.style.display = 'none';
                    valuesContainer.style.marginTop = '6px';
                    valuesContainer.style.fontSize = '10px';
                    valuesContainer.style.color = '#ccc';
                    valuesContainer.style.maxHeight = '150px';
                    valuesContainer.style.overflowY = 'auto';

                    const valsArray = Array.from(uniqueValues).sort();
                    const valsList = document.createElement('div');
                    valsList.style.display = 'flex';
                    valsList.style.flexWrap = 'wrap';
                    valsList.style.gap = '4px';

                    valsArray.slice(0, 50).forEach(val => {
                        const tag = document.createElement('span');
                        tag.style.background = 'rgba(255,255,255,0.1)';
                        tag.style.padding = '2px 4px';
                        tag.style.borderRadius = '3px';
                        // Convert objects/arrays to string for display
                        const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
                        tag.textContent = displayVal.length > 30 ? displayVal.substring(0, 27) + '...' : displayVal;
                        valsList.appendChild(tag);
                    });

                    if (valsArray.length > 50) {
                        const moreTag = document.createElement('span');
                        moreTag.style.background = 'rgba(255,255,255,0.05)';
                        moreTag.style.padding = '2px 4px';
                        moreTag.style.borderRadius = '3px';
                        moreTag.style.fontStyle = 'italic';
                        moreTag.textContent = `+ ${valsArray.length - 50} weitere...`;
                        valsList.appendChild(moreTag);
                    }

                    valuesContainer.appendChild(valsList);
                    labelContainer.appendChild(valuesContainer);

                    // Add click event to toggle
                    item.style.cursor = 'pointer';
                    item.addEventListener('click', (e) => {
                        // Prevent toggle if clicking on the drag dot
                        if ((e.target as HTMLElement).classList.contains('snapdot')) return;
                        
                        if (valuesContainer.style.display === 'none') {
                            valuesContainer.style.display = 'block';
                            item.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        } else {
                            valuesContainer.style.display = 'none';
                            item.style.backgroundColor = '';
                        }
                        // Need to redraw curves when panel height changes
                        requestAnimationFrame(() => this.drawCurves());
                    });
                }
            }

            item.appendChild(labelContainer);

            const dot = document.createElement('div');
            dot.className = 'snapdot left-dot';
            dot.dataset.attr = attr;
            item.appendChild(dot);

            // Pointer down listener to start drag
            dot.addEventListener('pointerdown', (e) => this.startDrag(e, dot, true, attr, ''));

            this.leftColumn.appendChild(item);
        });

        // 2. Render Right Column: Visual Properties
        
        const isEntity = this.currentCategory === 'entities';
        const visualProps = isEntity
            ? ['positionX', 'positionY', 'positionZ', 'size', 'color', 'geometry', 'glow', 'animation']
            : ['thickness', 'color', 'curvature', 'glow', 'opacity', 'animation'];

            const propTranslations: Record<string, string> = {
                positionX: 'Position X',
                positionY: 'Position Y',
                positionZ: 'Position Z',
                size: 'Größe',
                color: 'Farbe',
                geometry: 'Geometrie',
                glow: 'Leuchten',
                animation: 'Animation',
                thickness: 'Linienstärke',
                curvature: 'Krümmung',
                opacity: 'Deckkraft'
            };

            visualProps.forEach(prop => {
                const item = document.createElement('div');
                item.className = 'mapping-item right';
                item.dataset.prop = prop;

                let mapping = getEffectiveMapping(prop);
                const isConnected = mapping && mapping.source && mapping.source !== 'constant';
                const isExpanded = this.expandedProps.has(prop);

                if (isExpanded) {
                    item.classList.add('expanded');
                }

                // Create Header
                const header = document.createElement('div');
                header.className = 'mapping-item-header';

                const label = document.createElement('span');
                label.textContent = propTranslations[prop] || prop.charAt(0).toUpperCase() + prop.slice(1);
                header.appendChild(label);

                const actions = document.createElement('div');
                actions.style.display = 'flex';
                actions.style.gap = '6px';
                actions.style.alignItems = 'center';

                // The disconnect button (red X) was removed per request


                // Show the gear icon on all mapping items so users can expand constant values too!
                const gear = document.createElement('span');
                gear.className = 'mapping-item-gear';
                gear.textContent = '⚙️';
                actions.appendChild(gear);
                
                header.appendChild(actions);

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

                item.appendChild(header);

                // Detailed controls
                const details = document.createElement('div');
                details.className = 'mapping-item-details';

                if (isConnected) {
                    // 1. Function Selector
                    const funcGroup = document.createElement('div');
                    funcGroup.className = 'mapping-control-group';
                    const funcLabel = document.createElement('label');
                    funcLabel.textContent = 'Funktion';
                    funcGroup.appendChild(funcLabel);

                    const funcSelect = document.createElement('select');
                    funcSelect.className = 'mapping-control-select';

                    let functions: string[] = [];
                    if (prop === 'color') {
                        functions = ['heatmap', 'bipolar', 'categorical'];
                    } else if (prop === 'geometry') {
                        functions = ['categorical', 'sphereComplexity'];
                    } else if (['size', 'thickness', 'curvature', 'glow', 'opacity', 'positionX', 'positionY', 'positionZ'].includes(prop)) {
                        functions = ['linear', 'exponential', 'logarithmic'];
                    } else if (prop === 'animation') {
                        functions = ['pulse'];
                    } else {
                        functions = ['linear', 'exponential', 'logarithmic', 'heatmap', 'bipolar', 'pulse', 'sphereComplexity', 'categorical'];
                    }

                    if (mapping.function && !functions.includes(mapping.function) && mapping.function !== 'constant') {
                        functions.push(mapping.function);
                    }

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

                    if (mapping.function !== 'categorical') {
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
                    }

                    // 3. Range or Palette / Color params depending on function
                    if (['heatmap', 'categorical'].includes(mapping.function)) {
                        const palGroup = document.createElement('div');
                        palGroup.className = 'mapping-control-group';
                        const palLabel = document.createElement('label');
                        palLabel.textContent = 'Farbpalette';
                        palGroup.appendChild(palLabel);

                        const palSelect = document.createElement('select');
                        palSelect.className = 'mapping-control-select';
                        
                        const palettes = mapping.function === 'categorical' 
                            ? ['all', 'heatmap', 'grayscale', 'viridis', 'category10', 'category20', 'pastel'] 
                            : ['blue-red', 'grayscale', 'viridis'];
                            
                        palettes.forEach(p => {
                            const opt = document.createElement('option');
                            opt.value = p;
                            opt.textContent = p;
                            opt.selected = mapping.palette === p || (p === 'all' && !mapping.palette);
                            palSelect.appendChild(opt);
                        });
                        palSelect.onchange = () => {
                            let updates: any = { palette: palSelect.value };
                            if (mapping.function === 'categorical' && prop === 'color') {
                                const uniqueValues = this.getAttributeUniqueValues(mapping.source);
                                updates.params = { ...(mapping.params || {}), categories: this.generateCategoricalColors(uniqueValues, palSelect.value) };
                            }
                            this.updatePropertyMapping(prop, updates);
                        };
                        palGroup.appendChild(palSelect);
                        details.appendChild(palGroup);
                    } else if (mapping.function === 'bipolar') {
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
                        const isPosition = ['positionX', 'positionY', 'positionZ'].includes(prop);
                        const rangeMinVal = mapping.range ? mapping.range[0] : (isPosition ? -100 : 0.1);
                        const rangeMaxVal = mapping.range ? mapping.range[1] : (isPosition ? 100 : 3.0);

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

                        // Premium Horizontal Slider Widget Selector
                        const designModeSelectorGroup = document.createElement('div');
                        designModeSelectorGroup.className = 'mapping-control-group';
                        designModeSelectorGroup.style.marginTop = '6px';
                        const designLabel = document.createElement('label');
                        designLabel.textContent = 'Mapping-Visualisierer Modus';
                        designModeSelectorGroup.appendChild(designLabel);

                        const designSelect = document.createElement('select');
                        designSelect.className = 'mapping-control-select';
                        const designOptions = [
                            { val: 'OptionA', text: 'Lösung A: Dual-Schienen (Parallel)' },
                            { val: 'OptionB', text: 'Lösung B: Vereint (4 Regler)' },
                            { val: 'OptionC', text: 'Lösung C: Histogramm-Overlay' }
                        ];
                        designOptions.forEach(optData => {
                            const opt = document.createElement('option');
                            opt.value = optData.val;
                            opt.textContent = optData.text;
                            opt.selected = (this.selectedDesignOption[prop] || 'OptionA') === optData.val;
                            designSelect.appendChild(opt);
                        });
                        designSelect.onchange = () => {
                            this.selectedDesignOption[prop] = designSelect.value;
                            this.renderColumns();
                        };
                        designModeSelectorGroup.appendChild(designSelect);
                        details.appendChild(designModeSelectorGroup);

                        // Render the selected interactive horizontal widget
                        this.renderHorizontalWidget(details, prop, mapping);

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
                } else {
                    // Constant value setting
                    const constGroup = document.createElement('div');
                    constGroup.className = 'mapping-control-group';
                    const constLabel = document.createElement('label');
                    constLabel.textContent = 'Konstanter Wert';
                    constGroup.appendChild(constLabel);

                    if (prop === 'color') {
                        const colorInput = document.createElement('input');
                        colorInput.className = 'mapping-control-input';
                        colorInput.type = 'color';
                        const constColor = mapping.params?.color || '#00aaff';
                        colorInput.value = constColor;
                        colorInput.style.padding = '0';
                        colorInput.style.height = '24px';
                        colorInput.style.cursor = 'pointer';
                        colorInput.onchange = () => {
                            const params = { ...(mapping.params || {}), color: colorInput.value };
                            this.updatePropertyMapping(prop, { params });
                        };
                        constGroup.appendChild(colorInput);
                    } else if (prop === 'geometry') {
                        const shapeSelect = document.createElement('select');
                        shapeSelect.className = 'mapping-control-select';
                        const shapes = ['sphere', 'cube', 'cylinder', 'cone', 'torus'];
                        const currentShape = (mapping as any).value || mapping.params?.geometry || 'sphere';
                        shapes.forEach(s => {
                            const opt = document.createElement('option');
                            opt.value = s;
                            opt.textContent = s.charAt(0).toUpperCase() + s.slice(1);
                            opt.selected = currentShape === s;
                            shapeSelect.appendChild(opt);
                        });
                        shapeSelect.onchange = () => {
                            const params = { ...(mapping.params || {}), geometry: shapeSelect.value };
                            this.updatePropertyMapping(prop, { 
                                params,
                                value: shapeSelect.value
                            } as any);
                        };
                        constGroup.appendChild(shapeSelect);
                    } else if (['size', 'thickness', 'curvature', 'glow', 'opacity', 'positionX', 'positionY', 'positionZ'].includes(prop)) {
                        const numInput = document.createElement('input');
                        numInput.className = 'mapping-control-input';
                        numInput.type = 'number';
                        numInput.step = '0.05';
                        const constVal = mapping.range ? mapping.range[0] : 1.0;
                        numInput.value = String(constVal);
                        numInput.onchange = () => {
                            const val = parseFloat(numInput.value);
                            if (!isNaN(val)) {
                                this.updatePropertyMapping(prop, { range: [val, val] });
                            }
                        };
                        constGroup.appendChild(numInput);
                    } else if (prop === 'animation') {
                        const animSelect = document.createElement('select');
                        animSelect.className = 'mapping-control-select';
                        const animOptions = ['none', 'pulse'];
                        const currentAnim = mapping.function === 'pulse' ? 'pulse' : 'none';
                        animOptions.forEach(optVal => {
                            const opt = document.createElement('option');
                            opt.value = optVal;
                            opt.textContent = optVal.charAt(0).toUpperCase() + optVal.slice(1);
                            opt.selected = currentAnim === optVal;
                            animSelect.appendChild(opt);
                        });
                        animSelect.onchange = () => {
                            if (animSelect.value === 'pulse') {
                                this.updatePropertyMapping(prop, { 
                                    source: 'constant',
                                    function: 'pulse',
                                    params: { frequency: 'heartbeat' }
                                });
                            } else {
                                this.updatePropertyMapping(prop, { 
                                    source: 'constant',
                                    function: 'constant',
                                    params: {}
                                });
                            }
                        };
                        constGroup.appendChild(animSelect);
                    }
                    details.appendChild(constGroup);
                }

                item.appendChild(details);

                // Snapdot for dragging
                const dot = document.createElement('div');
                dot.className = 'snapdot right-dot';
                dot.dataset.prop = prop;
                item.appendChild(dot);

                // Pointer down listener to start drag
                dot.addEventListener('pointerdown', (e) => this.startDrag(e, dot, false, '', prop));

                this.rightColumn.appendChild(item);
            });
        // Draw active curves after browser layout pass
        requestAnimationFrame(() => this.drawCurves());
    }

    private updatePropertyMapping(propName: string, updates: Partial<VisualMapping>) {
        if (!this.mappings || !this.currentType || !this.onUpdate) return;

        if (!this.mappings.defaultPresets) {
            this.mappings.defaultPresets = {};
        }
        if (!this.mappings.defaultPresets[this.currentType]) {
            this.mappings.defaultPresets[this.currentType] = {};
        }
        
        const preset = this.mappings.defaultPresets[this.currentType] as any;

        preset[propName] = {
            ...(preset[propName] || { source: 'constant', function: 'constant' }),
            ...updates
        };

        this.onUpdate(this.mappings);
        requestAnimationFrame(() => this.drawCurves());
    }

    private getTypesToCheck(): string[] {
        let typesToCheck: string[] = [this.currentType];
        if (this.currentType === 'global_node') {
            const nodeTypes = new Set<string>();
            this.entities.forEach(e => {
                if (e.type && e.type !== 'node') nodeTypes.add(e.type);
            });
            typesToCheck = ['global_node', ...Array.from(nodeTypes)];
        } else if (this.currentType === 'global_edge') {
            const edgeTypes = new Set<string>();
            this.relationships.forEach(r => {
                if (r.type && r.type !== 'connection') edgeTypes.add(r.type);
            });
            typesToCheck = ['global_edge', ...Array.from(edgeTypes)];
        }
        return typesToCheck;
    }

    private drawCurves() {
        // Clear previous paths
        this.svgOverlay.innerHTML = '';

        if (!this.mappings || !this.currentType) return;

        const typesToCheck = this.getTypesToCheck();

        const originalLines = new Set<string>(); // "source|prop"
        const activeLines = new Set<string>(); // "source|prop"
        const activeProps = new Set<string>(); // to keep track of overridden properties

        // 1. Gather active mappings first
        if (this.mappings && this.mappings.defaultPresets) {
            typesToCheck.forEach(t => {
                const preset = this.mappings!.defaultPresets[t];
                if (preset) {
                    Object.entries(preset).forEach(([prop, mapping]) => {
                        if (typeof mapping === 'object' && mapping !== null && 'source' in mapping) {
                            const sourceAttr = (mapping as VisualMapping).source;
                            if (sourceAttr && sourceAttr !== 'constant') {
                                activeLines.add(`${sourceAttr}|${prop}`);
                                activeProps.add(prop);
                            }
                        }
                    });
                }
            });
        }

        // 2. Gather original mappings
        if (this.originalMappings && this.originalMappings.defaultPresets) {
            typesToCheck.forEach(t => {
                const preset = this.originalMappings!.defaultPresets[t];
                if (preset) {
                    Object.entries(preset).forEach(([prop, mapping]) => {
                        if (typeof mapping === 'object' && mapping !== null && 'source' in mapping) {
                            const sourceAttr = (mapping as VisualMapping).source;
                            // Only add if not overridden by any active mapping for this property
                            if (sourceAttr && sourceAttr !== 'constant' && !activeProps.has(prop)) {
                                originalLines.add(`${sourceAttr}|${prop}`);
                            }
                        }
                    });
                }
            });
        }

        // 3. Draw original lines
        originalLines.forEach(line => {
            const [sourceAttr, prop] = line.split('|');
            this.drawCurve(sourceAttr, prop, 'mapping-curve original-curve', true, true);
        });

        // 4. Draw active lines
        activeLines.forEach(line => {
            const [sourceAttr, prop] = line.split('|');
            this.drawCurve(sourceAttr, prop, 'mapping-curve', true, false);
        });

        // 5. Update connection dots
        this.rightColumn.querySelectorAll('.snapdot').forEach(dot => {
            const prop = (dot as HTMLElement).dataset.prop;
            if (prop && !activeProps.has(prop)) {
                dot.classList.remove('connected');
            }
        });

        // Update Takeover Button visibility
        const btnTakeover = this.container.querySelector('#btnTakeoverMapping') as HTMLElement;
        if (btnTakeover) {
            const hasMappings = this.hasOriginalMappingsToTakeover();
            btnTakeover.style.display = hasMappings ? 'block' : 'none';
            if (hasMappings) {
                btnTakeover.textContent = `Übernehmen (T:${typesToCheck.length} E:${this.entities.length} O:${originalLines.size})`;
            }
        }
    }

    private hasOriginalMappingsToTakeover(): boolean {
        if (!this.originalMappings || !this.originalMappings.defaultPresets) return false;
        
        for (const type in this.originalMappings.defaultPresets) {
            const preset = this.originalMappings.defaultPresets[type] as any;
            for (const prop in preset) {
                const map = preset[prop] as VisualMapping;
                if (map && map.source && map.source !== 'constant') {
                    // Check if already in active mappings
                    const activePreset = this.mappings?.defaultPresets?.[type] as any;
                    if (!activePreset || !activePreset[prop] || (activePreset[prop] as VisualMapping).source !== map.source) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private takeoverOriginalMappings() {
        if (!this.originalMappings || !this.mappings) return;

        if (!this.mappings.defaultPresets) {
            this.mappings.defaultPresets = {};
        }

        Object.keys(this.originalMappings.defaultPresets).forEach(type => {
            if (!this.mappings!.defaultPresets[type]) {
                this.mappings!.defaultPresets[type] = {} as any;
            }
            const preset = this.originalMappings!.defaultPresets[type] as any;
            Object.keys(preset).forEach(prop => {
                const map = preset[prop] as VisualMapping;
                if (map && map.source && map.source !== 'constant') {
                    (this.mappings!.defaultPresets[type] as any)[prop] = JSON.parse(JSON.stringify(map));
                }
            });
        });

        if (this.onUpdate) {
            this.onUpdate(this.mappings);
        }
        
        this.renderColumns();
    }

    private drawCurve(sourceAttr: string, prop: string, className: string, isInteractive: boolean, isOriginal: boolean = false) {
        const leftDot = this.leftColumn.querySelector(`.snapdot[data-attr="${sourceAttr}"]`) as HTMLElement;
        const rightDot = this.rightColumn.querySelector(`.snapdot[data-prop="${prop}"]`) as HTMLElement;

        if (leftDot && rightDot) {
            if (isInteractive) {
                leftDot.classList.add('connected');
                rightDot.classList.add('connected');
            }

            const bodyRect = this.bodyContainer.getBoundingClientRect();
            const leftRect = leftDot.getBoundingClientRect();
            const rightRect = rightDot.getBoundingClientRect();

            const x1 = leftRect.left + leftRect.width / 2 - bodyRect.left;
            const y1 = leftRect.top + leftRect.height / 2 - bodyRect.top;
            const x2 = rightRect.left + rightRect.width / 2 - bodyRect.left;
            const y2 = rightRect.top + rightRect.height / 2 - bodyRect.top;

            const dx = Math.abs(x2 - x1) * 0.5;
            const dStr = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
            
            // Create a group to hold both visible path and transparent hit area
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            const visiblePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            visiblePath.setAttribute('class', className);
            visiblePath.setAttribute('d', dStr);
            
            const hitAreaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            hitAreaPath.setAttribute('class', 'mapping-curve-hitarea');
            hitAreaPath.setAttribute('d', dStr);
            hitAreaPath.style.fill = 'none';
            hitAreaPath.style.stroke = 'transparent';
            hitAreaPath.style.strokeWidth = '20';
            hitAreaPath.style.pointerEvents = 'stroke';
            
            group.appendChild(visiblePath);
            group.appendChild(hitAreaPath);

            if (isInteractive) {
                group.style.cursor = 'pointer';
                
                // Hover effect simulation
                group.addEventListener('mouseenter', () => {
                    visiblePath.style.stroke = '#00aaff';
                    visiblePath.style.strokeWidth = '3';
                });
                group.addEventListener('mouseleave', () => {
                    visiblePath.style.stroke = '';
                    visiblePath.style.strokeWidth = '';
                });

                // Click path to disconnect
                group.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (isOriginal) {
                        this.disconnectOriginalMapping(prop);
                    } else {
                        this.disconnectMapping(prop);
                    }
                });
            }

            this.svgOverlay.appendChild(group);
        }
    }

    private startDrag(e: PointerEvent, dot: HTMLElement, isLeft: boolean, attrName: string, propName: string) {
        e.preventDefault();
        e.stopPropagation();


        // Create temporary SVG path
        const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tempPath.setAttribute('class', 'mapping-curve active-drag');
        tempPath.style.pointerEvents = 'none';
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

        if (!this.mappings.defaultPresets) {
            this.mappings.defaultPresets = {};
        }
        if (!this.mappings.defaultPresets[this.currentType]) {
            this.mappings.defaultPresets[this.currentType] = {};
        }

        const preset = this.mappings.defaultPresets[this.currentType] as any;

        let defaultFunc: any = 'linear';
        if (propName === 'color') {
            if (['type', 'id', 'category', 'label', 'domain'].includes(sourceAttr)) {
                defaultFunc = 'categorical';
            } else {
                defaultFunc = 'heatmap';
            }
        } else if (propName === 'geometry') {
            defaultFunc = 'categorical';
        } else if (propName === 'animation') {
            defaultFunc = 'pulse';
        }

        let newDomain: [number, number] | undefined = undefined;
        if (sourceAttr !== 'constant') {
            newDomain = this.getAttributeDataBounds(sourceAttr);
        }

        const isPosition = ['positionX', 'positionY', 'positionZ'].includes(propName);
        const defaultRange: [number, number] = isPosition ? [-100, 100] : [0.1, 3.0];

        const existingMapping = preset[propName] || { source: 'constant', function: 'constant' };

        // Update mapping source and function
        let updates: any = {
            ...existingMapping,
            source: sourceAttr,
            function: sourceAttr === 'constant' ? 'constant' : defaultFunc,
            domain: existingMapping.domain || newDomain,
            range: existingMapping.range || defaultRange
        };

        if (defaultFunc === 'categorical' && propName === 'color') {
            const uniqueValues = this.getAttributeUniqueValues(sourceAttr);
            const palette = existingMapping.palette || 'all';
            updates.palette = palette;
            updates.params = { ...(existingMapping.params || {}), categories: this.generateCategoricalColors(uniqueValues, palette) };
        }

        preset[propName] = updates;

        // Auto-expand connected mapping property
        this.expandedProps.add(propName);

        this.onUpdate(this.mappings);
    }

    private getAttributeDataBounds(source: string): [number, number] {
        const isEntityType = this.currentCategory === 'entities';
        const currentDataItems = isEntityType ? this.entities : this.relationships;
        const values: number[] = [];

        currentDataItems.forEach(item => {
            if (this.currentType === 'global_node' || this.currentType === 'global_edge' || item.type === this.currentType) {
                const val = parseFloat(this.getNestedValue(item, source));
                if (!isNaN(val)) {
                    values.push(val);
                }
            }
        });

        if (values.length === 0) return [0, 100];
        const min = Math.min(...values);
        const max = Math.max(...values);
        if (min === max) return [min - 10, min + 10];
        return [min, max];
    }

    private getAttributeUniqueValues(source: string): string[] {
        const isEntityType = this.currentCategory === 'entities';
        const currentDataItems = isEntityType ? this.entities : this.relationships;
        const values = new Set<string>();

        currentDataItems.forEach(item => {
            if (this.currentType === 'global_node' || this.currentType === 'global_edge' || item.type === this.currentType) {
                const val = this.getNestedValue(item, source);
                if (val !== undefined && val !== null) {
                    values.add(String(val));
                }
            }
        });

        return Array.from(values).sort();
    }

    private generateCategoricalColors(values: string[], spectrum: string): Record<string, string> {
        const categories: Record<string, string> = {};
        const count = values.length;
        
        // Handle pre-defined discrete palettes
        const discretePalettes: Record<string, number[]> = {
            'category10': [
                0x1f77b4, 0xff7f0e, 0x2ca02c, 0xd62728, 0x9467bd, 
                0x8c564b, 0xe377c2, 0x7f7f7f, 0xbcbd22, 0x17becf
            ],
            'category20': [
                0x1f77b4, 0xaec7e8, 0xff7f0e, 0xffbb78, 0x2ca02c, 0x98df8a, 0xd62728, 0xff9896,
                0x9467bd, 0xc5b0d5, 0x8c564b, 0xc49c94, 0xe377c2, 0xf7b6d2, 0x7f7f7f, 0xc7c7c7,
                0xbcbd22, 0xdbdb8d, 0x17becf, 0x9edae5
            ],
            'pastel': [
                0xfbb4ae, 0xb3cde3, 0xccebc5, 0xdecbe4, 0xfed9a6,
                0xffffcc, 0xe5d8bd, 0xfddaec, 0xf2f2f2
            ]
        };

        if (discretePalettes[spectrum]) {
            const colors = discretePalettes[spectrum];
            values.forEach((val, i) => {
                categories[val] = '#' + colors[i % colors.length].toString(16).padStart(6, '0');
            });
            return categories;
        }

        // Handle continuous spectrums
        values.forEach((val, i) => {
            const v = count > 1 ? i / (count - 1) : 0.5;
            let color = new THREE.Color();
            
            if (spectrum === 'blue-red' || spectrum === 'heatmap') {
                const blue = new THREE.Color(0x0000ff);
                const red = new THREE.Color(0xff0000);
                color.lerpColors(blue, red, v);
            } else if (spectrum === 'grayscale' || spectrum === 'greyscale') {
                const dark = new THREE.Color(0.2, 0.2, 0.2);
                const light = new THREE.Color(0.9, 0.9, 0.9);
                color.lerpColors(dark, light, v);
            } else if (spectrum === 'viridis') {
                color.setHSL((1.0 - v) * 0.6, 1.0, 0.5);
            } else {
                // Default 'all' / rainbow
                color.setHSL(v, 0.8, 0.5);
            }
            
            categories[val] = '#' + color.getHexString();
        });
        
        return categories;
    }

    private setupSliderDrag(
        handle: HTMLElement,
        track: HTMLElement,
        _getValue: () => number,
        setValue: (val: number) => void,
        pctToVal: (pct: number) => number,
        _valToPct: (val: number) => number,
        updateUI: () => void
    ) {
        handle.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.isDraggingSlider = true;

            const onPointerMove = (moveEvent: PointerEvent) => {
                const rect = track.getBoundingClientRect();
                let pct = (moveEvent.clientX - rect.left) / rect.width;
                pct = Math.max(0, Math.min(1, pct));
                const newVal = pctToVal(pct);
                setValue(newVal);
                updateUI();
            };

            const onPointerUp = () => {
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
                this.isDraggingSlider = false;
            };

            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
        });
    }

    private renderHorizontalWidget(details: HTMLElement, prop: string, mapping: VisualMapping) {
        if (!this.mappings || !this.onUpdate) return;
        const mode = this.selectedDesignOption[prop] || 'OptionA';
        
        const container = document.createElement('div');
        container.className = 'horizontal-widget-container';
        container.style.marginTop = '10px';
        container.style.padding = '8px';
        container.style.background = 'rgba(0,0,0,0.2)';
        container.style.borderRadius = '6px';
        container.style.border = '1px solid rgba(255,255,255,0.05)';
        
        const [absMin, absMax] = this.getAttributeDataBounds(mapping.source);
        let domMin = mapping.domain ? mapping.domain[0] : absMin;
        let domMax = mapping.domain ? mapping.domain[1] : absMax;
        let rngMin = mapping.range ? mapping.range[0] : 0.1;
        let rngMax = mapping.range ? mapping.range[1] : 3.0;
        
        const visualMin = 0.0;
        const visualMax = 5.0;

        if (mode === 'OptionA') {
            // Option A: Dual tracks
            container.innerHTML = `
                <div class="widget-track-label" style="font-size: 9px; color: var(--text-muted); text-transform: uppercase;">Domain (${absMin.toFixed(1)} bis ${absMax.toFixed(1)})</div>
                <div class="slider-track-wrapper" id="domainTrackA" style="position: relative; height: 16px; margin: 8px 0; background: rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer;">
                    <div class="slider-fill" id="domainFillA" style="position: absolute; height: 100%; background: rgba(255, 165, 0, 0.3); border-radius: 4px; width: 0%;"></div>
                    <div class="slider-handle" id="domMinHandleA" style="position: absolute; width: 12px; height: 20px; top: -2px; background: orange; border-radius: 3px; cursor: ew-resize; border: 1px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>
                    <div class="slider-handle" id="domMaxHandleA" style="position: absolute; width: 12px; height: 20px; top: -2px; background: orange; border-radius: 3px; cursor: ew-resize; border: 1px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>
                </div>
                <div class="widget-values" style="display: flex; justify-content: space-between; font-size: 9px; color: orange; margin-bottom: 8px;">
                    <span id="domMinValA">Min: ${domMin.toFixed(1)}</span>
                    <span id="domMaxValA">Max: ${domMax.toFixed(1)}</span>
                </div>
                
                <div class="widget-track-label" style="font-size: 9px; color: var(--text-muted); text-transform: uppercase;">Mapping Range (${visualMin} bis ${visualMax})</div>
                <div class="slider-track-wrapper" id="rangeTrackA" style="position: relative; height: 16px; margin: 8px 0; background: rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer;">
                    <div class="slider-fill" id="rangeFillA" style="position: absolute; height: 100%; background: rgba(0, 170, 255, 0.3); border-radius: 4px; width: 0%;"></div>
                    <div class="slider-handle" id="rngMinHandleA" style="position: absolute; width: 12px; height: 20px; top: -2px; background: #00aaff; border-radius: 3px; cursor: ew-resize; border: 1px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>
                    <div class="slider-handle" id="rngMaxHandleA" style="position: absolute; width: 12px; height: 20px; top: -2px; background: #00aaff; border-radius: 3px; cursor: ew-resize; border: 1px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>
                </div>
                <div class="widget-values" style="display: flex; justify-content: space-between; font-size: 9px; color: #00aaff;">
                    <span id="rngMinValA">Min: ${rngMin.toFixed(2)}</span>
                    <span id="rngMaxValA">Max: ${rngMax.toFixed(2)}</span>
                </div>
            `;

            // Setup interactions
            const domTrack = container.querySelector('#domainTrackA') as HTMLElement;
            const domFill = container.querySelector('#domainFillA') as HTMLElement;
            const domMinHandle = container.querySelector('#domMinHandleA') as HTMLElement;
            const domMaxHandle = container.querySelector('#domMaxHandleA') as HTMLElement;
            const domMinValText = container.querySelector('#domMinValA') as HTMLElement;
            const domMaxValText = container.querySelector('#domMaxValA') as HTMLElement;

            const updateDomUI = () => {
                const minPct = Math.max(0, Math.min(1, (domMin - absMin) / (absMax - absMin)));
                const maxPct = Math.max(0, Math.min(1, (domMax - absMin) / (absMax - absMin)));
                domMinHandle.style.left = `calc(${minPct * 100}% - 6px)`;
                domMaxHandle.style.left = `calc(${maxPct * 100}% - 6px)`;
                domFill.style.left = `${minPct * 100}%`;
                domFill.style.width = `${(maxPct - minPct) * 100}%`;
                domMinValText.textContent = `Min: ${domMin.toFixed(1)}`;
                domMaxValText.textContent = `Max: ${domMax.toFixed(1)}`;
            };
            updateDomUI();

            this.setupSliderDrag(
                domMinHandle,
                domTrack,
                () => domMin,
                (val) => {
                    domMin = Math.min(val, domMax);
                    this.updatePropertyMapping(prop, { domain: [domMin, domMax] });
                },
                (pct) => absMin + pct * (absMax - absMin),
                (val) => (val - absMin) / (absMax - absMin),
                updateDomUI
            );

            this.setupSliderDrag(
                domMaxHandle,
                domTrack,
                () => domMax,
                (val) => {
                    domMax = Math.max(val, domMin);
                    this.updatePropertyMapping(prop, { domain: [domMin, domMax] });
                },
                (pct) => absMin + pct * (absMax - absMin),
                (val) => (val - absMin) / (absMax - absMin),
                updateDomUI
            );

            // Range
            const rngTrack = container.querySelector('#rangeTrackA') as HTMLElement;
            const rngFill = container.querySelector('#rangeFillA') as HTMLElement;
            const rngMinHandle = container.querySelector('#rngMinHandleA') as HTMLElement;
            const rngMaxHandle = container.querySelector('#rngMaxHandleA') as HTMLElement;
            const rngMinValText = container.querySelector('#rngMinValA') as HTMLElement;
            const rngMaxValText = container.querySelector('#rngMaxValA') as HTMLElement;

            const updateRngUI = () => {
                const minPct = Math.max(0, Math.min(1, (rngMin - visualMin) / (visualMax - visualMin)));
                const maxPct = Math.max(0, Math.min(1, (rngMax - visualMin) / (visualMax - visualMin)));
                rngMinHandle.style.left = `calc(${minPct * 100}% - 6px)`;
                rngMaxHandle.style.left = `calc(${maxPct * 100}% - 6px)`;
                rngFill.style.left = `${minPct * 100}%`;
                rngFill.style.width = `${(maxPct - minPct) * 100}%`;
                rngMinValText.textContent = `Min: ${rngMin.toFixed(2)}`;
                rngMaxValText.textContent = `Max: ${rngMax.toFixed(2)}`;
            };
            updateRngUI();

            this.setupSliderDrag(
                rngMinHandle,
                rngTrack,
                () => rngMin,
                (val) => {
                    rngMin = Math.min(val, rngMax);
                    this.updatePropertyMapping(prop, { range: [rngMin, rngMax] });
                },
                (pct) => visualMin + pct * (visualMax - visualMin),
                (val) => (val - visualMin) / (visualMax - visualMin),
                updateRngUI
            );

            this.setupSliderDrag(
                rngMaxHandle,
                rngTrack,
                () => rngMax,
                (val) => {
                    rngMax = Math.max(val, rngMin);
                    this.updatePropertyMapping(prop, { range: [rngMin, rngMax] });
                },
                (pct) => visualMin + pct * (visualMax - visualMin),
                (val) => (val - visualMin) / (visualMax - visualMin),
                updateRngUI
            );
        } else if (mode === 'OptionB') {
            // Option B: Unified Quad Handles on a Single Track
            container.innerHTML = `
                <div class="widget-track-label" style="font-size: 9px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Vereinte Schiene (Orange=Domain, Blau=Mapping)</div>
                <div class="slider-track-wrapper" id="unifiedTrackB" style="position: relative; height: 24px; margin: 8px 0; background: rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer; border: 1px solid rgba(255,255,255,0.05);">
                    <!-- Domain Fill (top half) -->
                    <div id="domainFillB" style="position: absolute; height: 50%; top: 0; background: rgba(255, 165, 0, 0.25); border-top-left-radius: 4px; border-top-right-radius: 4px; width: 0%;"></div>
                    <!-- Range Fill (bottom half) -->
                    <div id="rangeFillB" style="position: absolute; height: 50%; bottom: 0; background: rgba(0, 170, 255, 0.25); border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; width: 0%;"></div>
                    
                    <!-- Middle divider line -->
                    <div style="position: absolute; width: 100%; height: 1px; top: 12px; background: rgba(255,255,255,0.15);"></div>

                    <!-- Domain Handles -->
                    <div class="slider-handle" id="domMinHandleB" style="position: absolute; width: 10px; height: 12px; top: 0px; background: orange; border-radius: 2px; cursor: ew-resize; border: 1px solid #fff; z-index: 12;"></div>
                    <div class="slider-handle" id="domMaxHandleB" style="position: absolute; width: 10px; height: 12px; top: 0px; background: orange; border-radius: 2px; cursor: ew-resize; border: 1px solid #fff; z-index: 12;"></div>
                    
                    <!-- Range Handles -->
                    <div class="slider-handle" id="rngMinHandleB" style="position: absolute; width: 10px; height: 12px; bottom: 0px; background: #00aaff; border-radius: 2px; cursor: ew-resize; border: 1px solid #fff; z-index: 11;"></div>
                    <div class="slider-handle" id="rngMaxHandleB" style="position: absolute; width: 10px; height: 12px; bottom: 0px; background: #00aaff; border-radius: 2px; cursor: ew-resize; border: 1px solid #fff; z-index: 11;"></div>
                </div>
                <div class="widget-values" style="display: flex; flex-direction: column; gap: 2px; font-size: 9px; line-height: 1.1;">
                    <div style="display: flex; justify-content: space-between; color: orange;">
                        <span id="domMinValB">Domain Min: ${domMin.toFixed(1)}</span>
                        <span id="domMaxValB">Domain Max: ${domMax.toFixed(1)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; color: #00aaff;">
                        <span id="rngMinValB">Mapping Min: ${rngMin.toFixed(2)}</span>
                        <span id="rngMaxValB">Mapping Max: ${rngMax.toFixed(2)}</span>
                    </div>
                </div>
            `;

            const track = container.querySelector('#unifiedTrackB') as HTMLElement;
            const domFill = container.querySelector('#domainFillB') as HTMLElement;
            const rngFill = container.querySelector('#rangeFillB') as HTMLElement;
            const domMinHandle = container.querySelector('#domMinHandleB') as HTMLElement;
            const domMaxHandle = container.querySelector('#domMaxHandleB') as HTMLElement;
            const rngMinHandle = container.querySelector('#rngMinHandleB') as HTMLElement;
            const rngMaxHandle = container.querySelector('#rngMaxHandleB') as HTMLElement;
            
            const domMinValText = container.querySelector('#domMinValB') as HTMLElement;
            const domMaxValText = container.querySelector('#domMaxValB') as HTMLElement;
            const rngMinValText = container.querySelector('#rngMinValB') as HTMLElement;
            const rngMaxValText = container.querySelector('#rngMaxValB') as HTMLElement;

            const updateUI = () => {
                const dMinPct = Math.max(0, Math.min(1, (domMin - absMin) / (absMax - absMin)));
                const dMaxPct = Math.max(0, Math.min(1, (domMax - absMin) / (absMax - absMin)));
                domMinHandle.style.left = `calc(${dMinPct * 100}% - 5px)`;
                domMaxHandle.style.left = `calc(${dMaxPct * 100}% - 5px)`;
                domFill.style.left = `${dMinPct * 100}%`;
                domFill.style.width = `${(dMaxPct - dMinPct) * 100}%`;

                const rMinPct = Math.max(0, Math.min(1, (rngMin - visualMin) / (visualMax - visualMin)));
                const rMaxPct = Math.max(0, Math.min(1, (rngMax - visualMin) / (visualMax - visualMin)));
                rngMinHandle.style.left = `calc(${rMinPct * 100}% - 5px)`;
                rngMaxHandle.style.left = `calc(${rMaxPct * 100}% - 5px)`;
                rngFill.style.left = `${rMinPct * 100}%`;
                rngFill.style.width = `${(rMaxPct - rMinPct) * 100}%`;

                domMinValText.textContent = `Domain Min: ${domMin.toFixed(1)}`;
                domMaxValText.textContent = `Domain Max: ${domMax.toFixed(1)}`;
                rngMinValText.textContent = `Mapping Min: ${rngMin.toFixed(2)}`;
                rngMaxValText.textContent = `Mapping Max: ${rngMax.toFixed(2)}`;
            };
            updateUI();

            this.setupSliderDrag(
                domMinHandle,
                track,
                () => domMin,
                (val) => {
                    domMin = Math.min(val, domMax);
                    this.updatePropertyMapping(prop, { domain: [domMin, domMax] });
                },
                (pct) => absMin + pct * (absMax - absMin),
                (val) => (val - absMin) / (absMax - absMin),
                updateUI
            );

            this.setupSliderDrag(
                domMaxHandle,
                track,
                () => domMax,
                (val) => {
                    domMax = Math.max(val, domMin);
                    this.updatePropertyMapping(prop, { domain: [domMin, domMax] });
                },
                (pct) => absMin + pct * (absMax - absMin),
                (val) => (val - absMin) / (absMax - absMin),
                updateUI
            );

            this.setupSliderDrag(
                rngMinHandle,
                track,
                () => rngMin,
                (val) => {
                    rngMin = Math.min(val, rngMax);
                    this.updatePropertyMapping(prop, { range: [rngMin, rngMax] });
                },
                (pct) => visualMin + pct * (visualMax - visualMin),
                (val) => (val - visualMin) / (visualMax - visualMin),
                updateUI
            );

            this.setupSliderDrag(
                rngMaxHandle,
                track,
                () => rngMax,
                (val) => {
                    rngMax = Math.max(val, rngMin);
                    this.updatePropertyMapping(prop, { range: [rngMin, rngMax] });
                },
                (pct) => visualMin + pct * (visualMax - visualMin),
                (val) => (val - visualMin) / (visualMax - visualMin),
                updateUI
            );
        } else if (mode === 'OptionC') {
            // Option C: Density Histogram / Sparkline Overlay
            const isEntityType = this.dataModel?.entities?.[this.currentType] !== undefined;
            const currentDataItems = isEntityType ? this.entities : this.relationships;
            const bins = new Array(10).fill(0);
            let maxBinCount = 1;

            currentDataItems.forEach(item => {
                if (item.type === this.currentType) {
                    const val = parseFloat(this.getNestedValue(item, mapping.source));
                    if (!isNaN(val)) {
                        const pct = (absMax > absMin) ? (val - absMin) / (absMax - absMin) : 0.5;
                        const binIdx = Math.max(0, Math.min(9, Math.floor(pct * 10)));
                        bins[binIdx]++;
                    }
                }
            });
            maxBinCount = Math.max(1, ...bins);

            // Generate sparkline path points
            let pointsStr = '';
            const width = 460; // Approximate visualizer width
            const height = 30; // Sparkline height
            bins.forEach((count, idx) => {
                const x = (idx / 9) * width;
                const y = height - (count / maxBinCount) * height * 0.9;
                pointsStr += `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
            });
            const fillPointsStr = `${pointsStr} L ${width} ${height} L 0 ${height} Z`;

            container.innerHTML = `
                <div class="widget-track-label" style="font-size: 9px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Dichteverteilung & Bereichsauswahl</div>
                <div style="position: relative; width: 100%; height: 50px; background: rgba(0,0,0,0.3); border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
                    <!-- Sparkline SVG -->
                    <svg viewBox="0 0 460 30" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 30px; pointer-events: none;">
                        <path d="${fillPointsStr}" fill="rgba(255, 165, 0, 0.08)" stroke="rgba(255, 165, 0, 0.4)" stroke-width="1.5" />
                    </svg>

                    <!-- Domain Track (over sparkline, vertically centered) -->
                    <div id="domainTrackC" style="position: absolute; top: 22px; left: 0; width: 100%; height: 8px; background: rgba(255,255,255,0.08); cursor: pointer;">
                        <div id="domainFillC" style="position: absolute; height: 100%; background: rgba(255, 165, 0, 0.25); width: 0%;"></div>
                        <div class="slider-handle" id="domMinHandleC" style="position: absolute; width: 10px; height: 14px; top: -3px; background: orange; border-radius: 2px; cursor: ew-resize; border: 1px solid #fff; z-index: 12;"></div>
                        <div class="slider-handle" id="domMaxHandleC" style="position: absolute; width: 10px; height: 14px; top: -3px; background: orange; border-radius: 2px; cursor: ew-resize; border: 1px solid #fff; z-index: 12;"></div>
                    </div>

                    <!-- Range Track (below sparkline) -->
                    <div id="rangeTrackC" style="position: absolute; bottom: 4px; left: 0; width: 100%; height: 8px; background: rgba(255,255,255,0.08); cursor: pointer;">
                        <div id="rangeFillC" style="position: absolute; height: 100%; background: rgba(0, 170, 255, 0.25); width: 0%;"></div>
                        <div class="slider-handle" id="rngMinHandleC" style="position: absolute; width: 10px; height: 14px; top: -3px; background: #00aaff; border-radius: 2px; cursor: ew-resize; border: 1px solid #fff; z-index: 11;"></div>
                        <div class="slider-handle" id="rngMaxHandleC" style="position: absolute; width: 10px; height: 14px; top: -3px; background: #00aaff; border-radius: 2px; cursor: ew-resize; border: 1px solid #fff; z-index: 11;"></div>
                    </div>
                </div>
                <div class="widget-values" style="display: flex; flex-direction: column; gap: 2px; font-size: 9px; line-height: 1.1; margin-top: 6px;">
                    <div style="display: flex; justify-content: space-between; color: orange;">
                        <span id="domMinValC">Domain Min: ${domMin.toFixed(1)}</span>
                        <span id="domMaxValC">Domain Max: ${domMax.toFixed(1)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; color: #00aaff;">
                        <span id="rngMinValC">Mapping Min: ${rngMin.toFixed(2)}</span>
                        <span id="rngMaxValC">Mapping Max: ${rngMax.toFixed(2)}</span>
                    </div>
                </div>
            `;

            const domTrack = container.querySelector('#domainTrackC') as HTMLElement;
            const domFill = container.querySelector('#domainFillC') as HTMLElement;
            const domMinHandle = container.querySelector('#domMinHandleC') as HTMLElement;
            const domMaxHandle = container.querySelector('#domMaxHandleC') as HTMLElement;

            const rngTrack = container.querySelector('#rangeTrackC') as HTMLElement;
            const rngFill = container.querySelector('#rangeFillC') as HTMLElement;
            const rngMinHandle = container.querySelector('#rngMinHandleC') as HTMLElement;
            const rngMaxHandle = container.querySelector('#rngMaxHandleC') as HTMLElement;

            const domMinValText = container.querySelector('#domMinValC') as HTMLElement;
            const domMaxValText = container.querySelector('#domMaxValC') as HTMLElement;
            const rngMinValText = container.querySelector('#rngMinValC') as HTMLElement;
            const rngMaxValText = container.querySelector('#rngMaxValC') as HTMLElement;

            const updateUI = () => {
                const dMinPct = Math.max(0, Math.min(1, (domMin - absMin) / (absMax - absMin)));
                const dMaxPct = Math.max(0, Math.min(1, (domMax - absMin) / (absMax - absMin)));
                domMinHandle.style.left = `calc(${dMinPct * 100}% - 5px)`;
                domMaxHandle.style.left = `calc(${dMaxPct * 100}% - 5px)`;
                domFill.style.left = `${dMinPct * 100}%`;
                domFill.style.width = `${(dMaxPct - dMinPct) * 100}%`;

                const rMinPct = Math.max(0, Math.min(1, (rngMin - visualMin) / (visualMax - visualMin)));
                const rMaxPct = Math.max(0, Math.min(1, (rngMax - visualMin) / (visualMax - visualMin)));
                rngMinHandle.style.left = `calc(${rMinPct * 100}% - 5px)`;
                rngMaxHandle.style.left = `calc(${rMaxPct * 100}% - 5px)`;
                rngFill.style.left = `${rMinPct * 100}%`;
                rngFill.style.width = `${(rMaxPct - rMinPct) * 100}%`;

                domMinValText.textContent = `Domain Min: ${domMin.toFixed(1)}`;
                domMaxValText.textContent = `Domain Max: ${domMax.toFixed(1)}`;
                rngMinValText.textContent = `Mapping Min: ${rngMin.toFixed(2)}`;
                rngMaxValText.textContent = `Mapping Max: ${rngMax.toFixed(2)}`;
            };
            updateUI();

            this.setupSliderDrag(
                domMinHandle,
                domTrack,
                () => domMin,
                (val) => {
                    domMin = Math.min(val, domMax);
                    this.updatePropertyMapping(prop, { domain: [domMin, domMax] });
                },
                (pct) => absMin + pct * (absMax - absMin),
                (val) => (val - absMin) / (absMax - absMin),
                updateUI
            );

            this.setupSliderDrag(
                domMaxHandle,
                domTrack,
                () => domMax,
                (val) => {
                    domMax = Math.max(val, domMin);
                    this.updatePropertyMapping(prop, { domain: [domMin, domMax] });
                },
                (pct) => absMin + pct * (absMax - absMin),
                (val) => (val - absMin) / (absMax - absMin),
                updateUI
            );

            this.setupSliderDrag(
                rngMinHandle,
                rngTrack,
                () => rngMin,
                (val) => {
                    rngMin = Math.min(val, rngMax);
                    this.updatePropertyMapping(prop, { range: [rngMin, rngMax] });
                },
                (pct) => visualMin + pct * (visualMax - visualMin),
                (val) => (val - visualMin) / (visualMax - visualMin),
                updateUI
            );

            this.setupSliderDrag(
                rngMaxHandle,
                rngTrack,
                () => rngMax,
                (val) => {
                    rngMax = Math.max(val, rngMin);
                    this.updatePropertyMapping(prop, { range: [rngMin, rngMax] });
                },
                (pct) => visualMin + pct * (visualMax - visualMin),
                (val) => (val - visualMin) / (visualMax - visualMin),
                updateUI
            );
        }

        details.appendChild(container);
    }

    private disconnectOriginalMapping(propName: string) {
        if (!this.originalMappings || !this.currentType) return;

        const typesToModify = this.getTypesToCheck();

        typesToModify.forEach(t => {
            const preset = this.originalMappings!.defaultPresets[t] as any;
            if (preset && preset[propName]) {
                delete preset[propName];
            }
        });
        
        this.drawCurves();
    }

    private disconnectMapping(propName: string) {
        if (!this.mappings || !this.currentType || !this.onUpdate) return;

        const typesToModify = this.getTypesToCheck();

        typesToModify.forEach(t => {
            const preset = this.mappings!.defaultPresets[t] as any;
            if (preset && preset[propName]) {
                // Reset to constant source
                preset[propName] = {
                    ...preset[propName],
                    source: 'constant',
                    function: 'constant'
                };
            }
        });

        // Auto-collapse disconnected property
        this.expandedProps.delete(propName);

        this.onUpdate(this.mappings);
    }
}
