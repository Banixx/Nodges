import * as THREE from 'three';

export interface NodeData {
    id: string | number;
    name?: string;
    x: number;
    y: number;
    z: number;
    type?: string;
    [key: string]: any;
}

export interface EdgeData {
    start: number | string; // Index or ID of start node
    end: number | string;   // Index or ID of end node
    name?: string;
    type?: string;
    [key: string]: any;
}

export interface AppState {
    selectedObject: THREE.Object3D | null;
    hoveredObject: THREE.Object3D | null;
    layoutEnabled: boolean;
    isLayoutRunning: boolean;
    currentLayout: string;
    // Add other state properties as needed
}

export interface NodeObject {
    index: number;
    position: THREE.Vector3;
    mesh: THREE.Object3D;
    geometryType: string;
    nodeData: NodeData;
}

export interface EdgeObject {
    line?: THREE.Line;
    tube?: THREE.Mesh;
    options: any;
    updatePositions?: (start: THREE.Vector3, end: THREE.Vector3) => void;
}
