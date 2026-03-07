import { EntityData, RelationshipData } from '../types';
import type { State } from './StateManager';
import * as THREE from 'three';

// Zentrale Interfaces fuer Core-Manager

export interface IStateManager {
    state: State;
    getEntities(): EntityData[];
    getRelationships(): RelationshipData[];
    setGraphData(entities: EntityData[], relationships: RelationshipData[]): void;
    subscribe(callback: (state: State) => void, category?: string): () => void;
    update(partialState: Partial<State>): void;
    batchUpdate(updates: Partial<State>): void;
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

import type { EventMap, EventType } from './events/EventTypes';

export interface IEventManager {
    // Event handling methods
    onMouseMove(event: MouseEvent): void;
    onMouseDown(event: MouseEvent): void;
    onMouseUp(event: MouseEvent): void;
    onClick(event: MouseEvent): void;
    setCameraMoving(isMoving: boolean): void;

    // Typsichere Subscription (Phase 5)
    subscribe<K extends EventType>(eventType: K, callback: (data: EventMap[K]) => void): () => void;
    // Fallback fuer unbekannte Event-Typen (Abwaertskompatibilitaet)
    subscribe(eventType: string, callback: (...args: unknown[]) => void): () => void;

    // Typsicheres Publish (Phase 5)
    publish<K extends EventType>(eventType: K, data: EventMap[K]): void;
    // Fallback fuer unbekannte Event-Typen (Abwaertskompatibilitaet)
    publish(eventType: string, data: unknown): void;
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
