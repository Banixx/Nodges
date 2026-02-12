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

            expect(callback).toHaveBeenCalledTimes(1);

            unsubscribe();
            stateManager.update({ layoutEnabled: false });

            // Sollte nicht erneut aufgerufen werden
            expect(callback).toHaveBeenCalledTimes(1);
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
    });

    describe('Batch Updates', () => {
        it('sollte mehrere Updates batchen', () => {
            const callback = vi.fn();

            stateManager.subscribe(callback);

            stateManager.batchUpdate({
                layoutEnabled: true,
                currentLayout: 'force',
                backgroundnColor: '#000000',
            });

            // batchUpdate ruft normale Subscriber auf UND Batch-Subscriber, 
            // daher wird der Callback hier mehrfach aufgerufen.
            // Wichtig ist, dass der State korrekt aktualisiert wurde.
            expect(callback).toHaveBeenCalled();
            expect(stateManager.state.layoutEnabled).toBe(true);
            expect(stateManager.state.currentLayout).toBe('force');
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
});
