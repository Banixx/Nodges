import { EntityData, RelationshipData } from '../types';
import * as THREE from 'three';

// Zentrale Interfaces für Core-Manager

export interface IStateManager {
    state: any;
    getEntities(): EntityData[];
    getRelationships(): RelationshipData[];
    setGraphData(entities: EntityData[], relationships: RelationshipData[]): void;
    subscribe(callback: (state: any) => void, category?: string): () => void;
    update(partialState: any): void;
    batchUpdate(updates: any): void;
    undo(): void;
    redo(): void;

    // Graph Operations
    addNode(data: EntityData): void;
    updateNode(id: string, data: Partial<EntityData>, skipHistory?: boolean): void;
    removeNode(id: string): void;
    addEdge(data: RelationshipData): void;
    updateEdge(id: string, data: Partial<RelationshipData>): void;
    removeEdge(id: string): void;

    // Transaction
    beginTransaction(name: string): void;
    commitTransaction(): void;

    // UI
    showTooltip(content: string, position: { x: number, y: number }): void;
    hideTooltip(): void;
    setHoveredObject(object: THREE.Object3D | null): void;

    // Selection
    setSelectedObjects(objects: Set<THREE.Object3D>): void;
    setSelectedObject(object: THREE.Object3D | null): void;
    getSelectedObject(): THREE.Object3D | null;
    getSelectedObjects(): Set<THREE.Object3D>;
    addToSelection(object: THREE.Object3D): void;
    removeFromSelection(object: THREE.Object3D): void;
    clearSelection(): void;
    isObjectSelected(object: THREE.Object3D): boolean;
}

export interface IEventManager {
    // Event handling methods
    onMouseMove(event: MouseEvent): void;
    onMouseDown(event: MouseEvent): void;
    onMouseUp(event: MouseEvent): void;
    onClick(event: MouseEvent): void;
    setCameraMoving(isMoving: boolean): void;

    // Subscription
    subscribe(eventType: string, callback: Function): () => void;
    publish(eventType: string, data: any): void;
}

export interface INodeManager {
    updateNodes(entities: EntityData[]): void;
    updateNodePositions(entities: EntityData[]): void;
    clear(): void;
    getMeshes(): THREE.Object3D[];
    getNodeAt(geometryType: string, instanceId: number): EntityData | null;
}

export interface IEdgeManager {
    updateEdges(relationships: RelationshipData[], entities: EntityData[]): void;
    updateEdgePositions(entities: EntityData[]): void;
    getMeshes(): THREE.Object3D[];
    dispose(): void;
}
