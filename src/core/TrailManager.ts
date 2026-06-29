import * as THREE from 'three';
import { EntityData } from '../types';
import { VisualMappingEngine } from './VisualMappingEngine';
import { IStateManager } from './interfaces';
import { ServiceContainer } from './di/ServiceContainer';

export class TrailManager {
    private scene: THREE.Scene;
    private stateManager: IStateManager;
    private visualMappingEngine: VisualMappingEngine;

    // Entity ID -> Array of positions
    private trailHistory: Map<string, THREE.Vector3[]> = new Map();
    // Entity ID -> Line Object
    private trailLines: Map<string, THREE.Line> = new Map();

    private materialCache: Map<string, THREE.LineBasicMaterial> = new Map();

    constructor(container: ServiceContainer) {
        [this.scene, this.stateManager, this.visualMappingEngine] = container.resolve<THREE.Scene, IStateManager, VisualMappingEngine>('Scene', 'IStateManager', 'VisualMappingEngine');

        this.stateManager.subscribe(() => {
            this.updateTrails();
        }, 'data_changed');
    }

    public updateTrails() {
        const entities = this.stateManager.getEntities();
        
        entities.forEach(entity => {
            const visual = this.visualMappingEngine.applyToEntity(entity);
            
            // Check if trail should be rendered
            const isVectorSpline = visual.geometry === 'vector_spline';
            const trailLength = (visual as any).trailLength || (isVectorSpline ? 48 : 0);

            if (trailLength > 0 && entity.position) {
                this.updateEntityTrail(entity, visual, trailLength);
            } else if (this.trailLines.has(entity.id)) {
                this.removeEntityTrail(entity.id);
            }
        });

        // Clean up orphaned trails
        const currentEntityIds = new Set(entities.map(e => e.id));
        for (const id of this.trailLines.keys()) {
            if (!currentEntityIds.has(id)) {
                this.removeEntityTrail(id);
            }
        }
    }

    private updateEntityTrail(entity: EntityData, visual: any, maxLength: number) {
        const id = entity.id;
        const currentPos = new THREE.Vector3(entity.position!.x, entity.position!.y, entity.position!.z);

        if (!this.trailHistory.has(id)) {
            this.trailHistory.set(id, []);
        }

        const history = this.trailHistory.get(id)!;
        
        // Only add if position changed significantly
        if (history.length === 0 || history[history.length - 1].distanceToSquared(currentPos) > 0.01) {
            history.push(currentPos.clone());
        } else if (history.length > 0) {
            // Update last position smoothly
            history[history.length - 1].copy(currentPos);
        }

        // Trim history
        if (history.length > maxLength) {
            history.shift();
        }

        // Need at least 2 points for a line
        if (history.length < 2) return;

        // Create or update line
        let line = this.trailLines.get(id);
        
        if (!line) {
            const geometry = new THREE.BufferGeometry().setFromPoints(history);
            
            // Determine color
            let colorHex = 0xffffff;
            if (visual.color) {
                if (visual.color instanceof THREE.Color) {
                    colorHex = visual.color.getHex();
                } else {
                    colorHex = new THREE.Color(visual.color).getHex();
                }
            }

            // Material
            let material = this.materialCache.get(String(colorHex));
            if (!material) {
                material = new THREE.LineBasicMaterial({ 
                    color: colorHex, 
                    transparent: true, 
                    opacity: 0.6 
                });
                this.materialCache.set(String(colorHex), material);
            }

            line = new THREE.Line(geometry, material);
            this.scene.add(line);
            this.trailLines.set(id, line);
        } else {
            // Update geometry
            line.geometry.dispose();
            line.geometry = new THREE.BufferGeometry().setFromPoints(history);
            
            // Update color if needed
            let colorHex = 0xffffff;
            if (visual.color) {
                if (visual.color instanceof THREE.Color) {
                    colorHex = visual.color.getHex();
                } else {
                    colorHex = new THREE.Color(visual.color).getHex();
                }
            }
            if ((line.material as THREE.LineBasicMaterial).color.getHex() !== colorHex) {
                let material = this.materialCache.get(String(colorHex));
                if (!material) {
                    material = new THREE.LineBasicMaterial({ 
                        color: colorHex, 
                        transparent: true, 
                        opacity: 0.6 
                    });
                    this.materialCache.set(String(colorHex), material);
                }
                line.material = material;
            }
        }
    }

    private removeEntityTrail(id: string) {
        const line = this.trailLines.get(id);
        if (line) {
            this.scene.remove(line);
            line.geometry.dispose();
            this.trailLines.delete(id);
        }
        this.trailHistory.delete(id);
    }

    public clear() {
        for (const line of this.trailLines.values()) {
            this.scene.remove(line);
            line.geometry.dispose();
        }
        this.trailLines.clear();
        this.trailHistory.clear();
    }

    public dispose() {
        this.clear();
        for (const material of this.materialCache.values()) {
            material.dispose();
        }
        this.materialCache.clear();
    }
}
