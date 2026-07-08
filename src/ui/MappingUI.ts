import {
    VisualMappings,
    VisualMapping,
    DataModel
} from '../types';
import * as THREE from 'three';
import { PanelUtils } from '../utils/PanelUtils';
import { getPropertySchema, getEntityAttributeValue } from '../core/BuildFormatUtils';

export class MappingUI {
    private container: HTMLElement;
    private bodyContainer: HTMLElement;
    private leftColumn: HTMLElement;
    private rightColumn: HTMLElement;
    private svgOverlay: SVGSVGElement;
    private categoryTabs: HTMLElement;

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
    private userExpandedAttributes = new Set<string>();
    private userCollapsedAttributes = new Set<string>();
    private boxExpandedAttributes = new Set<string>();

    // --- Layout-Engine State ---
    private layoutCallback: ((algorithm: string, params: Record<string, number>) => Promise<void>) | null = null;
    private layoutStopCallback: (() => void) | null = null;
    private layoutEnabled = false;
    private layoutExpanded = false;
    private selectedAlgorithm = 'force-directed';
    private layoutCurrentParams: Record<string, number> = {};
    private layoutParameters: Record<string, Record<string, { min: number; max: number; default: number; step: number }>> = {
        'force-directed': {
            maxIterations: { min: 100, max: 2000, default: 500, step: 50 },
            repulsionStrength: { min: 100, max: 5000, default: 1000, step: 100 },
            attractionStrength: { min: 0.01, max: 1, default: 0.1, step: 0.01 },
            damping: { min: 0.1, max: 1, default: 0.9, step: 0.05 }
        },
        'fruchterman-reingold': {
            maxIterations: { min: 100, max: 1000, default: 500, step: 50 },
            area: { min: 100, max: 1000, default: 400, step: 50 },
            temperature: { min: 1, max: 50, default: 10, step: 1 }
        },
        'spring-embedder': {
            maxIterations: { min: 100, max: 2000, default: 1000, step: 100 },
            springConstant: { min: 0.01, max: 1, default: 0.1, step: 0.01 },
            repulsionConstant: { min: 100, max: 5000, default: 1000, step: 100 },
            damping: { min: 0.1, max: 1, default: 0.95, step: 0.05 },
            naturalLength: { min: 0.5, max: 10, default: 2, step: 0.5 }
        },
        'hierarchical': {
            levelHeight: { min: 1, max: 10, default: 3, step: 0.5 },
            nodeSpacing: { min: 0.5, max: 5, default: 2, step: 0.1 }
        },
        'tree': {
            levelHeight: { min: 1, max: 10, default: 3, step: 0.5 },
            nodeSpacing: { min: 0.5, max: 5, default: 2, step: 0.1 }
        },
        'circular': {
            radius: { min: 5, max: 50, default: 10, step: 1 },
            height: { min: -10, max: 10, default: 0, step: 0.5 }
        },
        'grid': {
            spacing: { min: 0.5, max: 10, default: 2, step: 0.1 }
        },
        'random': {
            minBound: { min: -50, max: 0, default: -10, step: 1 },
            maxBound: { min: 0, max: 50, default: 10, step: 1 }
        }
    };
    private layoutAlgorithmNames: Record<string, string> = {
        'force-directed': 'Force-Directed',
        'fruchterman-reingold': 'Fruchterman-Reingold',
        'spring-embedder': 'Spring-Embedder',
        'hierarchical': 'Hierarchisch',
        'tree': 'Baum',
        'circular': 'Kreisfoermig',
        'grid': 'Raster',
        'random': 'Zufaellig'
    };
    private layoutParamNames: Record<string, string> = {
        maxIterations: 'Max. Iterationen',
        repulsionStrength: 'Abstossungskraft',
        attractionStrength: 'Anziehungskraft',
        damping: 'Daempfung',
        area: 'Flaeche',
        temperature: 'Temperatur',
        springConstant: 'Federkonstante',
        repulsionConstant: 'Abstossungskonstante',
        naturalLength: 'Natuerliche Laenge',
        levelHeight: 'Ebenen-Hoehe',
        nodeSpacing: 'Knoten-Abstand',
        radius: 'Radius',
        height: 'Hoehe',
        spacing: 'Abstand',
        minBound: 'Min. Grenze',
        maxBound: 'Max. Grenze'
    };

    private getNestedValue(obj: any, path: string): any {
        const formatVal = getEntityAttributeValue(obj, path);
        if (formatVal !== undefined) return formatVal;
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    private isAttributeMapped(attrName: string): boolean {
        if (!this.mappings || !this.currentType) return false;
        const preset = this.mappings.defaultPresets?.[this.currentType];
        if (!preset) return false;

        return Object.values(preset).some((mapping: any) => {
            if (!mapping) return false;
            const src = mapping.field || mapping.source || '';
            return src === attrName || src.startsWith(attrName + '.');
        });
    }

    // Drag-and-Drop state
    private activeDrag: {
        startDot: HTMLElement;
        isLeft: boolean;
        sourceName: string;
        visualPropName: string;
        specificValue?: string;
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
                </span>
                <div class="mapping-toggle" id="mappingToggle">▼</div>
            </div>
            <div class="mapping-selection-area" id="mappingSelectionArea" style="display: flex; flex-direction: column; gap: 10px; padding: 10px;">
                <div style="display: flex; gap: 10px; align-items: center; width: 100%;">
                    <span id="mappingSchemaVersionBadge" style="font-size: 10px; padding: 2px 6px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; display: none;">Schema: 1</span>
                    <div class="mapping-tabs" id="categoryTabs" style="flex: 1; display: flex;">
                        <button class="mapping-tab active" data-val="entities" style="flex: 1;">Nodes</button>
                        <button class="mapping-tab" data-val="relationships" style="flex: 1;">Edges</button>
                    </div>
                </div>
            </div>
            <div class="mapping-body" id="mappingBody" style="position: relative; flex: 1; display: flex; gap: 100px; transition: gap 0.4s ease;">
                <div class="mapping-column left" id="mappingLeftCol" style="flex: 1; transition: flex 0.4s ease; position: relative; z-index: 2;">
                    <div class="mapping-column-title">Attribute (Daten)</div>
                </div>
                <div class="mapping-column right" id="mappingRightCol" style="flex: 1; transition: flex 0.4s ease; position: relative; z-index: 2;">
                    <div class="mapping-column-title">Visualisierung</div>
                </div>
                <svg class="mapping-svg-overlay" id="mappingSvg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;"></svg>
            </div>
        `;

        this.bodyContainer = this.container.querySelector('#mappingBody') as HTMLElement;
        this.leftColumn = this.container.querySelector('#mappingLeftCol') as HTMLElement;
        this.rightColumn = this.container.querySelector('#mappingRightCol') as HTMLElement;
        this.svgOverlay = this.container.querySelector('#mappingSvg') as SVGSVGElement;
        this.categoryTabs = this.container.querySelector('#categoryTabs') as HTMLElement;

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

        // The Type Tabs have their own click listeners attached during render

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

        // Removed Auto-Takeover as requested by the user

        const btnTakeover = this.container.querySelector('#btnTakeoverMapping') as HTMLButtonElement;
        if (btnTakeover) {
            if (this.hasOriginalMappingsToTakeover()) {
                btnTakeover.style.display = 'block';
            } else {
                btnTakeover.style.display = 'none';
            }
        }

        // Sync category if we already have a type selected
        if (!this.currentType) {
            this.currentType = this.currentCategory === 'entities' ? 'global_node' : 'global_edge';
        } else if (this.currentType === 'global_node') {
            this.currentCategory = 'entities';
        } else if (this.currentType === 'global_edge') {
            this.currentCategory = 'relationships';
        } else {
            const isKnownRel = relationships.some(r => r.type === this.currentType);
            if (isKnownRel) {
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
        this.container.style.height = 'auto'; // Reset to auto height for new files
        const toggleBtn = this.container.querySelector('#mappingToggle') as HTMLElement;
        if (toggleBtn) toggleBtn.textContent = '▼';

        this.renderColumns();
        
        requestAnimationFrame(() => this.adjustHeightAndMinimap());
    }

    private activeColumn: 'left' | 'right' | null = null;
    private activeTileId: string | null = null;

    private animateCurves() {
        let start = performance.now();
        const animate = (time: number) => {
            this.drawCurves();
            if (time - start < 450) { // 400ms transition + 50ms buffer
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    private adjustHeightAndMinimap() {
        if (!this.container || this.container.classList.contains('collapsed')) return;
        
        // Give the DOM a moment to reflow if needed
        setTimeout(() => {
            const rect = this.container.getBoundingClientRect();
            // Assuming top: 10px. Minimap is at bottom: 20px, left: 10px. Minimap height ~280px with header.
            // Screen height minus bottom 300px is where overlap starts.
            if (rect.bottom > window.innerHeight - 300) {
                const minimap = document.getElementById('minimapContainer');
                if (minimap && !minimap.classList.contains('collapsed')) {
                    minimap.classList.add('collapsed');
                    const toggle = minimap.querySelector('#minimapToggle');
                    if (toggle) toggle.textContent = '▲';
                }
            }
        }, 50);
    }

    private updateColumnWidths() {
        if (!this.leftColumn || !this.rightColumn || !this.bodyContainer) return;
        
        if (this.activeColumn === 'left') {
            this.leftColumn.style.flex = '4';
            this.rightColumn.style.flex = '1';
            this.bodyContainer.style.gap = '20px';
        } else if (this.activeColumn === 'right') {
            this.leftColumn.style.flex = '1';
            this.rightColumn.style.flex = '4';
            this.bodyContainer.style.gap = '20px';
        } else {
            this.leftColumn.style.flex = '1';
            this.rightColumn.style.flex = '1';
            this.bodyContainer.style.gap = '100px';
        }
        this.animateCurves();
    }

    public updateSchema(schemaVersion: string) {
        const badge = this.container.querySelector('#mappingSchemaVersionBadge') as HTMLElement;
        if (badge) {
            badge.textContent = schemaVersion.includes('Build') ? schemaVersion : `Schema: ${schemaVersion}`;
            badge.style.display = 'inline-block';
        }
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
            
            const typesToCheck = this.getTypesToCheck();
            
            // 1. Search for active dynamic mappings
            for (const t of typesToCheck) {
                const am = (this.mappings!.defaultPresets as any)[t]?.[prop] as VisualMapping;
                if (am && am.source && am.source !== 'constant') return am;
            }
            
            // 2. Search for original dynamic mappings
            if (this.originalMappings && this.originalMappings.defaultPresets) {
                for (const t of typesToCheck) {
                    const om = (this.originalMappings.defaultPresets as any)[t]?.[prop] as VisualMapping;
                    if (om && om.source && om.source !== 'constant') return om;
                }
            }

            // 3. Fallback to active constant on current type
            if (mapping) return mapping;

            // 4. Fallback to active constant across types
            for (const t of typesToCheck) {
                const am = (this.mappings!.defaultPresets as any)[t]?.[prop] as VisualMapping;
                if (am) return am;
            }

            // 5. Fallback to original constant across types
            if (this.originalMappings && this.originalMappings.defaultPresets) {
                for (const t of typesToCheck) {
                    const om = (this.originalMappings.defaultPresets as any)[t]?.[prop] as VisualMapping;
                    if (om) return om;
                }
            }
            
            return { source: 'constant', function: 'constant' };
        };

        // 1. Render Left Column: Attributes
        const attributes = this.availableAttributes[this.currentType] || [];
        const isEntityType = this.currentCategory === 'entities';
        const currentDataItems = isEntityType ? this.entities : this.relationships;

        attributes.forEach(attr => {
            if (attr === 'constant') return; // Hide 'constant' from the regular attribute list loop

            // Check if the unique values are actually objects (meaning this is a group)
            let isObjectGroup = false;
            let groupKeys: string[] = [];
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

            const firstVal = Array.from(uniqueValues)[0];
            if (firstVal && typeof firstVal === 'object' && !Array.isArray(firstVal)) {
                isObjectGroup = true;
                const keysSet = new Set<string>();
                uniqueValues.forEach(val => {
                    if (typeof val === 'object' && val !== null) {
                        Object.keys(val).forEach(k => keysSet.add(k));
                    }
                });
                groupKeys = Array.from(keysSet).sort();
            }

            const isMapped = this.isAttributeMapped(attr);
            const isBoxExpanded = this.boxExpandedAttributes.has(attr);
            // We'll keep isExpanded for object groups, but user interaction is now different for values
            const isExpanded = isMapped ? !this.userCollapsedAttributes.has(attr) : this.userExpandedAttributes.has(attr);

            // Haupt-Kachel fuer das Attribut erstellen
            const item = document.createElement('div');
            item.className = 'mapping-item left';
            item.dataset.attr = attr;
            if (isBoxExpanded || (isExpanded && isObjectGroup)) {
                item.style.backgroundColor = 'rgba(255,255,255,0.08)';
            }
            item.style.cursor = 'pointer';

            const labelContainer = document.createElement('div');
            labelContainer.className = 'mapping-item-label-container';
            labelContainer.style.display = 'flex';
            labelContainer.style.flexDirection = 'column';
            labelContainer.style.gap = '2px';

            const label = document.createElement('span');
            
            const isAlgorithm = attr.startsWith('algo:');
            if (isAlgorithm) {
                const algoName = attr.substring(5); // remove 'algo:'
                label.innerHTML = `<span style="color: #64ffda; margin-right: 4px;">▶</span>${algoName}`;
                item.style.borderLeft = '2px solid #64ffda';
                item.style.backgroundColor = 'rgba(100, 255, 218, 0.05)';
            } else {
                label.textContent = attr;
            }
            
            label.style.fontWeight = '500';
            labelContainer.appendChild(label);

            if (!isAlgorithm) {
                const stats = document.createElement('span');
                stats.className = 'mapping-item-stats';
                stats.style.fontSize = '9px';
                stats.style.color = 'var(--text-muted)';
                
                let statsText = `${presenceCount} • ${uniqueValues.size} Werte`;
                if (hasNumeric && minVal !== Infinity && maxVal !== -Infinity) {
                    const formatNum = (num: number) => Number.isInteger(num) ? num.toString() : num.toFixed(2);
                    statsText += ` • [${formatNum(minVal)} ... ${formatNum(maxVal)}]`;
                } else if (uniqueValues.size > 0 && !hasNumeric) {
                    statsText += ` (Text)`;
                }
                stats.textContent = statsText;
                labelContainer.appendChild(stats);
            }

            item.appendChild(labelContainer);

            // Values Container (collapsible on hover)
            let valuesContainer: HTMLElement | null = null;
            if (!isObjectGroup && uniqueValues.size > 0) {
                valuesContainer = document.createElement('div');
                valuesContainer.className = 'mapping-item-values';
                valuesContainer.style.display = 'none'; // Hidden by default, shown on hover
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

                valsArray.slice(0, 50).forEach(valOrKey => {
                    const tagContainer = document.createElement('div');
                    tagContainer.style.display = 'flex';
                    tagContainer.style.alignItems = 'center';
                    tagContainer.style.background = 'rgba(255,255,255,0.06)';
                    tagContainer.style.borderRadius = '3px';
                    tagContainer.style.padding = '2px 4px';
                    tagContainer.style.gap = '4px';

                    const tag = document.createElement('span');
                    const displayVal = String(valOrKey);
                    tag.textContent = displayVal.length > 30 ? displayVal.substring(0, 27) + '...' : displayVal;

                    const valDot = document.createElement('div');
                    valDot.className = 'snapdot left-dot sub-dot';
                    valDot.dataset.attr = attr;
                    valDot.dataset.val = displayVal;
                    
                    valDot.style.cssText = `
                        width: 6px;
                        height: 6px;
                        background-color: var(--accent-color);
                        border-radius: 50%;
                        cursor: grab;
                        flex-shrink: 0;
                        opacity: 0.5;
                    `;

                    valDot.addEventListener('pointerdown', (e) => {
                        e.stopPropagation();
                        this.startDrag(e, valDot, true, attr, '', displayVal);
                    });

                    tagContainer.appendChild(tag);
                    tagContainer.appendChild(valDot);
                    valsList.appendChild(tagContainer);
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
            }

            // Hover event to expand tags
            item.addEventListener('mouseenter', () => {
                if (valuesContainer && !isBoxExpanded) {
                    valuesContainer.style.display = 'block';
                }
            });
            item.addEventListener('mouseleave', () => {
                if (valuesContainer && !isBoxExpanded) {
                    valuesContainer.style.display = 'none';
                }
            });

            // Klick-Event fuer das Haupt-Item
            item.addEventListener('click', (e) => {
                if ((e.target as HTMLElement).classList.contains('snapdot')) return;

                if (isObjectGroup) {
                    if (isExpanded) {
                        if (isMapped) {
                            this.userCollapsedAttributes.add(attr);
                        } else {
                            this.userExpandedAttributes.delete(attr);
                        }
                    } else {
                        if (isMapped) {
                            this.userCollapsedAttributes.delete(attr);
                        } else {
                            this.userExpandedAttributes.clear();
                            this.userExpandedAttributes.add(attr);
                        }
                    }
                } else {
                    if (isBoxExpanded) {
                        this.boxExpandedAttributes.delete(attr);
                    } else {
                        this.boxExpandedAttributes.add(attr);
                        if (valuesContainer) valuesContainer.style.display = 'none'; // hide tags when boxes are shown
                    }
                }
                
                this.renderColumns();
            });

            item.appendChild(labelContainer);

            const dot = document.createElement('div');
            dot.className = 'snapdot left-dot';
            dot.dataset.attr = attr;
            item.appendChild(dot);

            // Pointer down listener to start drag
            dot.addEventListener('pointerdown', (e) => this.startDrag(e, dot, true, attr, ''));

            this.leftColumn.appendChild(item);

            // WICHTIG: Wenn es eine Objektgruppe ist und aufgeklappt, rendern wir die Unterkacheln direkt als Geschwister!
            // ODER wenn es ein normales Attribut ist und isBoxExpanded wahr ist!
            if ((isObjectGroup && isExpanded) || (!isObjectGroup && isBoxExpanded)) {
                const subItemsList = isObjectGroup ? groupKeys : Array.from(uniqueValues).sort().slice(0, 50);
                
                subItemsList.forEach(valOrKey => {
                    const subAttr = isObjectGroup ? `${attr}.${valOrKey}` : attr;
                    const displayVal = String(valOrKey);

                    const subItem = document.createElement('div');
                    subItem.className = 'mapping-item left mapping-sub-item';
                    subItem.dataset.attr = subAttr;
                    if (!isObjectGroup) {
                        subItem.dataset.val = displayVal;
                    }
                    
                    subItem.style.cssText = `
                        margin-left: 15px;
                        width: calc(100% - 35px);
                        border-left: 2px solid var(--accent-color);
                        background: rgba(255, 255, 255, 0.02);
                        padding: 4px 8px;
                        border-radius: 4px;
                        border-top: 1px solid rgba(255, 255, 255, 0.05);
                        border-right: 1px solid rgba(255, 255, 255, 0.05);
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                        font-size: 11px;
                        min-height: 20px;
                        flex-shrink: 0;
                        position: relative;
                        box-sizing: border-box;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        transition: all 0.2s ease;
                    `;

                    subItem.onmouseover = () => {
                        subItem.style.background = 'rgba(255, 255, 255, 0.05)';
                        subItem.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    };
                    subItem.onmouseout = () => {
                        subItem.style.background = 'rgba(255, 255, 255, 0.02)';
                        subItem.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    };

                    const subLabelContainer = document.createElement('div');
                    subLabelContainer.style.display = 'flex';
                    subLabelContainer.style.flexDirection = 'column';
                    subLabelContainer.style.gap = '2px';

                    const subLabel = document.createElement('span');
                    subLabel.style.fontWeight = '500';
                    subLabel.textContent = isObjectGroup ? `.${displayVal}` : `= ${displayVal}`;
                    subLabelContainer.appendChild(subLabel);

                    if (isObjectGroup) {
                        let subPresenceCount = 0;
                        const uniqueSubValues = new Set<any>();
                        let minVal = Infinity;
                        let maxVal = -Infinity;
                        let hasNumeric = false;

                        currentDataItems.forEach(dItem => {
                            if (this.currentType === 'global_node' || this.currentType === 'global_edge' || dItem.type === this.currentType) {
                                const val = this.getNestedValue(dItem, subAttr);
                                if (val !== undefined && val !== null) {
                                    subPresenceCount++;
                                    uniqueSubValues.add(val);
                                    if (typeof val === 'number') {
                                        hasNumeric = true;
                                        if (val < minVal) minVal = val;
                                        if (val > maxVal) maxVal = val;
                                    }
                                }
                            }
                        });

                        if (subPresenceCount > 0) {
                            const subStats = document.createElement('span');
                            subStats.style.fontSize = '9px';
                            subStats.style.color = 'var(--text-muted)';
                            if (hasNumeric && minVal !== Infinity && maxVal !== -Infinity) {
                                const formatNum = (num: number) => Number.isInteger(num) ? num.toString() : num.toFixed(1);
                                subStats.textContent = `[${formatNum(minVal)}...${formatNum(maxVal)}]`;
                            } else {
                                subStats.textContent = `${uniqueSubValues.size} W`;
                            }
                            subLabelContainer.appendChild(subStats);
                        }
                    }

                    subItem.appendChild(subLabelContainer);

                    const subDot = document.createElement('div');
                    subDot.className = 'snapdot left-dot sub-dot';
                    subDot.dataset.attr = subAttr;
                    if (!isObjectGroup) {
                        subDot.dataset.val = displayVal;
                    }
                    subItem.appendChild(subDot);

                    subDot.addEventListener('pointerdown', (e) => {
                        e.stopPropagation();
                        this.startDrag(e, subDot, true, subAttr, '', isObjectGroup ? '' : displayVal);
                    });

                    this.leftColumn.appendChild(subItem);
                });
            }
        });

        // 2. Render Right Column: Visual Properties
        
        const isEntity = this.currentCategory === 'entities';
        const baseVisualProps = isEntity
            ? ['position', 'positionX', 'positionY', 'positionZ', 'size', 'color', 'geometry', 'glow', 'animation', 'attraction', 'repulsion', 'inertia']
            : ['thickness', 'color', 'curvature', 'glow', 'opacity', 'animation_flow', 'animation_sequential', 'animation_pulse', 'animation_segments'];

        const visualProps: string[] = [];
        baseVisualProps.forEach(prop => {
            // Include base prop
            visualProps.push(prop);
            
            // Check if mapped, and append additional unmapped slots
            let i = 1;
            while (true) {
                const currentProp = i === 1 ? prop : `${prop}_${i-1}`;
                const mapping = getEffectiveMapping(currentProp);
                const isConnected = mapping && mapping.source && mapping.source !== 'constant';
                if (isConnected) {
                    const nextProp = `${prop}_${i}`;
                    visualProps.push(nextProp);
                    i++;
                } else {
                    break;
                }
            }
        });

            const propTranslations: Record<string, string> = {
                position: 'Position',
                positionX: 'Position X',
                positionY: 'Position Y',
                positionZ: 'Position Z',
                size: 'Größe',
                color: 'Farbe',
                geometry: 'Geometrie',
                glow: 'Leuchten',
                animation: 'Animation',
                animation_flow: 'Anim: Lauflicht (Flow)',
                animation_sequential: 'Anim: Welle (Sequential)',
                animation_pulse: 'Anim: Puls (Pulse)',
                animation_segments: 'Anim: Segmente',
                thickness: 'Linienstärke',
                curvature: 'Krümmung',
                opacity: 'Deckkraft',
                attraction: 'Anziehungskraft (Pull)',
                repulsion: 'Abstoßungskraft (Push)',
                inertia: 'Trägheit (Mass)'
            };

            visualProps.forEach(prop => {
                const baseProp = prop.replace(/_\d+$/, '');
                const item = document.createElement('div');
                item.className = 'mapping-item right';
                item.dataset.prop = prop;

                const isSubProp = ['positionX', 'positionY', 'positionZ'].includes(baseProp);
                if (isSubProp) {
                    item.className = 'mapping-item right mapping-sub-item';
                    item.style.cssText = `
                        margin-left: 15px;
                        width: calc(100% - 15px);
                        border-left: 2px solid var(--accent-color);
                        background: rgba(255, 255, 255, 0.02);
                        padding: 4px 8px;
                        border-radius: 4px;
                        border-top: 1px solid rgba(255, 255, 255, 0.05);
                        border-right: 1px solid rgba(255, 255, 255, 0.05);
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                        font-size: 11px;
                        min-height: 30px;
                        position: relative;
                        box-sizing: border-box;
                        transition: all 0.2s ease;
                        margin-top: -6px; /* pull slightly closer to main prop */
                    `;
                    // Keep hover styles
                    item.onmouseover = () => {
                        item.style.background = 'rgba(255, 255, 255, 0.05)';
                        item.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    };
                    item.onmouseout = () => {
                        item.style.background = 'rgba(255, 255, 255, 0.02)';
                        item.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    };
                }

                let mapping = getEffectiveMapping(prop);
                const isConnected = mapping && mapping.source && mapping.source !== 'constant';
                const isExpanded = this.expandedProps.has(prop);

                if (isExpanded) {
                    item.classList.add('expanded');
                }

                // Create Header
                const header = document.createElement('div');
                header.className = 'mapping-item-header';

                const labelContainer = document.createElement('div');
                labelContainer.style.display = 'flex';
                labelContainer.style.alignItems = 'center';
                labelContainer.style.gap = '8px';

                const getLabel = (p: string) => {
                    let base = p;
                    let suf = '';
                    const m = p.match(/^(.*?)_(\d+)$/);
                    if (m && !p.startsWith('animation_') || (p.startsWith('animation_') && m && m[1] !== 'animation')) {
                        base = m[1];
                        suf = ` (${parseInt(m[2]) + 1})`;
                    }
                    return (propTranslations[base] || base.charAt(0).toUpperCase() + base.slice(1)) + suf;
                };

                const label = document.createElement('span');
                label.textContent = getLabel(prop);
                labelContainer.appendChild(label);

                if (mapping && mapping.source === 'constant') {
                    const valBadge = document.createElement('div');
                    valBadge.style.cssText = 'padding: 1px 5px; background: rgba(255,255,255,0.08); border-radius: 4px; font-size: 10px; color: #ccc; display: flex; align-items: center; white-space: nowrap;';
                    let hasValue = false;
                    
                    if (mapping.params && mapping.params.color) {
                        valBadge.innerHTML = `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${mapping.params.color}; margin-right:4px;"></span>${mapping.params.color}`;
                        hasValue = true;
                    } else if (mapping.params && mapping.params.value !== undefined) {
                        valBadge.textContent = String(mapping.params.value);
                        hasValue = true;
                    } else if ((mapping as any).value !== undefined) {
                        valBadge.textContent = String((mapping as any).value);
                        hasValue = true;
                    }
                    
                    if (hasValue) {
                        labelContainer.appendChild(valBadge);
                    }
                }
                
                header.appendChild(labelContainer);

                const actions = document.createElement('div');
                actions.style.display = 'flex';
                actions.style.gap = '6px';
                actions.style.alignItems = 'center';

                // The disconnect button (red X) was removed per request


                // Show the 3 dots icon
                const gear = document.createElement('span');
                gear.className = 'mapping-item-gear';
                gear.textContent = '⋮';
                gear.style.fontSize = '14px';
                gear.style.marginLeft = '4px';
                actions.appendChild(gear);
                
                header.appendChild(actions);

                const expandRightItem = () => {
                    if (!item.classList.contains('expanded')) {
                        item.classList.add('expanded');
                        this.expandedProps.add(prop);
                        requestAnimationFrame(() => {
                            this.drawCurves();
                            this.adjustHeightAndMinimap();
                        });
                    }
                };

                const collapseRightItem = () => {
                    if (item.classList.contains('expanded')) {
                        item.classList.remove('expanded');
                        this.expandedProps.delete(prop);
                        requestAnimationFrame(() => {
                            this.drawCurves();
                            this.adjustHeightAndMinimap();
                        });
                    }
                };

                item.addEventListener('mouseenter', expandRightItem);
                item.addEventListener('mouseleave', () => {
                    if (this.activeTileId !== 'right_' + prop) {
                        collapseRightItem();
                    }
                });

                // Toggle expansion and column focus
                header.onclick = (e) => {
                    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLOptionElement) {
                        return;
                    }
                    if (this.activeTileId === 'right_' + prop) {
                        this.activeTileId = null;
                        this.activeColumn = null;
                    } else {
                        this.activeTileId = 'right_' + prop;
                        this.activeColumn = 'right';
                        expandRightItem();
                    }
                    this.updateColumnWidths();
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
                    if (baseProp === 'color') {
                        functions = ['heatmap', 'bipolar', 'categorical'];
                    } else if (baseProp === 'geometry') {
                        functions = ['categorical', 'sphereComplexity'];
                    } else if (['position', 'size', 'thickness', 'curvature', 'glow', 'opacity', 'positionX', 'positionY', 'positionZ', 'attraction', 'repulsion', 'inertia'].includes(baseProp)) {
                        functions = ['linear', 'exponential', 'logarithmic', 'categorical'];
                    } else if (baseProp === 'animation' || baseProp.startsWith('animation_')) {
                        functions = ['linear', 'exponential', 'constant'];
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
                        const newFunc = funcSelect.value;
                        const updates: Partial<VisualMapping> = { function: newFunc as any };
                        
                        if (newFunc === 'categorical') {
                            const source = mapping.field || mapping.source || '';
                            const uniqueValues = this.getAttributeUniqueValues(source);
                            const currentCategories = mapping.params?.categories || {};
                            
                            if (baseProp === 'color') {
                                const palette = mapping.palette || 'all';
                                updates.palette = palette;
                                updates.params = { 
                                    ...(mapping.params || {}), 
                                    categories: this.generateCategoricalColors(uniqueValues, palette) 
                                };
                            } else if (baseProp === 'geometry') {
                                const categories: Record<string, string> = {};
                                const shapes = ['sphere', 'cube', 'cylinder', 'cone', 'torus'];
                                uniqueValues.forEach((val, idx) => {
                                    categories[val] = currentCategories[val] || shapes[idx % shapes.length];
                                });
                                updates.params = { ...(mapping.params || {}), categories };
                            } else {
                                // Numeric property
                                const categories: Record<string, number> = {};
                                const isPosition = ['position', 'positionX', 'positionY', 'positionZ'].includes(baseProp);
                                const defaultRange = isPosition ? [-50, 50] : [0.1, 3.0];
                                const rangeMin = mapping.range ? mapping.range[0] : defaultRange[0];
                                const rangeMax = mapping.range ? mapping.range[1] : defaultRange[1];
                                
                                const count = uniqueValues.length;
                                uniqueValues.forEach((val, idx) => {
                                    if (currentCategories[val] !== undefined) {
                                        categories[val] = Number(currentCategories[val]);
                                    } else {
                                        const pct = count > 1 ? idx / (count - 1) : 0.5;
                                        categories[val] = Number((rangeMin + pct * (rangeMax - rangeMin)).toFixed(2));
                                    }
                                });
                                updates.params = { ...(mapping.params || {}), categories };
                            }
                        }
                        this.updatePropertyMapping(prop, updates);
                    };
                    funcGroup.appendChild(funcSelect);
                    details.appendChild(funcGroup);

                    if (mapping.function !== 'categorical') {
                        // 2. Domain Min/Max
                        let defaultDomain: [number, number] = [0, 1];
                        if (this.dataModel) {
                            const propSchema = getPropertySchema(this.dataModel, this.currentType, mapping.field || mapping.source || '');
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
                    if (mapping.function === 'heatmap') {
                        const palGroup = document.createElement('div');
                        palGroup.className = 'mapping-control-group';
                        const palLabel = document.createElement('label');
                        palLabel.textContent = 'Farbpalette';
                        palGroup.appendChild(palLabel);

                        const palSelect = document.createElement('select');
                        palSelect.className = 'mapping-control-select';
                        
                        const palettes = ['blue-red', 'grayscale', 'viridis'];
                            
                        palettes.forEach(p => {
                            const opt = document.createElement('option');
                            opt.value = p;
                            opt.textContent = p;
                            opt.selected = mapping.palette === p || (p === 'all' && !mapping.palette);
                            palSelect.appendChild(opt);
                        });
                        palSelect.onchange = () => {
                            let updates: any = { palette: palSelect.value };
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
                        negInput.style.width = '40px';
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
                        posInput.style.width = '40px';
                        posInput.style.cursor = 'pointer';
                        posInput.onchange = () => {
                            const params = { ...(mapping.params || {}), positive: posInput.value };
                            this.updatePropertyMapping(prop, { params });
                        };

                        bipRow.appendChild(negInput);
                        bipRow.appendChild(posInput);
                        bipGroup.appendChild(bipRow);
                        details.appendChild(bipGroup);
                    } else if ((['linear', 'exponential', 'logarithmic'].includes(mapping.function) || mapping.range) && !['categorical', 'pulse'].includes(mapping.function)) {
                        const isPosition = ['position', 'positionX', 'positionY', 'positionZ'].includes(baseProp);
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
                    } else if (mapping.function === 'categorical') {
                        const catGroup = document.createElement('div');
                        catGroup.className = 'mapping-control-group';
                        catGroup.style.marginTop = '8px';
                        catGroup.style.borderTop = '1px solid rgba(255, 255, 255, 0.05)';
                        catGroup.style.paddingTop = '8px';
                        
                        const catLabel = document.createElement('label');
                        catLabel.textContent = 'Kategoriewerte zuweisen';
                        catLabel.style.fontWeight = 'bold';
                        catLabel.style.marginBottom = '6px';
                        catGroup.appendChild(catLabel);
                        
                        const source = mapping.field || mapping.source || '';
                        const uniqueValues = this.getAttributeUniqueValues(source);
                        const categories = mapping.params?.categories || {};
                        
                        if (baseProp === 'color') {
                            const palGroup = document.createElement('div');
                            palGroup.className = 'mapping-control-group';
                            palGroup.style.marginBottom = '8px';
                            const palLabel = document.createElement('label');
                            palLabel.textContent = 'Farbpalette';
                            palGroup.appendChild(palLabel);

                            const palSelect = document.createElement('select');
                            palSelect.className = 'mapping-control-select';
                            
                            const palettes = ['all', 'heatmap', 'grayscale', 'viridis', 'category10', 'category20', 'pastel'];
                            palettes.forEach(p => {
                                const opt = document.createElement('option');
                                opt.value = p;
                                opt.textContent = p;
                                opt.selected = mapping.palette === p || (p === 'all' && !mapping.palette);
                                palSelect.appendChild(opt);
                            });
                            palSelect.onchange = () => {
                                let updates: any = { palette: palSelect.value };
                                updates.params = { ...(mapping.params || {}), categories: this.generateCategoricalColors(uniqueValues, palSelect.value) };
                                this.updatePropertyMapping(prop, updates);
                            };
                            palGroup.appendChild(palSelect);
                            catGroup.appendChild(palGroup);
                        }
                        
                        uniqueValues.forEach(val => {
                            const row = document.createElement('div');
                            row.className = 'mapping-control-row';
                            row.style.display = 'flex';
                            row.style.alignItems = 'center';
                            row.style.justifyContent = 'space-between';
                            row.style.marginBottom = '4px';
                            
                            const nameSpan = document.createElement('span');
                            nameSpan.textContent = val;
                            nameSpan.style.fontSize = '11px';
                            nameSpan.style.color = 'var(--text-muted)';
                            nameSpan.style.maxWidth = '150px';
                            nameSpan.style.overflow = 'hidden';
                            nameSpan.style.textOverflow = 'ellipsis';
                            nameSpan.style.whiteSpace = 'nowrap';
                            row.appendChild(nameSpan);
                            
                            if (baseProp === 'color') {
                                const input = document.createElement('input');
                                input.className = 'mapping-control-input';
                                input.type = 'color';
                                input.value = categories[val] || '#00aaff';
                                input.style.padding = '0';
                                input.style.height = '18px';
                                input.style.width = '40px';
                                input.style.cursor = 'pointer';
                                input.onchange = () => {
                                    const params = {
                                        ...(mapping.params || {}),
                                        categories: {
                                            ...(mapping.params?.categories || {}),
                                            [val]: input.value
                                        }
                                    };
                                    this.updatePropertyMapping(prop, { params });
                                };
                                row.appendChild(input);
                            } else if (baseProp === 'geometry') {
                                const select = document.createElement('select');
                                select.className = 'mapping-control-select';
                                select.style.width = '100px';
                                const shapes = ['sphere', 'cube', 'cylinder', 'cone', 'torus'];
                                const currentShape = categories[val] || 'sphere';
                                shapes.forEach(s => {
                                    const opt = document.createElement('option');
                                    opt.value = s;
                                    opt.textContent = s.charAt(0).toUpperCase() + s.slice(1);
                                    opt.selected = currentShape === s;
                                    select.appendChild(opt);
                                });
                                select.onchange = () => {
                                    const params = {
                                        ...(mapping.params || {}),
                                        categories: {
                                            ...(mapping.params?.categories || {}),
                                            [val]: select.value
                                        }
                                    };
                                    this.updatePropertyMapping(prop, { params });
                                };
                                row.appendChild(select);
                            } else {
                                // Numeric property
                                const input = document.createElement('input');
                                input.className = 'mapping-control-input';
                                input.type = 'number';
                                input.step = '0.1';
                                input.style.width = '80px';
                                const currentVal = categories[val] !== undefined ? categories[val] : 1.0;
                                input.value = String(currentVal);
                                input.onchange = () => {
                                    const parsed = parseFloat(input.value);
                                    if (!isNaN(parsed)) {
                                        const params = {
                                            ...(mapping.params || {}),
                                            categories: {
                                                ...(mapping.params?.categories || {}),
                                                [val]: parsed
                                            }
                                        };
                                        this.updatePropertyMapping(prop, { params });
                                    }
                                };
                                row.appendChild(input);
                            }
                            
                            catGroup.appendChild(row);
                        });
                        
                        details.appendChild(catGroup);
                    }
                } else {
                    // Constant value setting
                    const constGroup = document.createElement('div');
                    constGroup.className = 'mapping-control-group';
                    const constLabel = document.createElement('label');
                    constLabel.textContent = 'Fester Wert';
                    constGroup.appendChild(constLabel);

                    if (baseProp === 'color') {
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
                    } else if (baseProp === 'geometry') {
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
                    } else if (['position', 'size', 'thickness', 'curvature', 'glow', 'opacity', 'positionX', 'positionY', 'positionZ', 'attraction', 'repulsion', 'inertia'].includes(baseProp)) {
                        const numInput = document.createElement('input');
                        numInput.className = 'mapping-control-input';
                        numInput.type = 'number';
                        numInput.step = '0.05';
                        const constVal = mapping.params?.value !== undefined ? mapping.params.value : (mapping.range ? mapping.range[0] : 1.0);
                        numInput.value = String(constVal);
                        numInput.onchange = () => {
                            const val = parseFloat(numInput.value);
                            if (!isNaN(val)) {
                                this.updatePropertyMapping(prop, { 
                                    range: [val, val],
                                    params: { ...(mapping.params || {}), value: val }
                                });
                            }
                        };
                        constGroup.appendChild(numInput);
                    } else if (baseProp === 'animation' || baseProp.startsWith('animation_')) {
                        const animSelect = document.createElement('select');
                        animSelect.className = 'mapping-control-select';
                        const animOptions = ['none', 'active'];
                        const currentAnim = (mapping.function === 'constant' && mapping.params?.active) ? 'active' : 'none';
                        animOptions.forEach(optVal => {
                            const opt = document.createElement('option');
                            opt.value = optVal;
                            opt.textContent = optVal.charAt(0).toUpperCase() + optVal.slice(1);
                            opt.selected = currentAnim === optVal;
                            animSelect.appendChild(opt);
                        });
                        animSelect.onchange = () => {
                            if (animSelect.value === 'active') {
                                this.updatePropertyMapping(prop, { 
                                    source: 'constant',
                                    function: 'constant',
                                    params: { active: true, value: 1.0 }
                                });
                            } else {
                                this.updatePropertyMapping(prop, { 
                                    source: 'constant',
                                    function: 'constant',
                                    params: { active: false, value: 0 }
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

        // Layout-Engine-Sektion nach den Visualisierungs-Kacheln rendern (nur bei Entities)
        if (isEntity) {
            this.renderLayoutEngineSection();
        }

        // Draw active curves after browser layout pass and during transitions
        this.animateCurves();
    }

    /** Setzt den Callback fuer Layout-Anwendung. Wird von App.ts aufgerufen. */
    public setLayoutCallback(
        onApply: (algorithm: string, params: Record<string, number>) => Promise<void>,
        onStop: () => void
    ) {
        this.layoutCallback = onApply;
        this.layoutStopCallback = onStop;
    }

    /** Setzt den Layout-Enabled-State von aussen (z.B. StateManager). */
    public setLayoutEnabled(enabled: boolean) {
        this.layoutEnabled = enabled;
    }

    /** Rendert die Layout-Engine-Steuerung als Sektion in der rechten Spalte. */
    private renderLayoutEngineSection() {
        const section = document.createElement('div');
        section.className = 'layout-engine-section';
        section.style.cssText = `
            margin-top: 12px;
            padding-top: 10px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
        `;

        // --- Header: Toggle + Label + Apply Button ---
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 8px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s ease;
        `;
        header.onmouseover = () => header.style.background = 'rgba(255, 255, 255, 0.06)';
        header.onmouseout = () => header.style.background = 'rgba(255, 255, 255, 0.03)';

        // Toggle Switch
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = this.layoutEnabled;
        toggle.style.cssText = `
            appearance: none; width: 28px; height: 14px;
            background: ${this.layoutEnabled ? 'rgba(255, 165, 0, 0.6)' : 'rgba(255, 255, 255, 0.15)'};
            border-radius: 7px; position: relative; cursor: pointer;
            transition: background 0.2s ease; flex-shrink: 0;
        `;
        // Thumb via box-shadow trick
        const updateToggleStyle = () => {
            toggle.style.background = toggle.checked ? 'rgba(255, 165, 0, 0.6)' : 'rgba(255, 255, 255, 0.15)';
            toggle.style.boxShadow = toggle.checked
                ? 'inset 16px 0 0 -4px rgba(255, 165, 0, 1)'
                : 'inset -16px 0 0 -4px rgba(255, 255, 255, 0.5)';
        };
        updateToggleStyle();
        toggle.addEventListener('change', (e) => {
            e.stopPropagation();
            this.layoutEnabled = toggle.checked;
            updateToggleStyle();
            updateControlsState();
            // Sync with StateManager via global app
            const app = typeof window !== 'undefined' ? (window as any).app : null;
            if (app?.stateManager) {
                app.stateManager.update({ layoutEnabled: this.layoutEnabled });
            }
        });
        toggle.addEventListener('click', (e) => e.stopPropagation());

        // Label
        const label = document.createElement('span');
        label.textContent = '⚙ Layout-Engine';
        label.style.cssText = `
            flex: 1; font-size: 12px; font-weight: 600;
            color: rgba(255, 255, 255, 0.8);
        `;

        // Expand Arrow
        const arrow = document.createElement('span');
        arrow.textContent = this.layoutExpanded ? '▾' : '▸';
        arrow.style.cssText = `
            font-size: 10px; color: rgba(255, 255, 255, 0.4);
            transition: transform 0.2s ease;
        `;

        // Apply Button (compact)
        const applyBtn = document.createElement('button');
        applyBtn.textContent = '▶';
        applyBtn.title = 'Layout anwenden';
        applyBtn.style.cssText = `
            width: 24px; height: 24px; border: none;
            background: rgba(160, 128, 96, 0.2); color: var(--accent-color);
            border-radius: 4px; cursor: pointer; font-size: 10px;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s ease; flex-shrink: 0;
        `;
        applyBtn.onmouseover = () => { if (this.layoutEnabled) applyBtn.style.background = 'rgba(255, 165, 0, 0.4)'; };
        applyBtn.onmouseout = () => { applyBtn.style.background = 'rgba(255, 165, 0, 0.2)'; };
        applyBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!this.layoutEnabled || !this.layoutCallback) return;
            applyBtn.textContent = '⏳';
            applyBtn.style.pointerEvents = 'none';
            try {
                await this.layoutCallback(this.selectedAlgorithm, { ...this.layoutCurrentParams });
            } finally {
                applyBtn.textContent = '▶';
                applyBtn.style.pointerEvents = 'auto';
            }
        });

        // Stop Button
        const stopBtn = document.createElement('button');
        stopBtn.textContent = '■';
        stopBtn.title = 'Layout stoppen';
        stopBtn.style.cssText = `
            width: 24px; height: 24px; border: none;
            background: rgba(255, 80, 80, 0.15); color: #ff6666;
            border-radius: 4px; cursor: pointer; font-size: 8px;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s ease; flex-shrink: 0;
        `;
        stopBtn.onmouseover = () => { if (this.layoutEnabled) stopBtn.style.background = 'rgba(255, 80, 80, 0.3)'; };
        stopBtn.onmouseout = () => { stopBtn.style.background = 'rgba(255, 80, 80, 0.15)'; };
        stopBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.layoutStopCallback) this.layoutStopCallback();
        });

        header.appendChild(toggle);
        header.appendChild(label);
        header.appendChild(arrow);
        header.appendChild(applyBtn);
        header.appendChild(stopBtn);

        // --- Expandable Details ---
        const details = document.createElement('div');
        details.style.cssText = `
            display: ${this.layoutExpanded ? 'block' : 'none'};
            padding: 8px;
            margin-top: 4px;
        `;

        // Algorithm Dropdown
        const algoGroup = document.createElement('div');
        algoGroup.style.cssText = 'margin-bottom: 10px;';
        const algoLabel = document.createElement('label');
        algoLabel.textContent = 'Algorithmus';
        algoLabel.style.cssText = 'display: block; font-size: 10px; color: rgba(255,255,255,0.5); margin-bottom: 4px;';
        const algoSelect = document.createElement('select');
        algoSelect.style.cssText = `
            width: 100%; padding: 4px 8px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #e0e0e0; border-radius: 4px; font-size: 11px;
        `;
        Object.entries(this.layoutAlgorithmNames).forEach(([key, name]) => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = name;
            opt.selected = key === this.selectedAlgorithm;
            algoSelect.appendChild(opt);
        });
        algoSelect.addEventListener('change', () => {
            this.selectedAlgorithm = algoSelect.value;
            this.initLayoutParams();
            renderParams();
        });
        algoGroup.appendChild(algoLabel);
        algoGroup.appendChild(algoSelect);
        details.appendChild(algoGroup);

        // Parameter Container
        const paramContainer = document.createElement('div');
        details.appendChild(paramContainer);

        const renderParams = () => {
            paramContainer.innerHTML = '';
            const params = this.layoutParameters[this.selectedAlgorithm] || {};
            Object.entries(params).forEach(([paramName, paramDef]) => {
                const group = document.createElement('div');
                group.style.cssText = 'margin-bottom: 6px;';

                const labelRow = document.createElement('div');
                labelRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;';

                const pLabel = document.createElement('label');
                pLabel.textContent = this.layoutParamNames[paramName] || paramName;
                pLabel.style.cssText = 'font-size: 10px; color: rgba(255,255,255,0.5);';

                const pValue = document.createElement('span');
                pValue.style.cssText = 'font-size: 10px; color: rgba(255,255,255,0.7); font-variant-numeric: tabular-nums;';
                const currentVal = this.layoutCurrentParams[paramName] !== undefined
                    ? this.layoutCurrentParams[paramName]
                    : paramDef.default;
                pValue.textContent = String(currentVal);

                labelRow.appendChild(pLabel);
                labelRow.appendChild(pValue);

                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = String(paramDef.min);
                slider.max = String(paramDef.max);
                slider.step = String(paramDef.step);
                slider.value = String(currentVal);
                slider.style.cssText = 'width: 100%;';
                slider.addEventListener('input', () => {
                    const val = parseFloat(slider.value);
                    this.layoutCurrentParams[paramName] = val;
                    pValue.textContent = String(val);
                });

                group.appendChild(labelRow);
                group.appendChild(slider);
                paramContainer.appendChild(group);
            });
        };

        // Initialize params and render
        this.initLayoutParams();
        renderParams();

        // Toggle expand/collapse
        header.addEventListener('click', () => {
            this.layoutExpanded = !this.layoutExpanded;
            details.style.display = this.layoutExpanded ? 'block' : 'none';
            arrow.textContent = this.layoutExpanded ? '▾' : '▸';
        });

        // Enable/Disable helper
        const updateControlsState = () => {
            const opacity = this.layoutEnabled ? '1' : '0.4';
            const events = this.layoutEnabled ? 'auto' : 'none';
            applyBtn.style.opacity = opacity;
            applyBtn.style.pointerEvents = events;
            stopBtn.style.opacity = opacity;
            stopBtn.style.pointerEvents = events;
            algoSelect.style.opacity = opacity;
            algoSelect.style.pointerEvents = events;
            paramContainer.style.opacity = opacity;
            paramContainer.style.pointerEvents = events;
        };
        updateControlsState();

        section.appendChild(header);
        section.appendChild(details);
        this.rightColumn.appendChild(section);

        // Sicherstellen, dass Kurven nach dem Rendern neu gezeichnet werden
        this.animateCurves();
    }

    /** Initialisiert die Layout-Parameter-Werte fuer den aktuell gewaehlten Algorithmus. */
    private initLayoutParams() {
        const params = this.layoutParameters[this.selectedAlgorithm] || {};
        // Nur fehlende Parameter initialisieren, bestehende behalten
        const newParams: Record<string, number> = {};
        Object.entries(params).forEach(([key, def]) => {
            newParams[key] = this.layoutCurrentParams[key] !== undefined ? this.layoutCurrentParams[key] : def.default;
        });
        this.layoutCurrentParams = newParams;
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
        this.animateCurves();
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

        // Clear previous active states
        this.container.querySelectorAll('.snapdot.connected').forEach(dot => dot.classList.remove('connected'));
        this.container.querySelectorAll('.snapdot.suggested').forEach(dot => dot.classList.remove('suggested'));
        this.container.querySelectorAll('.mapping-item.active-mapping').forEach(item => item.classList.remove('active-mapping'));
        this.container.querySelectorAll('.mapping-item.suggested-mapping').forEach(item => item.classList.remove('suggested-mapping'));

        if (!this.mappings || !this.currentType) return;

        const typesToCheck = this.getTypesToCheck();
        let debugLog = `T:${typesToCheck.join(',')} | `;

        const originalLines = new Set<string>(); // "source|prop"
        const activeLines = new Set<string>(); // "source|prop"
        const activeProps = new Set<string>(); // to keep track of overridden properties

        // 1. Gather active mappings first
        if (this.mappings && this.mappings.defaultPresets) {
            typesToCheck.forEach(t => {
                const preset = this.mappings!.defaultPresets[t];
                if (preset) {
                    Object.entries(preset).forEach(([prop, mapping]) => {
                        if (typeof mapping === 'object' && mapping !== null && ('source' in mapping || 'field' in mapping)) {
                            const sourceAttr = (mapping as VisualMapping).field || (mapping as VisualMapping).source;
                            if (sourceAttr) {
                                if (sourceAttr !== 'constant') {
                                    activeLines.add(`${sourceAttr}|${prop}`);
                                    activeProps.add(prop);
                                }
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
                        if (typeof mapping === 'object' && mapping !== null && ('source' in mapping || 'field' in mapping)) {
                            const sourceAttr = (mapping as VisualMapping).field || (mapping as VisualMapping).source;
                            // Only add if not overridden by any active mapping for this property
                            if (sourceAttr && sourceAttr !== 'constant' && !activeProps.has(prop)) {
                                originalLines.add(`${sourceAttr}|${prop}`);
                            }
                        }
                    });
                }
            });
        }

        // 3. & 4. Draw lines
        let drawnActive = 0;
        let drawnOriginal = 0;
        let failedActive = 0;
        let failedOriginal = 0;

        activeLines.forEach(line => {
            const [sourceAttr, prop] = line.split('|');
            const result = this.drawCurve(sourceAttr, prop, 'mapping-curve', true, false);
            if (result === 'OK') {
                drawnActive++;
            } else {
                failedActive++;
                debugLog += `[A:${line}=${result}] `;
            }
        });
        
        originalLines.forEach(line => {
            const [sourceAttr, prop] = line.split('|');
            const result = this.drawCurve(sourceAttr, prop, 'mapping-curve original-curve', false, true);
            if (result === 'OK') {
                drawnOriginal++;
            } else {
                failedOriginal++;
                debugLog += `[O:${line}=${result}] `;
            }
        });
        
        console.log(`[MappingUI] drawCurves Debug: ${debugLog} ALines:${activeLines.size} OLines:${originalLines.size} DrA:${drawnActive} DrO:${drawnOriginal}`);
        
        // 5. Update connection dots (already cleared at start, but we can leave this for specific prop checks if needed, though it's redundant now)
        this.rightColumn.querySelectorAll('.snapdot').forEach(dot => {
            const prop = (dot as HTMLElement).dataset.prop;
            if (prop && !activeProps.has(prop)) {
                dot.classList.remove('connected');
                const item = dot.closest('.mapping-item');
                if (item) item.classList.remove('active-mapping');
            }
        });

        // Takeover Button logic removed from here as it is now in SuggestionUI
    }

    private hasOriginalMappingsToTakeover(): boolean {
        if (!this.originalMappings || !this.originalMappings.defaultPresets) return false;
        
        const type = this.currentType;
        const preset = this.originalMappings.defaultPresets[type] as any;
        if (!preset) return false;
        
        for (const prop in preset) {
            const map = preset[prop] as VisualMapping;
            if (!map) continue;
            let sourceAttr = map.field || map.source;
            if (!sourceAttr) continue;
            
            sourceAttr = sourceAttr.replace(/^stateVector\./, '');
            // Check if already in active mappings
            const activePreset = this.mappings?.defaultPresets?.[type] as any;
            if (!activePreset || !activePreset[prop]) {
                return true;
            }
            
            const activeMap = activePreset[prop] as VisualMapping;
            let activeSource = activeMap.source || activeMap.field;
            if (activeSource) activeSource = activeSource.replace(/^stateVector\./, '');
            
            if (activeSource !== sourceAttr) {
                return true;
            }
            
            // If both are constant, check if the value/color/geometry differs
            if (sourceAttr === 'constant') {
                const valOriginal = map.params?.value !== undefined ? map.params.value : (map.params?.color || map.params?.geometry || (map as any).value);
                const valActive = activeMap.params?.value !== undefined ? activeMap.params.value : (activeMap.params?.color || activeMap.params?.geometry || (activeMap as any).value);
                if (valOriginal !== valActive) {
                    return true;
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

        const type = this.currentType;
        if (!this.mappings!.defaultPresets[type]) {
            this.mappings!.defaultPresets[type] = {} as any;
        }
        
        const preset = this.originalMappings!.defaultPresets[type] as any;
        if (preset) {
            Object.keys(preset).forEach(prop => {
                const map = preset[prop] as VisualMapping;
                if (map) {
                    const mapCopy = JSON.parse(JSON.stringify(map));
                    if (mapCopy.source) mapCopy.source = mapCopy.source.replace(/^stateVector\./, '');
                    if (mapCopy.field) mapCopy.field = mapCopy.field.replace(/^stateVector\./, '');
                    (this.mappings!.defaultPresets[type] as any)[prop] = mapCopy;
                }
            });
        }

        if (this.onUpdate) {
            this.onUpdate(this.mappings);
        }
        
        this.renderColumns();
    }

    private drawCurve(sourceAttr: string, prop: string, curveClass: string, isActive: boolean, isDashed: boolean): string {
        // Build 2/3 imported mappings might have "stateVector.group", but UI might display it differently.
        // First try the exact sourceAttr.
        let leftDot = this.leftColumn.querySelector(`.snapdot:not([data-val])[data-attr="${sourceAttr}"]`) as HTMLElement;
        
        if (!leftDot) {
            // Try normalized attribute (fallback for older mappings)
            const normalizedAttr = sourceAttr.replace(/^stateVector\./, '');
            leftDot = this.leftColumn.querySelector(`.snapdot:not([data-val])[data-attr="${normalizedAttr}"]`) as HTMLElement;
        }
        
        if (!leftDot) {
            // If sub-attribute is collapsed, use the parent attribute dot
            const parentPath = sourceAttr.split('.')[0];
            leftDot = this.leftColumn.querySelector(`.snapdot:not(.sub-dot):not([data-val])[data-attr="${parentPath}"]`) as HTMLElement;
        }

        if (!leftDot) {
            // Ultimate fallback for normalized parent
            const normalizedParentPath = sourceAttr.replace(/^stateVector\./, '').split('.')[0];
            leftDot = this.leftColumn.querySelector(`.snapdot:not(.sub-dot):not([data-val])[data-attr="${normalizedParentPath}"]`) as HTMLElement;
        }

        const rightDot = this.rightColumn.querySelector(`.snapdot[data-prop="${prop}"]`) as HTMLElement;

        if (!leftDot || !rightDot) {
            return `NoDot(L:${!!leftDot},R:${!!rightDot})`;
        }

        if (isActive) {
            leftDot.classList.add('connected');
            rightDot.classList.add('connected');
            
            const leftItem = leftDot.closest('.mapping-item');
            if (leftItem) leftItem.classList.add('active-mapping');
            
            const rightItem = rightDot.closest('.mapping-item');
            if (rightItem) rightItem.classList.add('active-mapping');
        } else if (isDashed) {
            leftDot.classList.add('suggested');
            rightDot.classList.add('suggested');
            
            const leftItem = leftDot.closest('.mapping-item');
            if (leftItem) leftItem.classList.add('suggested-mapping');
            
            const rightItem = rightDot.closest('.mapping-item');
            if (rightItem) rightItem.classList.add('suggested-mapping');
        }

        const bodyRect = this.bodyContainer.getBoundingClientRect();
        const leftRect = leftDot.getBoundingClientRect();
        const rightRect = rightDot.getBoundingClientRect();

        const x1 = leftRect.left + leftRect.width / 2 - bodyRect.left;
        const y1 = leftRect.top + leftRect.height / 2 - bodyRect.top;
        const x2 = rightRect.left + rightRect.width / 2 - bodyRect.left;
        const y2 = rightRect.top + rightRect.height / 2 - bodyRect.top;

        // Restore ZeroRect check but log it instead of silently failing
        if (leftRect.width === 0 && leftRect.height === 0) {
            const pStyle = window.getComputedStyle(leftDot.parentElement || document.body);
            return `ZRL(attr:${leftDot.dataset.attr},p:${leftDot.parentElement?.className},pvis:${pStyle.display},bW:${bodyRect.width})`;
        }
        if (rightRect.width === 0 && rightRect.height === 0) {
            return `ZeroRectR`;
        }

        const dx = Math.abs(x2 - x1) * 0.5;
        const dStr = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
        
        // Create a group to hold both visible path and transparent hit area
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        const visiblePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        visiblePath.setAttribute('class', curveClass);
        visiblePath.setAttribute('d', dStr);
        if (isDashed) {
            visiblePath.setAttribute('stroke-dasharray', '5,5');
            visiblePath.style.stroke = 'rgba(255, 255, 255, 0.4)';
            visiblePath.style.strokeWidth = '2px';
        }
        
        const hitAreaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        hitAreaPath.setAttribute('class', 'mapping-curve-hitarea');
        hitAreaPath.setAttribute('d', dStr);
        hitAreaPath.style.fill = 'none';
        hitAreaPath.style.stroke = 'transparent';
        hitAreaPath.style.strokeWidth = '20';
        hitAreaPath.style.pointerEvents = 'stroke';
        
        group.appendChild(visiblePath);
        group.appendChild(hitAreaPath);

        if (isActive || isDashed) {
            group.style.cursor = 'pointer';
            
            // Hover effect simulation
            group.addEventListener('mouseenter', () => {
                visiblePath.style.stroke = isDashed ? 'rgba(0, 170, 255, 0.8)' : '#00aaff';
                visiblePath.style.strokeWidth = '3';
            });
            group.addEventListener('mouseleave', () => {
                if (isDashed) {
                    visiblePath.style.stroke = 'rgba(255, 255, 255, 0.4)';
                    visiblePath.style.strokeWidth = '2px';
                } else {
                    visiblePath.style.stroke = '';
                    visiblePath.style.strokeWidth = '';
                }
            });

            // Click path to disconnect
            group.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isDashed) {
                    this.disconnectOriginalMapping(prop);
                } else {
                    this.disconnectMapping(prop);
                }
            });
        }

        this.svgOverlay.appendChild(group);
        return 'OK';
    }

    private startDrag(e: PointerEvent, dot: HTMLElement, isLeft: boolean, attrName: string, propName: string, specificValue?: string) {
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
            specificValue,
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
                this.connectMapping(sourceAttr, targetProp, this.activeDrag.specificValue);
            } 
            // Connect input (right) to output (left)
            else if (!this.activeDrag.isLeft && isTargetLeft) {
                const sourceAttr = targetDot.dataset.attr || '';
                const targetProp = this.activeDrag.visualPropName;
                // Since the drag started from right, the target dot is on the left.
                // We check if it has a specific value dataset.
                const specificValue = targetDot.dataset.val;
                this.connectMapping(sourceAttr, targetProp, specificValue);
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

    private connectMapping(sourceAttr: string, propName: string, specificValue?: string) {
        if (!this.mappings || !this.currentType || !this.onUpdate) return;

        if (!this.mappings.defaultPresets) {
            this.mappings.defaultPresets = {};
        }
        if (!this.mappings.defaultPresets[this.currentType]) {
            this.mappings.defaultPresets[this.currentType] = {};
        }

        const preset = this.mappings.defaultPresets[this.currentType] as any;

        let defaultFunc: any = 'linear';
        const basePropName = propName.replace(/_\d+$/, '');
        const isCategoricalSource = ['type', 'id', 'category', 'label', 'domain'].includes(sourceAttr);
        if (specificValue || isCategoricalSource) {
            defaultFunc = 'categorical';
        } else if (basePropName === 'color') {
            if (isCategoricalSource) {
                defaultFunc = 'categorical';
            } else {
                defaultFunc = 'heatmap';
            }
        } else if (basePropName === 'geometry') {
            defaultFunc = 'categorical';
        } else if (basePropName === 'animation') {
            defaultFunc = 'pulse';
        } else if (['position', 'positionX', 'positionY', 'positionZ', 'size', 'thickness', 'curvature', 'glow', 'opacity', 'attraction', 'repulsion', 'inertia'].includes(basePropName)) {
            if (isCategoricalSource) {
                defaultFunc = 'categorical';
            } else {
                defaultFunc = 'linear';
            }
        }

        let newDomain: [number, number] | undefined = undefined;
        if (sourceAttr !== 'constant') {
            newDomain = this.getAttributeDataBounds(sourceAttr);
        }

        const isPosition = ['position', 'positionX', 'positionY', 'positionZ'].includes(basePropName);
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

        if (defaultFunc === 'categorical') {
            const uniqueValues = this.getAttributeUniqueValues(sourceAttr);
            const currentCategories = existingMapping.params?.categories || {};
            
            if (basePropName === 'color') {
                const palette = existingMapping.palette || 'all';
                updates.palette = palette;
                updates.params = { 
                    ...(existingMapping.params || {}), 
                    categories: this.generateCategoricalColors(uniqueValues, palette) 
                };
            } else if (basePropName === 'geometry') {
                const categories: Record<string, string> = {};
                const shapes = ['sphere', 'cube', 'cylinder', 'cone', 'torus'];
                uniqueValues.forEach((val, idx) => {
                    categories[val] = currentCategories[val] || shapes[idx % shapes.length];
                });
                updates.params = { ...(existingMapping.params || {}), categories };
            } else {
                // Numeric property
                const categories: Record<string, number> = {};
                const isPosition = ['position', 'positionX', 'positionY', 'positionZ'].includes(basePropName);
                const defaultRange = isPosition ? [-50, 50] : [0.1, 3.0];
                const rangeMin = existingMapping.range ? existingMapping.range[0] : defaultRange[0];
                const rangeMax = existingMapping.range ? existingMapping.range[1] : defaultRange[1];
                
                const count = uniqueValues.length;
                uniqueValues.forEach((val, idx) => {
                    if (currentCategories[val] !== undefined) {
                        categories[val] = Number(currentCategories[val]);
                    } else {
                        const pct = count > 1 ? idx / (count - 1) : 0.5;
                        categories[val] = Number((rangeMin + pct * (rangeMax - rangeMin)).toFixed(2));
                    }
                });
                updates.params = { ...(existingMapping.params || {}), categories };
            }
        }

        preset[propName] = updates;

        // Auto-expand connected mapping property
        this.expandedProps.add(propName);
        
        // Let the UI render the expanded property first
        requestAnimationFrame(() => {
            if (specificValue) {
                // Try to find the specific category input and focus it
                setTimeout(() => {
                    const rightCol = this.rightColumn;
                    const item = rightCol.querySelector(`.mapping-item.right[data-prop="${propName}"]`);
                    if (item) {
                        const inputs = item.querySelectorAll('input');
                        inputs.forEach(input => {
                            // Find the label or input that matches the specific value
                            const row = input.closest('div');
                            if (row && row.textContent?.includes(specificValue)) {
                                input.focus();
                                input.style.boxShadow = '0 0 0 2px var(--accent-color)';
                                setTimeout(() => input.style.boxShadow = '', 2000);
                            }
                        });
                    }
                }, 50);
            }
        });

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
        
        const [absMin, absMax] = this.getAttributeDataBounds(mapping.source || mapping.field || '');
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
            const isEntityType = this.currentCategory === 'entities';
            const currentDataItems = isEntityType ? this.entities : this.relationships;
            const bins = new Array(10).fill(0);
            let maxBinCount = 1;

            currentDataItems.forEach(item => {
                if (item.type === this.currentType) {
                    const val = parseFloat(this.getNestedValue(item, mapping.field || mapping.source || ''));
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
