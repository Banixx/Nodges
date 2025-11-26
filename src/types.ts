import * as THREE from 'three';

// ============================================================================
// Legacy Types (for backward compatibility)
// ============================================================================

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

// ============================================================================
// Future Format Types
// ============================================================================

// Data Model Schema
export interface PropertySchema {
    type: 'continuous' | 'categorical' | 'vector' | 'spatial' | 'temporal';
    range?: [number, number];
    unit?: string;
    dimensions?: string[];
    values?: string[];
    coordinates?: string[];
}

export interface EntityTypeSchema {
    properties: Record<string, PropertySchema>;
}

export interface RelationshipTypeSchema {
    properties: Record<string, PropertySchema>;
}

export interface DataModel {
    entities: Record<string, EntityTypeSchema>;
    relationships: Record<string, RelationshipTypeSchema>;
}

// Visual Mappings
export type MappingFunction =
    | 'linear'
    | 'exponential'
    | 'logarithmic'
    | 'heatmap'
    | 'bipolar'
    | 'pulse'
    | 'geographic'
    | 'sphereComplexity';

export interface VisualMapping {
    source: string;
    function: MappingFunction;
    range?: [number, number];
    palette?: string;
    params?: Record<string, any>;
}

export interface EntityVisualPreset {
    position?: VisualMapping;
    size?: VisualMapping;
    color?: VisualMapping;
    geometry?: VisualMapping;
    glow?: VisualMapping;
}

export interface RelationshipVisualPreset {
    thickness?: VisualMapping;
    color?: VisualMapping;
    curvature?: VisualMapping;
    glow?: VisualMapping;
    opacity?: VisualMapping;
}

export interface VisualMappings {
    defaultPresets: Record<string, EntityVisualPreset | RelationshipVisualPreset>;
}

// Entity and Relationship Data
export interface EntityData {
    id: string;
    type: string;
    label?: string;
    position?: { x: number; y: number; z: number };
    [key: string]: any;
}

export interface RelationshipData {
    id?: string;
    type: string;
    source: string;
    target: string;
    label?: string;
    [key: string]: any;
}

// Main Graph Data Structure
export interface GraphData {
    system: string;
    metadata: {
        created?: string;
        version?: string;
        author?: string;
        description?: string;
        [key: string]: any;
    };
    dataModel?: DataModel;
    visualMappings?: VisualMappings;
    data: {
        entities: EntityData[];
        relationships: RelationshipData[];
    };
}

// ============================================================================
// Application State
// ============================================================================

export interface AppState {
    selectedObject: THREE.Object3D | null;
    hoveredObject: THREE.Object3D | null;
    layoutEnabled: boolean;
    isLayoutRunning: boolean;
    currentLayout: string;
    // Add other state properties as needed
}

// ============================================================================
// 3D Object Wrappers
// ============================================================================

export interface NodeObject {
    index: number;
    position: THREE.Vector3;
    mesh: THREE.Object3D;
    geometryType: string;
    nodeData: NodeData | EntityData;
}

export interface EdgeObject {
    line?: THREE.Line;
    tube?: THREE.Mesh;
    options: any;
    updatePositions?: (start: THREE.Vector3, end: THREE.Vector3) => void;
}

// ============================================================================
// Visual Properties (computed from mappings)
// ============================================================================

export interface VisualProperties {
    size?: number;
    color?: THREE.Color | string;
    geometry?: string;
    glow?: number;
    opacity?: number;
    thickness?: number;
    curvature?: number;
}
