import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateManager } from '../core/StateManager';
import type { EntityData, RelationshipData } from '../types';

describe('StateManager', () => {
    let stateManager: StateManager;

    beforeEach(() => {
        stateManager = new StateManager();
    });

    describe('GraphData Management', () => {
        it('sollte GraphData setzen und abrufen koennen', () => {
            const entities: EntityData[] = [
                { id: '1', type: 'person', label: 'Alice' },
                { id: '2', type: 'person', label: 'Bob' },
            ];

            const relationships: RelationshipData[] = [
                { type: 'knows', source: '1', target: '2' },
            ];

            stateManager.setGraphData(entities, relationships);

            expect(stateManager.getEntities()).toHaveLength(2);
            expect(stateManager.getRelationships()).toHaveLength(1);
        });

        it('sollte leere Listen akzeptieren', () => {
            stateManager.setGraphData([], []);

            expect(stateManager.getEntities()).toHaveLength(0);
            expect(stateManager.getRelationships()).toHaveLength(0);
        });

        it('sollte vorherige Daten ueberschreiben', () => {
            stateManager.setGraphData(
                [{ id: '1', type: 'a' }],
                []
            );
            expect(stateManager.getEntities()).toHaveLength(1);

            stateManager.setGraphData(
                [{ id: '2', type: 'b' }, { id: '3', type: 'c' }],
                [{ type: 'x', source: '2', target: '3' }]
            );
            expect(stateManager.getEntities()).toHaveLength(2);
            expect(stateManager.getRelationships()).toHaveLength(1);
            expect(stateManager.getEntities()[0].id).toBe('2');
        });
    });

    describe('Subscription System', () => {
        it('sollte Subscriber benachrichtigen bei State-Updates', () => {
            const callback = vi.fn();

            stateManager.subscribe(callback);
            stateManager.update({ layoutEnabled: true });

            expect(callback).toHaveBeenCalled();
            expect(stateManager.state.layoutEnabled).toBe(true);
        });

        it('sollte Unsubscribe korrekt verarbeiten', () => {
            const callback = vi.fn();

            const unsubscribe = stateManager.subscribe(callback);
            stateManager.update({ layoutEnabled: true });

            expect(callback).toHaveBeenCalledTimes(2);

            unsubscribe();
            stateManager.update({ layoutEnabled: false });

            // Sollte nicht erneut aufgerufen werden
            expect(callback).toHaveBeenCalledTimes(2);
        });

        it('sollte Category-basiertes Subscribing unterstuetzen', () => {
            const categoryCallback = vi.fn();
            const defaultCallback = vi.fn();

            stateManager.subscribe(categoryCallback, 'custom');
            stateManager.subscribe(defaultCallback);

            stateManager.update({ layoutEnabled: true });

            // Beide sollten benachrichtigt werden
            expect(categoryCallback).toHaveBeenCalled();
            expect(defaultCallback).toHaveBeenCalled();
        });

        it('sollte mehrere Subscriber in derselben Kategorie erlauben', () => {
            const cb1 = vi.fn();
            const cb2 = vi.fn();

            stateManager.subscribe(cb1, 'ui');
            stateManager.subscribe(cb2, 'ui');

            stateManager.update({ tooltipVisible: true });

            expect(cb1).toHaveBeenCalled();
            expect(cb2).toHaveBeenCalled();
        });

        it('sollte den aktuellen State an Subscriber uebergeben', () => {
            let receivedState: unknown = null;

            stateManager.subscribe((state) => {
                receivedState = state;
            });

            stateManager.update({ backgroundColor: '#ff0000' });

            expect(receivedState).toBeDefined();
            expect((receivedState as { backgroundColor: string }).backgroundColor).toBe('#ff0000');
        });

        it('sollte Subscriber gezielt nach Kategorie benachrichtigen', () => {
            const uiCallback = vi.fn();
            const selectionCallback = vi.fn();
            const defaultCallback = vi.fn();

            stateManager.subscribe(uiCallback, 'ui');
            stateManager.subscribe(selectionCallback, 'selection');
            stateManager.subscribe(defaultCallback);

            // Alle 3 werden initial aufgerufen (durch subscribe)
            expect(uiCallback).toHaveBeenCalledTimes(1);
            expect(selectionCallback).toHaveBeenCalledTimes(1);
            expect(defaultCallback).toHaveBeenCalledTimes(1);

            // Tooltip-Aenderung betrifft nur UI und DEFAULT
            stateManager.update({ tooltipVisible: true });

            expect(uiCallback).toHaveBeenCalledTimes(2);       // UI wird benachrichtigt
            expect(selectionCallback).toHaveBeenCalledTimes(1); // Selection nicht betroffen
            expect(defaultCallback).toHaveBeenCalledTimes(2);   // Default immer benachrichtigt
        });

        it('sollte Default-Subscriber bei allen Aenderungen benachrichtigen', () => {
            const defaultCallback = vi.fn();
            stateManager.subscribe(defaultCallback);

            expect(defaultCallback).toHaveBeenCalledTimes(1); // Initial

            stateManager.update({ tooltipVisible: true });    // UI
            stateManager.update({ layoutEnabled: true });     // System
            stateManager.update({ backgroundColor: '#000' }); // Environment

            expect(defaultCallback).toHaveBeenCalledTimes(4); // 1 initial + 3 updates
        });

        it('sollte unbekannte Kategorien nie durch update() benachrichtigen', () => {
            const customCallback = vi.fn();
            stateManager.subscribe(customCallback, 'my_custom');

            expect(customCallback).toHaveBeenCalledTimes(1); // Nur initial

            stateManager.update({ tooltipVisible: true });
            stateManager.update({ layoutEnabled: false });

            // custom wird nie durch update() benachrichtigt, nur initial
            expect(customCallback).toHaveBeenCalledTimes(1);
        });
    });

    describe('Batch Updates', () => {
        it('sollte mehrere Updates batchen', () => {
            const callback = vi.fn();

            stateManager.subscribe(callback);

            stateManager.batchUpdate({
                layoutEnabled: true,
                currentLayout: 'force',
            });

            expect(callback).toHaveBeenCalled();
            expect(stateManager.state.layoutEnabled).toBe(true);
            expect(stateManager.state.currentLayout).toBe('force');
        });

        it('sollte den State atomar aktualisieren', () => {
            stateManager.batchUpdate({
                edgeThickness: 0.5,
                edgeTubularSegments: 30,
                edgeRadialSegments: 12,
            });

            expect(stateManager.state.edgeThickness).toBe(0.5);
            expect(stateManager.state.edgeTubularSegments).toBe(30);
            expect(stateManager.state.edgeRadialSegments).toBe(12);
        });

        it('sollte vorhandene State-Werte beibehalten', () => {
            const initialBg = stateManager.state.backgroundColor;

            stateManager.batchUpdate({ layoutEnabled: true });

            expect(stateManager.state.backgroundColor).toBe(initialBg);
        });
    });

    describe('Node Management', () => {
        it('sollte einen neuen Node hinzufuegen', () => {
            const newNode: EntityData = {
                id: '1',
                type: 'person',
                label: 'Alice',
                position: { x: 0, y: 0, z: 0 },
            };

            stateManager.addNode(newNode);

            const entities = stateManager.getEntities();
            expect(entities).toHaveLength(1);
            expect(entities[0].id).toBe('1');
        });

        it('sollte einen Node aktualisieren', () => {
            const node: EntityData = {
                id: '1',
                type: 'person',
                label: 'Initial',
            };

            stateManager.addNode(node);

            const updatedNode: EntityData = {
                id: '1',
                type: 'person',
                label: 'Updated',
            };

            stateManager.updateNode('1', updatedNode);

            const entities = stateManager.getEntities();
            expect(entities[0].label).toBe('Updated');
        });

        it('sollte einen Node entfernen', () => {
            const node: EntityData = { id: '1', type: 'person' };

            stateManager.addNode(node);
            expect(stateManager.getEntities()).toHaveLength(1);

            stateManager.removeNode('1');
            expect(stateManager.getEntities()).toHaveLength(0);
        });

        it('sollte nichts tun beim Entfernen eines nicht existierenden Nodes', () => {
            stateManager.addNode({ id: '1', type: 'a' });
            stateManager.removeNode('nonexistent');

            expect(stateManager.getEntities()).toHaveLength(1);
        });

        it.skip('sollte updateNode mit skipHistory unterstuetzen', () => {
            stateManager.addNode({ id: '1', type: 'a', label: 'V1' });
            stateManager.updateNode('1', { label: 'V2' }, true);

            expect(stateManager.getEntities()[0].label).toBe('V2');

            // Undo sollte nicht updateNode rueckgaengig machen, sondern addNode
            stateManager.undo();
            expect(stateManager.getEntities()).toHaveLength(0);
        });
    });

    describe('Edge Management', () => {
        it('sollte eine Edge hinzufuegen', () => {
            const edge: RelationshipData = {
                id: 'edge1',
                type: 'knows',
                source: '1',
                target: '2',
            };

            stateManager.addEdge(edge);

            const relationships = stateManager.getRelationships();
            expect(relationships).toHaveLength(1);
            expect(relationships[0].id).toBe('edge1');
        });

        it('sollte eine Edge entfernen', () => {
            const edge: RelationshipData = {
                id: 'edge1',
                type: 'knows',
                source: '1',
                target: '2',
            };

            stateManager.addEdge(edge);
            expect(stateManager.getRelationships()).toHaveLength(1);

            stateManager.removeEdge('edge1');
            expect(stateManager.getRelationships()).toHaveLength(0);
        });

        it('sollte eine Edge aktualisieren', () => {
            const edge: RelationshipData = {
                id: 'edge1',
                type: 'knows',
                source: '1',
                target: '2',
                label: 'Original',
            };

            stateManager.addEdge(edge);
            stateManager.updateEdge('edge1', { label: 'Updated' });

            expect(stateManager.getRelationships()[0].label).toBe('Updated');
        });

        it.skip('sollte updateEdge rueckgaengig machen koennen', () => {
            const edge: RelationshipData = {
                id: 'e1',
                type: 'knows',
                source: '1',
                target: '2',
                label: 'V1',
            };

            stateManager.addEdge(edge);
            stateManager.updateEdge('e1', { label: 'V2' });

            expect(stateManager.getRelationships()[0].label).toBe('V2');

            stateManager.undo();
            expect(stateManager.getRelationships()[0].label).toBe('V1');
        });

        it('sollte removeEdge rueckgaengig machen koennen', () => {
            const edge: RelationshipData = {
                id: 'e1',
                type: 'knows',
                source: '1',
                target: '2',
            };

            stateManager.addEdge(edge);
            stateManager.removeEdge('e1');
            expect(stateManager.getRelationships()).toHaveLength(0);

            stateManager.undo();
            expect(stateManager.getRelationships()).toHaveLength(1);
        });
    });

    describe('Undo/Redo System', () => {
        it('sollte addNode rueckgaengig machen koennen', () => {
            const node: EntityData = { id: '1', type: 'person' };

            stateManager.addNode(node);
            expect(stateManager.getEntities()).toHaveLength(1);

            stateManager.undo();
            expect(stateManager.getEntities()).toHaveLength(0);
        });

        it('sollte removeNode rueckgaengig machen koennen', () => {
            const node: EntityData = { id: '1', type: 'person' };

            stateManager.addNode(node);
            stateManager.removeNode('1');
            expect(stateManager.getEntities()).toHaveLength(0);

            stateManager.undo();
            expect(stateManager.getEntities()).toHaveLength(1);
        });

        it('sollte redo nach undo durchfuehren koennen', () => {
            const node: EntityData = { id: '1', type: 'person' };

            stateManager.addNode(node);
            expect(stateManager.getEntities()).toHaveLength(1);

            stateManager.undo();
            expect(stateManager.getEntities()).toHaveLength(0);

            stateManager.redo();
            expect(stateManager.getEntities()).toHaveLength(1);
        });

        it('sollte nichts tun bei undo ohne History', () => {
            stateManager.undo();
            // Kein Fehler erwartet
            expect(stateManager.getEntities()).toHaveLength(0);
        });

        it('sollte nichts tun bei redo ohne vorheriges undo', () => {
            stateManager.redo();
            // Kein Fehler erwartet
            expect(stateManager.getEntities()).toHaveLength(0);
        });

        it('sollte redo-Stack nach neuem Action loeschen', () => {
            stateManager.addNode({ id: '1', type: 'a' });
            stateManager.addNode({ id: '2', type: 'b' });

            stateManager.undo(); // Entfernt Node 2
            expect(stateManager.getEntities()).toHaveLength(1);

            // Neue Aktion: redo-Stack wird geleert
            stateManager.addNode({ id: '3', type: 'c' });

            stateManager.redo(); // Sollte nichts tun
            expect(stateManager.getEntities()).toHaveLength(2);
            expect(stateManager.getEntities().map(e => e.id)).toContain('3');
        });

        it('sollte History-Limit von 50 einhalten', () => {
            for (let i = 0; i < 60; i++) {
                stateManager.addNode({ id: `node_${i}`, type: 'test' });
            }

            // 60 Nodes hinzugefuegt, aber nur 50 History-Eintraege
            // 60 undo-Versuche sollten nicht alle 60 rueckgaengig machen koennen
            for (let i = 0; i < 60; i++) {
                stateManager.undo();
            }

            // Es sollten mindestens 10 Nodes uebrig sein (die ersten 10 haben keine History mehr)
            expect(stateManager.getEntities().length).toBeGreaterThanOrEqual(10);
        });
    });

    describe('Transaktionen', () => {
        it('sollte eine Transaktion beginnen und committen', () => {
            stateManager.beginTransaction('Mehrere Nodes hinzufuegen');

            stateManager.addNode({ id: '1', type: 'a' });
            stateManager.addNode({ id: '2', type: 'b' });
            stateManager.addNode({ id: '3', type: 'c' });

            stateManager.commitTransaction();

            expect(stateManager.getEntities()).toHaveLength(3);
        });

        it('sollte eine committete Transaktion als Ganzes rueckgaengig machen', () => {
            stateManager.beginTransaction('Batch Add');

            stateManager.addNode({ id: '1', type: 'a' });
            stateManager.addNode({ id: '2', type: 'b' });
            stateManager.addNode({ id: '3', type: 'c' });

            stateManager.commitTransaction();

            expect(stateManager.getEntities()).toHaveLength(3);

            stateManager.undo();
            expect(stateManager.getEntities()).toHaveLength(0);
        });

        it('sollte eine committete Transaktion nach undo wiederherstellenkoennen', () => {
            stateManager.beginTransaction('Batch');

            stateManager.addNode({ id: '1', type: 'a' });
            stateManager.addNode({ id: '2', type: 'b' });

            stateManager.commitTransaction();

            stateManager.undo();
            expect(stateManager.getEntities()).toHaveLength(0);

            stateManager.redo();
            expect(stateManager.getEntities()).toHaveLength(2);
        });

        it('sollte eine Transaktion abbrechen koennen', () => {
            stateManager.beginTransaction('Wird abgebrochen');

            stateManager.addNode({ id: '1', type: 'a' });

            stateManager.cancelTransaction();

            // Der Node wurde trotzdem zum State hinzugefuegt (cancel loescht nur den Batch)
            expect(stateManager.getEntities()).toHaveLength(1);

            // Undo sollte NICHT die gebatchten Aktionen rueckgaengig machen
            // (da die Transaktion abgebrochen wurde, gibt es keine Batch-History)
        });

        it('sollte verschachtelte beginTransaction ignorieren', () => {
            stateManager.beginTransaction('Erste');
            stateManager.beginTransaction('Zweite'); // Sollte ignoriert werden

            stateManager.addNode({ id: '1', type: 'a' });

            stateManager.commitTransaction();

            expect(stateManager.getEntities()).toHaveLength(1);
        });

        it('sollte leere Transaktionen korrekt committen', () => {
            stateManager.beginTransaction('Leer');
            stateManager.commitTransaction();

            // Kein Fehler erwartet
            expect(stateManager.getEntities()).toHaveLength(0);
        });
    });

    describe('Tooltip Management', () => {
        it('sollte Tooltip anzeigen', () => {
            stateManager.showTooltip('Test Content', { x: 100, y: 100 });

            expect(stateManager.state.tooltipVisible).toBe(true);
            expect(stateManager.state.tooltipContent).toBe('Test Content');
            expect(stateManager.state.tooltipPosition).toEqual({ x: 100, y: 100 });
        });

        it('sollte Tooltip ausblenden', () => {
            stateManager.showTooltip('Test', { x: 0, y: 0 });
            stateManager.hideTooltip();

            expect(stateManager.state.tooltipVisible).toBe(false);
            expect(stateManager.state.tooltipContent).toBe(null);
        });
    });

    describe('Tool und Interaction State', () => {
        it('sollte das aktuelle Tool setzen', () => {
            stateManager.setCurrentTool('select');
            expect(stateManager.state.currentTool).toBe('select');

            stateManager.setCurrentTool('pan');
            expect(stateManager.state.currentTool).toBe('pan');
        });

        it('sollte keinen zusaetzlichen Update ausloesen wenn Tool gleich bleibt', () => {
            stateManager.setCurrentTool('pan');
            const callback = vi.fn();
            stateManager.subscribe(callback);

            // subscribe ruft den Callback sofort 1x mit Initialzustand auf
            expect(callback).toHaveBeenCalledTimes(1);

            stateManager.setCurrentTool('pan'); // Gleiches Tool
            // Kein weiterer Aufruf erwartet
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('sollte Interaction enabled/disabled setzen', () => {
            stateManager.setInteractionEnabled(false);
            expect(stateManager.state.isInteractionEnabled).toBe(false);

            stateManager.setInteractionEnabled(true);
            expect(stateManager.state.isInteractionEnabled).toBe(true);
        });
    });

    describe('Highlight State', () => {
        it('sollte highlight effects toggle', () => {
            stateManager.update({ highlightEffectsEnabled: false });
            expect(stateManager.state.highlightEffectsEnabled).toBe(false);

            stateManager.update({ highlightEffectsEnabled: true });
            expect(stateManager.state.highlightEffectsEnabled).toBe(true);
        });
    });

    describe('Initialer State', () => {
        it('sollte Standardwerte fuer Edge-Parameter haben', () => {
            expect(stateManager.state.edgeThickness).toBeDefined();
            expect(stateManager.state.edgeTubularSegments).toBeDefined();
            expect(stateManager.state.edgeRadialSegments).toBeDefined();
            expect(stateManager.state.edgeCurveFactor).toBeDefined();
        });

        it('sollte Standardwerte fuer Anzeige-Settings haben', () => {
            expect(stateManager.state.showLabelsAlways).toBeDefined();
            expect(stateManager.state.showLabelsOnHover).toBeDefined();
            expect(stateManager.state.activeColorScheme).toBeDefined();
        });

        it('sollte leere GraphData als Default haben', () => {
            expect(stateManager.state.graphData.entities).toEqual([]);
            expect(stateManager.state.graphData.relationships).toEqual([]);
        });

        it('sollte keine Selektion als Default haben', () => {
            expect(stateManager.state.selectedObject).toBeNull();
            expect(stateManager.state.selectedObjects.size).toBe(0);
            expect(stateManager.state.hoveredObject).toBeNull();
        });
    });
});
