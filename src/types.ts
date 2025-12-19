import * as THREE from 'three';
import { z } from 'zod';

// ============================================================================
// Legacy Types (for backward compatibility)
// ============================================================================

// @deprecated Use EntityData instead
export interface NodeData {
    id: string | number;
    name?: string;
    x: number;
    y: number;
    z: number;
    type?: string;
    [key: string]: any;
}

// @deprecated Use RelationshipData instead
export interface EdgeData {
    start: number | string; // Index or ID of start node
    end: number | string;   // Index or ID of end node
    name?: string;
    type?: string;
    [key: string]: any;
}

// ============================================================================
// Future Format Types (Zod Definitions)
// ============================================================================

// Data Model Schema
export const PropertySchemaSchema = z.object({
    type: z.enum(['continuous', 'categorical', 'vector', 'spatial', 'temporal']),
    range: z.tuple([z.number(), z.number()]).optional(),
    unit: z.string().optional(),
    dimensions: z.array(z.string()).optional(),
    values: z.array(z.string()).optional(),
    coordinates: z.array(z.string()).optional(),
});
export type PropertySchema = z.infer<typeof PropertySchemaSchema>;

export const EntityTypeSchemaSchema = z.object({
    properties: z.record(PropertySchemaSchema),
});
export type EntityTypeSchema = z.infer<typeof EntityTypeSchemaSchema>;

export const RelationshipTypeSchemaSchema = z.object({
    properties: z.record(PropertySchemaSchema),
});
export type RelationshipTypeSchema = z.infer<typeof RelationshipTypeSchemaSchema>;

export const DataModelSchema = z.object({
    entities: z.record(EntityTypeSchemaSchema),
    relationships: z.record(RelationshipTypeSchemaSchema),
});
export type DataModel = z.infer<typeof DataModelSchema>;

// Visual Mappings
export const MappingFunctionSchema = z.enum([
    'linear', 'exponential', 'logarithmic', 'heatmap',
    'bipolar', 'pulse', 'geographic', 'sphereComplexity'
]);
export type MappingFunction = z.infer<typeof MappingFunctionSchema>;

export const VisualMappingSchema = z.object({
    source: z.string(),
    function: MappingFunctionSchema,
    range: z.tuple([z.number(), z.number()]).optional(),
    palette: z.string().optional(),
    params: z.record(z.any()).optional(),
});
export type VisualMapping = z.infer<typeof VisualMappingSchema>;

export const EntityVisualPresetSchema = z.object({
    position: VisualMappingSchema.optional(),
    size: VisualMappingSchema.optional(),
    color: VisualMappingSchema.optional(),
    geometry: VisualMappingSchema.optional(),
    glow: VisualMappingSchema.optional(),
    animation: VisualMappingSchema.optional(),
});
export type EntityVisualPreset = z.infer<typeof EntityVisualPresetSchema>;

export const RelationshipVisualPresetSchema = z.object({
    thickness: VisualMappingSchema.optional(),
    color: VisualMappingSchema.optional(),
    curvature: VisualMappingSchema.optional(),
    glow: VisualMappingSchema.optional(),
    opacity: VisualMappingSchema.optional(),
    animation: VisualMappingSchema.optional(),
});
export type RelationshipVisualPreset = z.infer<typeof RelationshipVisualPresetSchema>;

export const VisualMappingsSchema = z.object({
    defaultPresets: z.record(z.union([EntityVisualPresetSchema, RelationshipVisualPresetSchema])),
});
export type VisualMappings = z.infer<typeof VisualMappingsSchema>;

// Entity and Relationship Data
export const EntityDataSchema = z.object({
    id: z.string(),
    type: z.string(),
    label: z.string().optional(),
    position: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number()
    }).optional(),
}).passthrough(); // Allow extra properties!
export type EntityData = z.infer<typeof EntityDataSchema>;

export const RelationshipDataSchema = z.object({
    id: z.string().optional(),
    type: z.string(),
    source: z.string(),
    target: z.string(),
    label: z.string().optional(),
}).passthrough(); // Allow extra properties!
export type RelationshipData = z.infer<typeof RelationshipDataSchema>;

// Main Graph Data Structure
export const GraphDataSchema = z.object({
    system: z.string(),
    metadata: z.object({
        created: z.string().optional(),
        version: z.string().optional(),
        author: z.string().optional(),
        description: z.string().optional(),
    }).passthrough(),
    dataModel: DataModelSchema.optional(),
    visualMappings: VisualMappingsSchema.optional(),
    data: z.object({
        entities: z.array(EntityDataSchema),
        relationships: z.array(RelationshipDataSchema),
    }),
});
export type GraphData = z.infer<typeof GraphDataSchema>;

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
    size?: number | any;
    color?: THREE.Color | string | any;
    geometry?: string | any;
    glow?: number | any;
    opacity?: number | any;
    thickness?: number | any;
    curvature?: number | any;
    animation?: any;
}
