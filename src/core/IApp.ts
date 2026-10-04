import * as THREE from 'three';
import type { IStateManager } from './interfaces';
import type { GraphData, EntityData, RelationshipData, VisualMappings } from '../types';

/**
 * Interface representing the core Application contract.
 * Used by UI managers and panels to decouple child components from the App implementation.
 */
export interface IApp {
    stateManager: IStateManager;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: any;

    currentEntities: EntityData[];
    currentRelationships: RelationshipData[];
    currentGraphData?: GraphData | null;

    nodeManager?: any;
    edgeObjectsManager?: any;
    highlightManager?: any;
    selectionManager?: any;
    exportManager?: any;
    fileHandler?: any;
    visualMappingEngine?: any;

    updateVisualMappings?(mappings: VisualMappings): void;
    fitCameraToScene?(): void;
    loadGraphData(data: any, sourceName?: string, shouldAppend?: boolean): Promise<void>;
    loadData(path: string): Promise<void>;
    addData(path: string): Promise<void>;
    removeData(fileId: string): void;
    newGraph(): void;
}
