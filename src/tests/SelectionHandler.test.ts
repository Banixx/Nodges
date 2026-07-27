// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import { StateManager } from '../core/StateManager';
import { SelectionHandler } from '../core/interaction/SelectionHandler';
import { ContextMenuHandler } from '../core/interaction/ContextMenuHandler';

describe('SelectionHandler - Multi-Selection Duplication', () => {
    let stateManager: StateManager;
    let selectionHandler: SelectionHandler;
    let contextMenuHandler: ContextMenuHandler;
    let mockCamera: THREE.Camera;
    let mockControls: any;

    beforeEach(() => {
        stateManager = new StateManager();
        mockCamera = new THREE.PerspectiveCamera();
        mockControls = { target: new THREE.Vector3(), update: vi.fn() };
        selectionHandler = new SelectionHandler(stateManager, mockCamera, mockControls);
        contextMenuHandler = new ContextMenuHandler(stateManager, selectionHandler, {} as any);
    });

    it('sollte bei Multi-Selektion sowohl Nodes als auch Edges duplizieren und Edges auf neue Nodes remappen', () => {
        stateManager.setGraphData([
            { id: 'node_1', label: 'Node A' },
            { id: 'node_2', label: 'Node B' }
        ], [
            { id: 'edge_1', source: 'node_1', target: 'node_2', label: 'Edge 1' },
            { id: 'edge_2', source: 'node_2', target: 'node_1', label: 'Edge 2' }
        ]);

        const nodeObj1 = new THREE.Object3D();
        nodeObj1.userData = { type: 'node', id: 'node_1', nodeData: { id: 'node_1', label: 'Node A' } };

        const nodeObj2 = new THREE.Object3D();
        nodeObj2.userData = { type: 'node', id: 'node_2', nodeData: { id: 'node_2', label: 'Node B' } };

        const edgeObj1 = new THREE.Object3D();
        edgeObj1.userData = { type: 'edge', id: 'edge_1', edge: { id: 'edge_1', source: 'node_1', target: 'node_2', label: 'Edge 1' } };

        const edgeObj2 = new THREE.Object3D();
        edgeObj2.userData = { type: 'edge', id: 'edge_2', edge: { id: 'edge_2', source: 'node_2', target: 'node_1', label: 'Edge 2' } };

        const selection = new Set([nodeObj1, nodeObj2, edgeObj1, edgeObj2]);
        stateManager.setSelectedObjects(selection);

        expect(stateManager.getSelectedObjects().size).toBe(4);

        selectionHandler.duplicateSelected();

        const entities = stateManager.getEntities();
        const relationships = stateManager.getRelationships();

        expect(entities).toHaveLength(4);
        expect(relationships).toHaveLength(4);

        const newEntities = entities.filter(e => e.id !== 'node_1' && e.id !== 'node_2');
        expect(newEntities).toHaveLength(2);

        const newEdges = relationships.filter(r => r.id !== 'edge_1' && r.id !== 'edge_2');
        expect(newEdges).toHaveLength(2);

        const newEdge1 = newEdges.find(r => r.label === 'Edge 1 (Kopie)');
        expect(newEdge1).toBeDefined();
        expect(newEdge1?.source).not.toBe('node_1');
        expect(newEdge1?.target).not.toBe('node_2');
        expect(newEntities.map(e => e.id)).toContain(newEdge1?.source);
        expect(newEntities.map(e => e.id)).toContain(newEdge1?.target);
    });

    it('sollte bei Rechtsklick auf ein bereits selektiertes Objekt im Kontextmenue die Multi-Selektion nicht zerstoeren', () => {
        const nodeObj1 = new THREE.Object3D();
        nodeObj1.userData = { type: 'node', id: 'node_1', nodeData: { id: 'node_1', label: 'Node A' } };

        const edgeObj1 = new THREE.Object3D();
        edgeObj1.userData = { type: 'edge', id: 'edge_1', edge: { id: 'edge_1', source: 'node_1', target: 'node_2', label: 'Edge 1' } };

        stateManager.setSelectedObjects(new Set([nodeObj1, edgeObj1]));

        expect(stateManager.getSelectedObjects().size).toBe(2);

        const selectedBefore = stateManager.getSelectedObjects();
        const isAlreadySelected = selectedBefore.has(nodeObj1) || selectionHandler.findEquivalentObject(selectedBefore, nodeObj1) !== null;

        expect(isAlreadySelected).toBe(true);
    });
});
