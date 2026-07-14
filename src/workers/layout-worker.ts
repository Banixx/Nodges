/**
 * Layout-Worker: Berechnet Force-Directed-Layouts im Hintergrundthread
 * Verwendet geteilte Typen aus WorkerTypes.ts
 *
 * Phase 6: Typisierte Worker-Kommunikation mit Fortschritts-Reporting
 */
import type {
    LayoutWorkerRequest,
    LayoutWorkerResponse,
    WorkerVector3,
    WorkerNode,
    WorkerNodeResult
} from './WorkerTypes';

declare const self: DedicatedWorkerGlobalScope;

console.log('Layout Worker loaded');

self.onmessage = function (event: MessageEvent<LayoutWorkerRequest>): void {
    const startTime = performance.now();
    const { requestId, nodes, edges, algorithm, fields, options } = event.data;

    try {
        if (!nodes || !Array.isArray(nodes)) {
            const errorResponse: LayoutWorkerResponse = {
                type: 'error',
                requestId,
                message: 'Nodes missing or invalid'
            };
            self.postMessage(errorResponse);
            return;
        }

        const positions: WorkerNodeResult[] = nodes.map((node: WorkerNode) => ({
            id: node.id,
            x: node.x || (Math.random() - 0.5) * 10,
            y: node.y || (Math.random() - 0.5) * 10,
            z: node.z || (Math.random() - 0.5) * 10
        }));
        console.log('[LayoutWorker] received nodes (first 2):', JSON.stringify(nodes.slice(0, 2).map(n => ({ id: n.id, x: n.x, y: n.y, z: n.z }))));
        console.log('[LayoutWorker] initialized positions (first 2):', JSON.stringify(positions.slice(0, 2).map(p => ({ id: p.id, x: p.x, y: p.y, z: p.z }))));

        const velocities: WorkerVector3[] = positions.map(() => ({ x: 0, y: 0, z: 0 }));

        let completedIterations = 0;

        if (algorithm === 'force-directed') {
            const repulsionStrength = options.repulsionStrength || 75;
            const attractionStrength = options.attractionStrength || 0.1;
            const damping = options.damping || 0.9;
            const maxIterations = options.maxIterations || 100;
            const minEnergyThreshold = options.minEnergyThreshold || 0.001;

            // Fortschritts-Intervall: alle 10% benachrichtigen
            const progressInterval = Math.max(1, Math.floor(maxIterations / 10));

            for (let iter = 0; iter < maxIterations; iter++) {
                const forces: WorkerVector3[] = positions.map(() => ({ x: 0, y: 0, z: 0 }));
                let totalEnergy = 0;

                // Coulomb-Abstossung/Anziehung zwischen allen Knotenpaaren (N-Body)
                for (let i = 0; i < positions.length; i++) {
                    const nodeI = nodes[i];
                    const repI = nodeI.repulsion !== undefined ? nodeI.repulsion : repulsionStrength;
                    const attI = nodeI.attraction || 0;
                    const massI = nodeI.inertia || 1.0;

                    for (let j = i + 1; j < positions.length; j++) {
                        const nodeJ = nodes[j];
                        const repJ = nodeJ.repulsion !== undefined ? nodeJ.repulsion : repulsionStrength;
                        const attJ = nodeJ.attraction || 0;
                        const massJ = nodeJ.inertia || 1.0;

                        let dx = positions[i].x - positions[j].x;
                        let dy = positions[i].y - positions[j].y;
                        let dz = positions[i].z - positions[j].z;
                        let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        
                        if (distance < 0.001) {
                            dx = (Math.random() - 0.5) * 0.1;
                            dy = (Math.random() - 0.5) * 0.1;
                            dz = (Math.random() - 0.5) * 0.1;
                            distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.01;
                        }

                        // Net force calculation: Repulsion pushes apart, Attraction pulls together
                        // Combine parameters (average them out for symmetrical force)
                        const effectiveRepulsion = (repI + repJ) / 2;
                        const effectiveAttraction = (attI + attJ) / 2;
                        const netForceParam = effectiveRepulsion - effectiveAttraction;

                        // F = k / (d^2 + 1.0) - Softening factor added for physical stability
                        const forceMagnitude = netForceParam / (distance * distance + 1.0);
                        const nx = dx / distance;
                        const ny = dy / distance;
                        const nz = dz / distance;

                        // Apply forces inversely proportional to mass (inertia)
                        forces[i].x += (nx * forceMagnitude) / massI;
                        forces[i].y += (ny * forceMagnitude) / massI;
                        forces[i].z += (nz * forceMagnitude) / massI;

                        forces[j].x -= (nx * forceMagnitude) / massJ;
                        forces[j].y -= (ny * forceMagnitude) / massJ;
                        forces[j].z -= (nz * forceMagnitude) / massJ;

                        totalEnergy += Math.abs(forceMagnitude);
                    }
                }

                // Hooke-Anziehung entlang der Kanten
                for (const edge of edges) {
                    const i = edge.start;
                    const j = edge.end;
                    if (i >= positions.length || j >= positions.length) continue;

                    let dx = positions[i].x - positions[j].x;
                    let dy = positions[i].y - positions[j].y;
                    let dz = positions[i].z - positions[j].z;
                    let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (distance < 0.001) {
                        dx = (Math.random() - 0.5) * 0.1;
                        dy = (Math.random() - 0.5) * 0.1;
                        dz = (Math.random() - 0.5) * 0.1;
                        distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.01;
                    }

                    const force = attractionStrength * distance;
                    const nx = dx / distance;
                    const ny = dy / distance;
                    const nz = dz / distance;

                    forces[i].x -= nx * force;
                    forces[i].y -= ny * force;
                    forces[i].z -= nz * force;

                    forces[j].x += nx * force;
                    forces[j].y += ny * force;
                    forces[j].z += nz * force;

                    totalEnergy += Math.abs(force);
                }

                // Topodynamische Felder (Build 3)
                if (fields && fields.length > 0) {
                    fields.forEach(field => {
                        if (!field.center) return;
                        const cx = field.center.x || 0;
                        const cy = field.center.y || 0;
                        const cz = field.center.z || 0;
                        const influenceR = field.influenceRadius || 100;
                        const strength = field.strength || 1;

                        for (let i = 0; i < positions.length; i++) {
                            const nodeI = nodes[i];
                            
                            // Selektive Filterung nach Typ/Verhalten
                            if (field.behavior) {
                                if (!nodeI.behavior || !field.behavior.includes(nodeI.behavior)) {
                                    continue; // skip if behavior doesn't match
                                }
                            }

                            const dx = cx - positions[i].x;
                            const dy = cy - positions[i].y;
                            const dz = cz - positions[i].z;
                            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.01;

                            if (distance <= influenceR) {
                                // Calculate force. Attractor field pulls (+). Gravitational can push/pull.
                                let force = 0;
                                if (field.type === 'attractor_field') {
                                    force = strength * (distance / influenceR); // pull towards center
                                } else if (field.type === 'gravitational_field') {
                                    force = (strength * 100) / (distance * distance); // inverse square
                                } else {
                                    force = strength;
                                }

                                const fx = (dx / distance) * force;
                                const fy = (dy / distance) * force;
                                const fz = (dz / distance) * force;

                                forces[i].x += fx;
                                forces[i].y += fy;
                                forces[i].z += fz;
                            }
                        }
                    });
                }

                // Positionen und Geschwindigkeiten aktualisieren mit Velocity-Capping gegen Koordinatenexplosion
                const MAX_VELOCITY = 10.0;
                for (let i = 0; i < positions.length; i++) {
                    const nodeI = nodes[i];
                    
                    if (!nodeI.fixedX) {
                        velocities[i].x = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, (velocities[i].x + forces[i].x) * damping));
                        positions[i].x += velocities[i].x;
                    } else {
                        velocities[i].x = 0;
                    }

                    if (!nodeI.fixedY) {
                        velocities[i].y = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, (velocities[i].y + forces[i].y) * damping));
                        positions[i].y += velocities[i].y;
                    } else {
                        velocities[i].y = 0;
                    }

                    if (!nodeI.fixedZ) {
                        velocities[i].z = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, (velocities[i].z + forces[i].z) * damping));
                        positions[i].z += velocities[i].z;
                    } else {
                        velocities[i].z = 0;
                    }
                }

                completedIterations = iter + 1;

                // Fortschrittsmeldung senden
                if (completedIterations % progressInterval === 0) {
                    const progressResponse: LayoutWorkerResponse = {
                        type: 'progress',
                        requestId,
                        progress: Math.round((completedIterations / maxIterations) * 100),
                        currentIteration: completedIterations,
                        maxIterations,
                        positions: positions.map((p, idx) => ({ id: nodes[idx].id, x: p.x, y: p.y, z: p.z }))
                    };
                    self.postMessage(progressResponse);
                }

                // Fruehes Beenden bei geringer Energie
                if (totalEnergy < minEnergyThreshold) {
                    break;
                }
            }
        }

        // Erfolgsantwort mit Metriken
        console.log('[LayoutWorker] final positions (first 2):', JSON.stringify(positions.slice(0, 2)));
        const duration = performance.now() - startTime;
        const successResponse: LayoutWorkerResponse = {
            type: 'success',
            requestId,
            positions,
            iterations: completedIterations,
            duration
        };
        self.postMessage(successResponse);

    } catch (error) {
        const errorResponse: LayoutWorkerResponse = {
            type: 'error',
            requestId,
            message: error instanceof Error ? error.message : String(error)
        };
        self.postMessage(errorResponse);
    }
};
