/**
 * ContextMenuHandler - Verwaltet kontextsensitive Kontextmenue-Anzeige,
 * dynamische Betitelung je nach Modus und Nachbarschafts-Expansion.
 */
import * as THREE from 'three';
import { IStateManager } from '../interfaces';
import { ContextMenu, ContextMenuOption, ContextMenuHeader } from '../../ui/ContextMenu';
import { DataEditor } from '../../ui/DataEditor';
import { SelectionHandler } from './SelectionHandler';
import { NodeCreationHandler } from './NodeCreationHandler';
import { LightRAGService } from '../../utils/LightRAGService';

export class ContextMenuHandler {
    private stateManager: IStateManager;
    private contextMenu: ContextMenu;
    private dataEditor: DataEditor;
    private selectionHandler: SelectionHandler;
    private nodeCreationHandler: NodeCreationHandler;
    private camera?: THREE.Camera;
    private controls?: any;
    private scene?: THREE.Scene;

    private expandingNodes = new Set<string>();

    constructor(
        stateManager: IStateManager,
        selectionHandler: SelectionHandler,
        nodeCreationHandler: NodeCreationHandler,
        camera?: THREE.Camera,
        controls?: any,
        scene?: THREE.Scene
    ) {
        this.stateManager = stateManager;
        this.selectionHandler = selectionHandler;
        this.nodeCreationHandler = nodeCreationHandler;
        this.camera = camera;
        this.controls = controls;
        this.scene = scene;

        this.contextMenu = new ContextMenu();
        this.dataEditor = new DataEditor();
    }

    /**
     * Handler fuer Context Menu Events aus dem CentralEventManager
     */
    handleContextMenu(data: any) {
        const { event, clickedObject } = data;
        this.showContextMenu(clickedObject, event);
    }

    /**
     * Ermittelt Titel und Badge fuer den aktuellen Arbeitsmodus
     */
    private getModeInfo(): { badge: string; type: 'simple' | 'expert' | 'dev' } {
        const mode = this.stateManager.state.complexityMode || 'simple';
        switch (mode) {
            case 'dev':
                return { badge: 'Entwickler', type: 'dev' };
            case 'expert':
                return { badge: 'Experte', type: 'expert' };
            case 'simple':
            default:
                return { badge: 'Einfach', type: 'simple' };
        }
    }

    /**
     * Sucht ein 3D-Knotenobjekt anhand seiner Node-ID
     */
    private findNodeObjectById(nodeId: string): THREE.Object3D | null {
        if (!this.scene) return null;
        let found: THREE.Object3D | null = null;
        this.scene.traverse((obj: THREE.Object3D) => {
            if (found) return;
            if (obj.userData?.type === 'node' && String(obj.userData?.id) === String(nodeId)) {
                found = obj;
            }
        });
        return found;
    }

    /**
     * Fokussiert einen Knoten anhand seiner ID
     */
    private focusNodeById(nodeId: string) {
        const obj = this.findNodeObjectById(nodeId);
        if (obj) {
            this.selectionHandler.selectObject(obj);
            this.selectionHandler.focusOnObject(obj);
        }
    }

    /**
     * Kehrt die Richtung einer Kante um
     */
    private reverseEdge(edgeData: any) {
        const id = edgeData.id;
        if (!id) return;
        const oldSource = edgeData.source;
        const oldTarget = edgeData.target;
        this.stateManager.updateEdge(id, {
            source: oldTarget,
            target: oldSource
        });
        console.log(`[ContextMenuHandler] Kante umgekehrt: ${oldTarget} -> ${oldSource}`);
    }

    /**
     * Passt die Kamera an den gesamten Graphen an (Fit to View)
     */
    private fitCameraToScene() {
        if (typeof window !== 'undefined' && (window as any).app?.fitCameraToScene) {
            (window as any).app.fitCameraToScene();
        } else if (this.camera && this.controls && this.scene) {
            const box = new THREE.Box3().setFromObject(this.scene);
            if (!box.isEmpty()) {
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3()).length();
                this.controls.target.copy(center);
                this.camera.position.set(center.x, center.y + size * 0.4, center.z + size * 0.9);
                this.controls.update();
            }
        }
    }

    /**
     * Dynamische Nachbarschafts-Expansion fuer einen Knoten (LightRAG / Wikidata)
     */
    public async expandNodeNeighborhood(object: THREE.Object3D) {
        if (!object || object.userData.type !== 'node') return;
        const data = object.userData.nodeData || object.userData.entity || {};
        const id = String(object.userData.id || data.id || '');
        const label = String(data.label || id || 'Knoten');

        if (this.expandingNodes.has(id)) {
            console.log(`[ContextMenuHandler] Nachbarschaft fuer '${label}' wird bereits geladen.`);
            return;
        }

        this.expandingNodes.add(id);
        console.log(`[ContextMenuHandler] Starte dynamische Nachbarschafts-Expansion fuer '${label}'...`);

        document.dispatchEvent(new CustomEvent('nodges-status-message', {
            detail: { message: `Lade Nachbarschaft fuer '${label}'...`, type: 'info' }
        }));

        try {
            let expandedSomething = false;

            // 1. LightRAG-Abfrage versuchen
            try {
                const health = await LightRAGService.checkHealth();
                if (health.online) {
                    const activeRelations = typeof window !== 'undefined'
                        ? (window as any).app?.uiManager?.createPanel?.getActiveRelationLabels() || []
                        : [];
                    const res = await LightRAGService.queryGraphBuild14(label, 'local', undefined, activeRelations);
                    if (res && res.graphData && res.graphData.data) {
                        const { entities, relationships } = res.graphData.data;
                        if (entities.length > 0 || relationships.length > 0) {
                            const result = this.stateManager.mergeGraphData(
                                entities,
                                relationships,
                                `LightRAG Expansion: ${label}`
                            );
                            if (result.addedNodes > 0 || result.addedEdges > 0) {
                                expandedSomething = true;
                                console.log(`[ContextMenuHandler] LightRAG: +${result.addedNodes} Knoten, +${result.addedEdges} Kanten`);
                                document.dispatchEvent(new CustomEvent('nodges-status-message', {
                                    detail: {
                                        message: `LightRAG: ${result.addedNodes} neue Knoten und ${result.addedEdges} neue Kanten geladen.`,
                                        type: 'success'
                                    }
                                }));
                            }
                        }
                    }
                }
            } catch (lrErr) {
                console.warn('[ContextMenuHandler] LightRAG-Expansion nicht verfuegbar oder fehlgeschlagen:', lrErr);
            }

            // 2. Wikidata / Deep Dive Fallback, wenn nichts durch LightRAG expandiert wurde und Q-ID vorhanden
            const qId = data.wikidata_id || '';
            if (!expandedSomething && qId) {
                document.dispatchEvent(new CustomEvent('nodges-deep-dive', {
                    detail: { label, qId, data }
                }));
            } else if (!expandedSomething) {
                document.dispatchEvent(new CustomEvent('nodges-status-message', {
                    detail: { message: `Keine weiteren Nachbarn fuer '${label}' in der Wissensbasis gefunden.`, type: 'info' }
                }));
            }
        } catch (err: any) {
            console.error('[ContextMenuHandler] Fehler bei Nachbarschafts-Expansion:', err);
        } finally {
            this.expandingNodes.delete(id);
        }
    }

    /**
     * Zeigt das Kontextmenue an, angepasst an Modus und selektiertes Objekt
     */
    showContextMenu(object: THREE.Object3D | null, event: any) {
        const modeInfo = this.getModeInfo();
        const mode = modeInfo.type;
        const options: ContextMenuOption[] = [];
        let header: ContextMenuHeader;

        const selectedObjects = this.stateManager.getSelectedObjects();

        // FALL 1: Klick auf einen einzelnen Knoten
        if (object && object.userData.type === 'node') {
            const data = object.userData.nodeData || object.userData.entity || {};
            const id = String(object.userData.id || data.id || '');
            const label = String(data.label || id || 'Knoten');
            const entityType = String(data.entity_type || data.type || 'Konzept');

            const allRelations = this.stateManager.getRelationships();
            const connectedEdges = allRelations.filter(r => String(r.source) === id || String(r.target) === id);
            const edgeCount = connectedEdges.length;

            header = {
                title: `Knoten: ${label}`,
                modeBadge: modeInfo.badge,
                modeBadgeType: modeInfo.type,
                subtitle: `${entityType} • ${edgeCount} ${edgeCount === 1 ? 'Verbindung' : 'Verbindungen'}`
            };

            // 1. Navigation & Ansicht
            options.push({
                label: 'Zentrieren & Fokussieren',
                action: () => {
                    this.stateManager.setSelectedObject(object);
                    this.selectionHandler.focusOnObject(object);
                }
            });

            options.push({
                label: 'Nachbarschaft hervorheben',
                action: () => {
                    this.stateManager.setSelectedObject(object);
                }
            });

            // 2. Expansion (Wissensgraph & LightRAG)
            options.push({
                label: 'Nachbarschaft nachladen (1-Hop)',
                badge: 'Wissensbasis',
                action: () => this.expandNodeNeighborhood(object)
            });

            options.push({
                label: 'Automatisches Nachladen',
                isToggle: true,
                isActive: !!this.stateManager.state.dynamicNeighborExpansionEnabled,
                action: () => {
                    const next = !this.stateManager.state.dynamicNeighborExpansionEnabled;
                    this.stateManager.update({ dynamicNeighborExpansionEnabled: next });
                    console.log(`[ContextMenuHandler] Automatisches Nachladen: ${next ? 'Aktiviert' : 'Deaktiviert'}`);
                }
            });

            options.push({ separator: true, label: '' });

            // 3. Bearbeitung & Transformation
            options.push({
                label: 'Daten bearbeiten',
                action: () => {
                    this.dataEditor.show(data, (updatedData: any) => {
                        if (id) {
                            this.stateManager.updateNode(id, updatedData);
                        }
                        this.stateManager.setSelectedObject(object);
                    });
                }
            });

            options.push({
                label: 'Knoten verschieben',
                action: () => {
                    this.nodeCreationHandler.moveExistingNode(object);
                }
            });

            // Experte / Dev: Duplizieren & Deep Dive
            if (mode === 'expert' || mode === 'dev') {
                options.push({
                    label: 'Duplizieren',
                    action: () => {
                        if (!selectedObjects.has(object) && !this.selectionHandler.findEquivalentObject(selectedObjects, object)) {
                            this.stateManager.setSelectedObject(object);
                        }
                        this.selectionHandler.duplicateSelected();
                    }
                });

                options.push({
                    label: 'Deep Dive (Wikidata / LLM)',
                    badge: 'SPARQL',
                    action: () => {
                        const qId = data.wikidata_id || '';
                        console.log(`Starte Deep Dive fuer: ${label} (${qId})`);
                        document.dispatchEvent(new CustomEvent('nodges-deep-dive', {
                            detail: { label, qId, data }
                        }));
                    }
                });
            }

            // Dev-Modus Extras: ID kopieren & Rohdaten inspizieren
            if (mode === 'dev') {
                options.push({ separator: true, label: '' });
                options.push({
                    label: 'Node-ID kopieren',
                    badge: id.substring(0, 8),
                    action: () => {
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                            navigator.clipboard.writeText(id);
                        }
                        console.log('[Dev] Node-ID:', id);
                    }
                });
                options.push({
                    label: 'Rohdaten in Konsole loggen',
                    badge: 'Console',
                    action: () => {
                        console.log('[Dev Node Inspector]', { id, label, data, object3D: object });
                    }
                });
            }

            options.push({ separator: true, label: '' });

            // Loeschen (Gefahr)
            options.push({
                label: 'Knoten löschen',
                danger: true,
                action: () => {
                    if (!selectedObjects.has(object) && !this.selectionHandler.findEquivalentObject(selectedObjects, object)) {
                        this.stateManager.setSelectedObject(object);
                    }
                    this.selectionHandler.deleteSelected();
                }
            });

        // FALL 2: Klick auf eine Kante
        } else if (object && object.userData.type === 'edge') {
            const edgeData = object.userData.edge || object.userData.relationship || {};
            const id = edgeData.id;
            const source = edgeData.source || 'Quelle';
            const target = edgeData.target || 'Ziel';
            const relation = edgeData.relation || 'Verbindung';
            const weight = edgeData.weight !== undefined ? edgeData.weight : 1.0;

            header = {
                title: `Kante: ${source} → ${target}`,
                modeBadge: modeInfo.badge,
                modeBadgeType: modeInfo.type,
                subtitle: `Relation: "${relation}" • Stärke: ${weight}`
            };

            options.push({
                label: 'Relation & Daten bearbeiten',
                action: () => {
                    this.dataEditor.show(edgeData, (updatedData: any) => {
                        if (id) {
                            this.stateManager.updateEdge(id, updatedData);
                        }
                        this.stateManager.setSelectedObject(object);
                    });
                }
            });

            options.push({
                label: `Quellknoten '${source}' fokussieren`,
                action: () => this.focusNodeById(source)
            });

            options.push({
                label: `Zielknoten '${target}' fokussieren`,
                action: () => this.focusNodeById(target)
            });

            if (mode === 'expert' || mode === 'dev') {
                options.push({ separator: true, label: '' });
                options.push({
                    label: 'Richtung umkehren',
                    action: () => this.reverseEdge(edgeData)
                });
                options.push({
                    label: 'Kante duplizieren',
                    action: () => {
                        if (!selectedObjects.has(object) && !this.selectionHandler.findEquivalentObject(selectedObjects, object)) {
                            this.stateManager.setSelectedObject(object);
                        }
                        this.selectionHandler.duplicateSelected();
                    }
                });
            }

            options.push({ separator: true, label: '' });

            options.push({
                label: 'Kante löschen',
                danger: true,
                action: () => {
                    if (!selectedObjects.has(object) && !this.selectionHandler.findEquivalentObject(selectedObjects, object)) {
                        this.stateManager.setSelectedObject(object);
                    }
                    this.selectionHandler.deleteSelected();
                }
            });

        // FALL 3: Mehrfachauswahl aktiv
        } else if (selectedObjects.size > 1) {
            const nodesCount = Array.from(selectedObjects).filter(o => o.userData.type === 'node').length;
            const edgesCount = Array.from(selectedObjects).filter(o => o.userData.type === 'edge').length;

            header = {
                title: `Mehrfachauswahl (${selectedObjects.size} Objekte)`,
                modeBadge: modeInfo.badge,
                modeBadgeType: modeInfo.type,
                subtitle: `${nodesCount} Knoten, ${edgesCount} Kanten ausgewählt`
            };

            options.push({
                label: 'Auswahl duplizieren',
                action: () => this.selectionHandler.duplicateSelected()
            });

            options.push({
                label: 'Auswahl aufheben',
                action: () => this.selectionHandler.deselectAll()
            });

            options.push({ separator: true, label: '' });

            options.push({
                label: `Alle ausgewählten löschen (${selectedObjects.size})`,
                danger: true,
                action: () => this.selectionHandler.deleteSelected()
            });

        // FALL 4: Freier 3D-Canvas (Klick ins Leere)
        } else {
            const hasNodeSelection = Array.from(selectedObjects).some(obj => obj.userData.type === 'node');
            const totalEntities = this.stateManager.getEntities().length;
            const totalRelations = this.stateManager.getRelationships().length;

            header = {
                title: '3D-Canvas',
                modeBadge: modeInfo.badge,
                modeBadgeType: modeInfo.type,
                subtitle: `Graph: ${totalEntities} Knoten, ${totalRelations} Kanten`
            };

            options.push({
                label: 'Neuer Knoten an Cursor-Position',
                action: () => this.nodeCreationHandler.createNewNode(event)
            });

            options.push({
                label: 'Neue Kante ziehen',
                disabled: !hasNodeSelection,
                badge: hasNodeSelection ? 'Bereit' : 'Benötigt Knoten',
                action: () => this.nodeCreationHandler.startEdgeCreationMode()
            });

            options.push({ separator: true, label: '' });

            options.push({
                label: 'Ansicht einpassen (Fit to View)',
                action: () => this.fitCameraToScene()
            });

            options.push({
                label: 'Automatisches Nachladen bei Klick',
                isToggle: true,
                isActive: !!this.stateManager.state.dynamicNeighborExpansionEnabled,
                action: () => {
                    const next = !this.stateManager.state.dynamicNeighborExpansionEnabled;
                    this.stateManager.update({ dynamicNeighborExpansionEnabled: next });
                    console.log(`[ContextMenuHandler] Automatisches Nachladen: ${next ? 'Aktiviert' : 'Deaktiviert'}`);
                }
            });

            if (selectedObjects.size > 0) {
                options.push({ separator: true, label: '' });
                options.push({
                    label: 'Auswahl aufheben',
                    action: () => this.selectionHandler.deselectAll()
                });
            }
        }

        this.contextMenu.show(event.clientX, event.clientY, options, header);
    }
}
