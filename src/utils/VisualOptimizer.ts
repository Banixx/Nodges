import { EntityData, RelationshipData } from '../types';
import { State } from '../core/StateManager';
import { VisualMappingEngine } from '../core/VisualMappingEngine';
import * as THREE from 'three';

export interface OptimizationResult {
    visualScaleMultiplier: number;
    visualScaleExponent: number;
    edgeThickness: number;
    coordinateScaleFactor: number;
}

/**
 * VisualOptimizer - Utility to calculate optimal scaling parameters for network visualization.
 * It ensures that nodes and edges are balanced relative to the spatial distribution of the data.
 */
export class VisualOptimizer {
    /**
     * Calculates optimal balance parameters for the given dataset.
     */
    public static calculateOptimalBalance(
        entities: EntityData[],
        relationships: RelationshipData[],
        currentState: State,
        mappingEngine?: VisualMappingEngine
    ): OptimizationResult {
        if (entities.length === 0) {
            return {
                visualScaleMultiplier: currentState.visualScaleMultiplier,
                visualScaleExponent: currentState.visualScaleExponent,
                edgeThickness: currentState.edgeThickness,
                coordinateScaleFactor: 1.0
            };
        }

        // 1. Calculate Spatial Extent (Bounding Box)
        const bounds = this.calculateBounds(entities);
        const sizeX = bounds.max.x - bounds.min.x;
        const sizeY = bounds.max.y - bounds.min.y;
        const sizeZ = bounds.max.z - bounds.min.z;
        const maxExtent = Math.max(sizeX, sizeY, sizeZ, 1.0);

        // 2. Calculate Average Edge Length and Average Node Size
        const avgEdgeLength = this.calculateAverageEdgeLength(entities, relationships);
        const avgNodeSize = this.calculateAverageNodeSize(entities, mappingEngine);
        
        // 3. Determine Density (not strictly used but logged if needed)
        console.log(`[VisualOptimizer] Extent: ${maxExtent.toFixed(2)}, AvgEdge: ${avgEdgeLength.toFixed(2)}, AvgSize: ${avgNodeSize.toFixed(2)}`);

        // 4. Coordinate Normalization (Optional / Suggested)
        let coordinateScaleFactor = 1.0;
        const TARGET_MAX_EXTENT = 500.0; // Standard scene size
        if (maxExtent > TARGET_MAX_EXTENT) {
            coordinateScaleFactor = TARGET_MAX_EXTENT / maxExtent;
        }

        // 5. Calculate Optimal Multiplier
        // Goal: Node diameter (size * multiplier) should be ~10% of average edge length.
        const scaledAvgEdgeLength = avgEdgeLength * coordinateScaleFactor;
        const baseSize = avgNodeSize > 0 ? avgNodeSize : 1.0;

        let optimalMultiplier = 1.0;
        
        if (scaledAvgEdgeLength > 0) {
            // formula: multiplier = (scaledAvgEdgeLength * 0.1) / baseSize
            optimalMultiplier = (scaledAvgEdgeLength * 0.1) / baseSize; 
        } else {
            const scaledMaxExtent = maxExtent * coordinateScaleFactor;
            optimalMultiplier = (scaledMaxExtent / Math.sqrt(entities.length)) * 0.1 / baseSize;
        }

        optimalMultiplier = THREE.MathUtils.clamp(optimalMultiplier, 0.1, 5.0);

        // 6. Calculate Optimal Exponent (Damping)
        let optimalExponent = 1.0;
        const variances = this.calculateValueVariances(entities, relationships);
        if (variances > 100) {
            optimalExponent = 0.5;
        } else if (variances > 10) {
            optimalExponent = 0.7;
        }

        // 7. Optimal Edge Thickness
        const numNodes = entities.length;
        let optimalEdgeThickness = 2.0;
        if (numNodes > 100) {
            optimalEdgeThickness = 1.0;
        } else if (numNodes < 20) {
            optimalEdgeThickness = 3.0;
        }

        return {
            visualScaleMultiplier: parseFloat(optimalMultiplier.toFixed(2)),
            visualScaleExponent: optimalExponent,
            edgeThickness: optimalEdgeThickness,
            coordinateScaleFactor: coordinateScaleFactor
        };
    }

    /**
     * Normalizes entity positions to fit within a target extent.
     */
    public static normalizeCoordinates(entities: EntityData[], factor: number): void {
        if (factor === 1.0) return;

        console.log(`[VisualOptimizer] Normalizing coordinates by factor ${factor.toFixed(4)}`);
        entities.forEach(e => {
            if (e.position) {
                e.position.x *= factor;
                e.position.y *= factor;
                e.position.z *= factor;
            }
        });
    }

    private static calculateAverageNodeSize(entities: EntityData[], mappingEngine?: VisualMappingEngine): number {
        if (entities.length === 0) return 1.0;

        let totalSize = 0;
        let count = 0;

        entities.forEach(e => {
            let size = 1.0;
            if (mappingEngine) {
                const visual = mappingEngine.applyToEntity(e);
                size = visual.size !== undefined ? visual.size : 1.0;
            } else {
                // Fallback to raw data guess
                const sizeValue = e.size ?? e.value ?? e.weight ?? e.amount ?? e.waehleranteil ?? 1.0;
                size = typeof sizeValue === 'number' ? sizeValue : 1.0;
            }
            totalSize += size;
            count++;
        });

        return count > 0 ? totalSize / count : 1.0;
    }

    private static calculateBounds(entities: EntityData[]) {
        const min = new THREE.Vector3(Infinity, Infinity, Infinity);
        const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

        entities.forEach(e => {
            const x = e.position?.x ?? 0;
            const y = e.position?.y ?? 0;
            const z = e.position?.z ?? 0;
            min.x = Math.min(min.x, x);
            min.y = Math.min(min.y, y);
            min.z = Math.min(min.z, z);
            max.x = Math.max(max.x, x);
            max.y = Math.max(max.y, y);
            max.z = Math.max(max.z, z);
        });

        return { min, max };
    }

    private static calculateAverageEdgeLength(entities: EntityData[], relationships: RelationshipData[]): number {
        if (relationships.length === 0) return 0;

        const entityMap = new Map<string | number, EntityData>();
        entities.forEach(e => entityMap.set(e.id, e));

        let totalLength = 0;
        let count = 0;

        relationships.forEach(r => {
            if (!r.source || !r.target) return;
            const s = entityMap.get(r.source);
            const t = entityMap.get(r.target);
            if (s && t) {
                const dx = (s.position?.x ?? 0) - (t.position?.x ?? 0);
                const dy = (s.position?.y ?? 0) - (t.position?.y ?? 0);
                const dz = (s.position?.z ?? 0) - (t.position?.z ?? 0);
                totalLength += Math.sqrt(dx * dx + dy * dy + dz * dz);
                count++;
            }
        });

        return count > 0 ? totalLength / count : 0;
    }

    private static calculateValueVariances(entities: EntityData[], relationships: RelationshipData[]): number {
        // Very simple variance check on numeric properties
        const values: number[] = [];
        entities.forEach(e => {
            for (const key in e) {
                if (typeof e[key] === 'number') values.push(e[key]);
            }
        });
        relationships.forEach(r => {
            for (const key in r) {
                if (typeof r[key] === 'number') values.push(r[key]);
            }
        });

        if (values.length < 2) return 0;

        // Ratio of max to min might be more useful for "damping" decision
        const min = Math.min(...values.filter(v => v > 0));
        const max = Math.max(...values);
        const ratio = min > 0 ? max / min : 0;

        return ratio;
    }
}
