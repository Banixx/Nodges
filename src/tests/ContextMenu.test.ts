// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import { StateManager } from '../core/StateManager';
import { SelectionHandler } from '../core/interaction/SelectionHandler';
import { ContextMenuHandler } from '../core/interaction/ContextMenuHandler';
import { ContextMenu } from '../ui/ContextMenu';

describe('ContextMenu & ContextMenuHandler Tests', () => {
    let stateManager: StateManager;
    let selectionHandler: SelectionHandler;
    let nodeCreationHandler: any;
    let mockCamera: THREE.Camera;
    let mockControls: any;
    let mockScene: THREE.Scene;
    let contextMenuHandler: ContextMenuHandler;

    beforeEach(() => {
        document.body.innerHTML = '';
        stateManager = new StateManager();
        mockCamera = new THREE.PerspectiveCamera();
        mockControls = { target: new THREE.Vector3(), update: vi.fn() };
        mockScene = new THREE.Scene();

        selectionHandler = new SelectionHandler(stateManager, mockCamera, mockControls);
        nodeCreationHandler = {
            moveExistingNode: vi.fn(),
            createNewNode: vi.fn(),
            startEdgeCreationMode: vi.fn()
        };

        contextMenuHandler = new ContextMenuHandler(
            stateManager,
            selectionHandler,
            nodeCreationHandler,
            mockCamera,
            mockControls,
            mockScene
        );
    });

    describe('ContextMenu UI Rendering', () => {
        it('sollte Header mit Titel, Modus-Badge und Subtitle rendern', () => {
            const menu = new ContextMenu();
            const action = vi.fn();

            menu.show(100, 100, [
                { label: 'Aktion 1', action },
                { separator: true, label: '' },
                { label: 'Loeschen', action: vi.fn(), danger: true }
            ], {
                title: 'Knoten: Albert Einstein',
                modeBadge: 'Experte',
                modeBadgeType: 'expert',
                subtitle: 'Wissenschaftler • 4 Verbindungen'
            });

            const headerTitle = document.querySelector('.context-menu-title');
            expect(headerTitle).not.toBeNull();
            expect(headerTitle?.textContent).toBe('Knoten: Albert Einstein');

            const badge = document.querySelector('.context-menu-mode-badge');
            expect(badge).not.toBeNull();
            expect(badge?.textContent).toBe('Experte');
            expect(badge?.classList.contains('mode-expert')).toBe(true);

            const subtitle = document.querySelector('.context-menu-subtitle');
            expect(subtitle).not.toBeNull();
            expect(subtitle?.textContent).toBe('Wissenschaftler • 4 Verbindungen');

            const separator = document.querySelector('.context-menu-separator');
            expect(separator).not.toBeNull();

            const dangerItem = document.querySelector('.context-menu-item.danger');
            expect(dangerItem).not.toBeNull();
            expect(dangerItem?.textContent).toContain('Loeschen');
        });
    });

    describe('ContextMenuHandler - Modus-Betitelung & Kontextsensitivitaet', () => {
        it('sollte den Header gemaess aktivem Complexity-Modus betiteln', () => {
            // 1. Einfach
            stateManager.update({ complexityMode: 'simple' });
            const dummyEvent = { clientX: 50, clientY: 50 };
            contextMenuHandler.showContextMenu(null, dummyEvent);

            let badge = document.querySelector('.context-menu-mode-badge');
            expect(badge?.textContent).toBe('Einfach');
            expect(badge?.classList.contains('mode-simple')).toBe(true);

            // 2. Experte
            stateManager.update({ complexityMode: 'expert' });
            contextMenuHandler.showContextMenu(null, dummyEvent);
            badge = document.querySelector('.context-menu-mode-badge');
            expect(badge?.textContent).toBe('Experte');
            expect(badge?.classList.contains('mode-expert')).toBe(true);

            // 3. Dev
            stateManager.update({ complexityMode: 'dev' });
            contextMenuHandler.showContextMenu(null, dummyEvent);
            badge = document.querySelector('.context-menu-mode-badge');
            expect(badge?.textContent).toBe('Entwickler');
            expect(badge?.classList.contains('mode-dev')).toBe(true);
        });

        it('sollte fuer einen Knoten kontextrelevante Aktionen und Nachbarschafts-Optionen anbieten', () => {
            stateManager.update({ complexityMode: 'expert' });
            stateManager.setGraphData([
                { id: 'node_1', label: 'Goethe', entity_type: 'Autor' },
                { id: 'node_2', label: 'Schiller', entity_type: 'Autor' }
            ], [
                { id: 'e1', source: 'node_1', target: 'node_2', relation: 'befreundet_mit' }
            ]);

            const nodeObj = new THREE.Object3D();
            nodeObj.userData = {
                type: 'node',
                id: 'node_1',
                nodeData: { id: 'node_1', label: 'Goethe', entity_type: 'Autor' }
            };

            contextMenuHandler.showContextMenu(nodeObj, { clientX: 100, clientY: 100 });

            const title = document.querySelector('.context-menu-title');
            expect(title?.textContent).toBe('Knoten: Goethe');

            const subtitle = document.querySelector('.context-menu-subtitle');
            expect(subtitle?.textContent).toContain('1 Verbindung');

            const items = Array.from(document.querySelectorAll('.context-menu-item')).map(el => el.textContent?.trim());
            expect(items.some(txt => txt?.includes('Zentrieren & Fokussieren'))).toBe(true);
            expect(items.some(txt => txt?.includes('Nachbarschaft nachladen (1-Hop)'))).toBe(true);
            expect(items.some(txt => txt?.includes('Automatisches Nachladen'))).toBe(true);
            expect(items.some(txt => txt?.includes('Daten bearbeiten'))).toBe(true);
            expect(items.some(txt => txt?.includes('Knoten löschen'))).toBe(true);
        });

        it('sollte fuer eine Kante Quelle, Ziel und Umkehr-Option anbieten', () => {
            stateManager.update({ complexityMode: 'expert' });
            stateManager.setGraphData([
                { id: 'n1', label: 'Paris' },
                { id: 'n2', label: 'Frankreich' }
            ], [
                { id: 'e1', source: 'n1', target: 'n2', relation: 'liegt_in', weight: 2.5 }
            ]);

            const edgeObj = new THREE.Object3D();
            edgeObj.userData = {
                type: 'edge',
                id: 'e1',
                edge: { id: 'e1', source: 'n1', target: 'n2', relation: 'liegt_in', weight: 2.5 }
            };

            contextMenuHandler.showContextMenu(edgeObj, { clientX: 100, clientY: 100 });

            const title = document.querySelector('.context-menu-title');
            expect(title?.textContent).toBe('Kante: n1 → n2');

            const subtitle = document.querySelector('.context-menu-subtitle');
            expect(subtitle?.textContent).toContain('liegt_in');

            const items = Array.from(document.querySelectorAll('.context-menu-item')).map(el => el.textContent?.trim());
            expect(items.some(txt => txt?.includes("Quellknoten 'n1' fokussieren"))).toBe(true);
            expect(items.some(txt => txt?.includes("Zielknoten 'n2' fokussieren"))).toBe(true);
            expect(items.some(txt => txt?.includes('Richtung umkehren'))).toBe(true);
            expect(items.some(txt => txt?.includes('Kante löschen'))).toBe(true);
        });

        it('sollte bei Mehrfachauswahl Stapelaktionen anzeigen', () => {
            const obj1 = new THREE.Object3D();
            obj1.userData = { type: 'node', id: 'n1' };
            const obj2 = new THREE.Object3D();
            obj2.userData = { type: 'node', id: 'n2' };

            stateManager.setSelectedObjects(new Set([obj1, obj2]));

            contextMenuHandler.showContextMenu(null, { clientX: 100, clientY: 100 });

            const title = document.querySelector('.context-menu-title');
            expect(title?.textContent).toContain('Mehrfachauswahl (2 Objekte)');

            const items = Array.from(document.querySelectorAll('.context-menu-item')).map(el => el.textContent?.trim());
            expect(items.some(txt => txt?.includes('Auswahl duplizieren'))).toBe(true);
            expect(items.some(txt => txt?.includes('Auswahl aufheben'))).toBe(true);
            expect(items.some(txt => txt?.includes('Alle ausgewählten löschen (2)'))).toBe(true);
        });
    });

    describe('StateManager.mergeGraphData', () => {
        it('sollte neue Knoten und Kanten ohne Duplikate mergen und Undo/Redo unterstuetzen', () => {
            stateManager.setGraphData([
                { id: 'node_1', label: 'A' }
            ], [
                { id: 'edge_1', source: 'node_1', target: 'node_2', relation: 'r1' }
            ]);

            const newEntities = [
                { id: 'node_1', label: 'A_Duplicate' },
                { id: 'node_2', label: 'B' }
            ];
            const newRelationships = [
                { id: 'edge_1', source: 'node_1', target: 'node_2', relation: 'r1' },
                { id: 'edge_2', source: 'node_2', target: 'node_1', relation: 'r2' }
            ];

            const result = stateManager.mergeGraphData(newEntities, newRelationships, 'Test Merge');

            expect(result.addedNodes).toBe(1); // Nur node_2 war neu
            expect(result.addedEdges).toBe(1); // Nur edge_2 war neu
            expect(stateManager.getEntities().length).toBe(2);
            expect(stateManager.getRelationships().length).toBe(2);

            // Undo pruefen
            stateManager.undo();
            expect(stateManager.getEntities().length).toBe(1);
            expect(stateManager.getRelationships().length).toBe(1);

            // Redo pruefen
            stateManager.redo();
            expect(stateManager.getEntities().length).toBe(2);
            expect(stateManager.getRelationships().length).toBe(2);
        });
    });
});
