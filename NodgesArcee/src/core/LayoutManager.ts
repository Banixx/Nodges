import { EntityData, RelationshipData } from '../types';
import * as THREE from 'three';
import { IStateManager } from './interfaces';

export class LayoutManager {
    private stateManager: IStateManager;
    private animationFrame: number | null = null;
    private layoutWorker: Worker | null = null;

    constructor(stateManager: IStateManager) {
        this.stateManager = stateManager;
    }

    async applyLayout(layoutType: string, entities: EntityData[], relationships: RelationshipData[]): Promise<void> {
        return new Promise((resolve) => {
            // Simple force-directed layout for now
            this.forceDirectedLayout(entities, relationships, resolve);
        });
    }

    private forceDirectedLayout(entities: EntityData[], relationships: RelationshipData[], callback: () => void): void {
        // Simple force-directed algorithm
        const maxIterations = 100;
        const damping = 0.1;
        const minEnergy = 0.01;

        let iteration = 0;
        let energy = Infinity;

        const positions = entities.map(entity => ({
            id: entity.id,
            position: entity.position || { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 }
        }));

        const updatePositions = () => {
            // Calculate forces
            positions.forEach(pos => {
                pos.velocity.x *= 0.9;
                pos.velocity.y *= 0.9;
                pos.velocity.z *= 0.9;

                // Repulsion between all nodes
                positions.forEach(other => {
                    if (pos.id !== other.id) {
                        const dx = other.position.x - pos.position.x;
                        const dy = other.position.y - pos.position.y;
                        const dz = other.position.z - pos.position.z;
                        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1;
                        const force = 100 / (distance * distance);
                        pos.velocity.x -= force * dx / distance;
                        pos.velocity.y -= force * dy / distance;
                        pos.velocity.z -= force * dz / distance;
                    }
                });

                // Attraction between connected nodes
                relationships.forEach(rel => {
                    if (rel.source === pos.id) {
                        const target = positions.find(p => p.id === rel.target);
                        if (target) {
                            const dx = target.position.x - pos.position.x;
                            const dy = target.position.y - pos.position.y;
                            const dz = target.position.z - pos.position.z;
                            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                            const force = -distance * 0.1;
                            pos.velocity.x += force * dx / distance;
                            pos.velocity.y += force * dy / distance;
                            pos.velocity.z += force * dz / distance;
                        }
                    } else if (rel.target === pos.id) {
                        const target = positions.find(p => p.id === rel.source);
                        if (target) {
                            const dx = target.position.x - pos.position.x;
                            const dy = target.position.y - pos.position.y;
                            const dz = target.position.z - pos.position.z;
                            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                            const force = -distance * 0.1;
                            pos.velocity.x += force * dx / distance;
                            pos.velocity.y += force * dy / distance;
                            pos.velocity.z += force * dz / distance;
                        }
                    }
                });
            });

            // Update positions
            energy = 0;
            positions.forEach(pos => {
                pos.position.x += pos.velocity.x * damping;
                pos.position.y += pos.velocity.y * damping;
                pos.position.z += pos.velocity.z * damping;
                energy += Math.sqrt(pos.velocity.x ** 2 + pos.velocity.y ** 2 + pos.velocity.z ** 2);
            });

            // Update entities with new positions
            entities.forEach((entity, index) => {
                entity.position = positions[index].position;
            });

            iteration++;
            if (iteration < maxIterations && energy > minEnergy) {
                this.animationFrame = requestAnimationFrame(updatePositions);
            } else {
                cancelAnimationFrame(this.animationFrame!);
                this.animationFrame = null;
                callback();
            }
        };

        updatePositions();
    }

    stopAnimation(): void {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
}