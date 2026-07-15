import * as THREE from 'three';
import { z } from 'zod';

// ============================================================================
// Data Model Types (Zod Definitions)
// ============================================================================

// Data Model Schema
export const PropertySchemaSchema = z.object({
    type: z.enum(['continuous', 'categorical', 'vector', 'spatial', 'temporal', 'boolean']),
    range: z.tuple([z.number(), z.number()]).optional(),
    unit: z.string().optional(),
    dimensions: z.array(z.string()).optional(),
    values: z.array(z.string()).optional(),
    coordinates: z.array(z.string()).optional(),
    default: z.any().optional(),
});
export type PropertySchema = z.infer<typeof PropertySchemaSchema>;

export const DataModelSchema = z.object({
    properties: z.record(PropertySchemaSchema).optional().default({}),
    entities: z.record(z.object({
        properties: z.record(PropertySchemaSchema).optional()
    }).passthrough()).optional(),
    relationships: z.record(z.object({
        properties: z.record(PropertySchemaSchema).optional()
    }).passthrough()).optional()
}).passthrough();
export type DataModel = z.infer<typeof DataModelSchema>;

// Visual Mappings
export const MappingFunctionSchema = z.enum([
    'linear', 'exponential', 'logarithmic', 'heatmap',
    'bipolar', 'pulse', 'geographic', 'sphereComplexity',
    'categorical', 'constant'
]);
export type MappingFunction = z.infer<typeof MappingFunctionSchema>;

export const VisualMappingSchema = z.object({
    source: z.string().optional(),
    field: z.string().optional(),
    function: MappingFunctionSchema.optional(),
    domain: z.tuple([z.number(), z.number()]).optional(),
    range: z.union([
        z.tuple([z.number(), z.number()]),
        z.array(z.string()),
        z.array(z.number())
    ]).optional(),
    palette: z.union([z.string(), z.array(z.string())]).optional(),
    params: z.record(z.any()).optional(),
    mapping: z.record(z.any()).optional(),
}).passthrough();
export type VisualMapping = z.infer<typeof VisualMappingSchema>;

export const EntityVisualPresetSchema = z.object({
    position: z.any().optional(),
    positionX: VisualMappingSchema.optional(),
    positionY: VisualMappingSchema.optional(),
    positionZ: VisualMappingSchema.optional(),
    size: VisualMappingSchema.optional(),
    color: VisualMappingSchema.optional(),
    geometry: VisualMappingSchema.optional(),
    glow: VisualMappingSchema.optional(),
    animation: VisualMappingSchema.optional(),
    attraction: VisualMappingSchema.optional(), // Pull
    repulsion: VisualMappingSchema.optional(),  // Push
    inertia: VisualMappingSchema.optional(),    // Mass/Inertia
}).passthrough();
export type EntityVisualPreset = z.infer<typeof EntityVisualPresetSchema>;

export const RelationshipVisualPresetSchema = z.object({
    thickness: VisualMappingSchema.optional(),
    color: VisualMappingSchema.optional(),
    curvature: VisualMappingSchema.optional(),
    glow: VisualMappingSchema.optional(),
    opacity: VisualMappingSchema.optional(),
    animation: VisualMappingSchema.optional(),
    animation_flow: VisualMappingSchema.optional(),
    animation_sequential: VisualMappingSchema.optional(),
    animation_pulse: VisualMappingSchema.optional(),
    animation_segments: VisualMappingSchema.optional(),
}).passthrough();
export type RelationshipVisualPreset = z.infer<typeof RelationshipVisualPresetSchema>;

export const VisualMappingsSchema = z.object({
    defaultPresets: z.record(z.union([EntityVisualPresetSchema, RelationshipVisualPresetSchema])),
});
export type VisualMappings = z.infer<typeof VisualMappingsSchema>;

// Temporal Data (Build 4)
export const TemporalHistorySchema = z.object({
    timestamp: z.number(),
    changes: z.record(z.any())
});

export const TemporalDataSchema = z.object({
    validFrom: z.number().optional().nullable(),
    validTo: z.number().optional().nullable(),
    history: z.array(TemporalHistorySchema).optional()
});
export type TemporalData = z.infer<typeof TemporalDataSchema>;

// Entity and Relationship Data
// Note: passthrough() is intentional - entities/relationships can have
// arbitrary user-defined properties (e.g., age, personality, trust, etc.)
// that are defined in the dataModel schema at runtime, not compile-time.
export const EntityDataSchema = z.object({
    id: z.string(),
    label: z.string().optional(),
    position: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number()
    }).optional(),
    stateVector: z.record(z.any()).optional(),
    behavior: z.string().optional(),
    temporal: TemporalDataSchema.optional(),
    mapX: z.number().optional(),
    mapY: z.number().optional(),
}).passthrough();
export type EntityData = z.infer<typeof EntityDataSchema> & Record<string, unknown>;

export const RelationshipDataSchema = z.object({
    id: z.string().optional(),
    source: z.string().optional(),
    target: z.string().optional(),
    nodes: z.array(z.string()).optional(),
    label: z.string().optional(),
    temporal: TemporalDataSchema.optional(),
}).passthrough();
export type RelationshipData = z.infer<typeof RelationshipDataSchema> & Record<string, unknown>;

export const FieldDataSchema = z.object({
    id: z.string(),
    center: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
    strength: z.number().optional(),
    influenceRadius: z.number().optional(),
    behavior: z.string().optional(),
}).passthrough();
export type FieldData = z.infer<typeof FieldDataSchema> & Record<string, unknown>;

// Main Graph Data Structure
export const GraphDataSchema = z.object({
    system: z.string(),
    metadata: z.object({
        created: z.string().optional(),
        version: z.union([z.string(), z.number()]).optional(),
        schemaVersion: z.string().optional(),
        author: z.string().optional(),
        description: z.string().optional(),
        map: z.object({
            image: z.string(),
            referenceWidth: z.number(),
            referenceHeight: z.number()
        }).optional(),
    }).passthrough(),
    dataModel: DataModelSchema.optional(),
    fields: z.array(FieldDataSchema).optional(),
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
    nodeData: EntityData;
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
    positionX?: number | any;
    positionY?: number | any;
    positionZ?: number | any;
    size?: number | any;
    color?: THREE.Color | string | any;
    geometry?: string | any;
    glow?: number | any;
    opacity?: number | any;
    thickness?: number | any;
    curvature?: number | any;
    animation?: any;
    animation_flow?: any;
    animation_sequential?: any;
    animation_pulse?: any;
    animation_segments?: any;
    attraction?: number | any;
    repulsion?: number | any;
    inertia?: number | any;
}
