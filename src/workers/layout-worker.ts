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
    const { requestId, nodes, edges, algorithm, options } = event.data;

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

                // Coulomb-Abstossung zwischen allen Knotenpaaren
                for (let i = 0; i < positions.length; i++) {
                    for (let j = i + 1; j < positions.length; j++) {
                        const dx = positions[i].x - positions[j].x;
                        const dy = positions[i].y - positions[j].y;
                        const dz = positions[i].z - positions[j].z;
                        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.01;

                        const force = repulsionStrength / (distance * distance);
                        const nx = dx / distance;
                        const ny = dy / distance;
                        const nz = dz / distance;

                        forces[i].x += nx * force;
                        forces[i].y += ny * force;
                        forces[i].z += nz * force;

                        forces[j].x -= nx * force;
                        forces[j].y -= ny * force;
                        forces[j].z -= nz * force;

                        totalEnergy += Math.abs(force);
                    }
                }

                // Hooke-Anziehung entlang der Kanten
                for (const edge of edges) {
                    const i = edge.start;
                    const j = edge.end;
                    if (i >= positions.length || j >= positions.length) continue;

                    const dx = positions[i].x - positions[j].x;
                    const dy = positions[i].y - positions[j].y;
                    const dz = positions[i].z - positions[j].z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.01;

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

                // Positionen und Geschwindigkeiten aktualisieren
                for (let i = 0; i < positions.length; i++) {
                    velocities[i].x = (velocities[i].x + forces[i].x) * damping;
                    velocities[i].y = (velocities[i].y + forces[i].y) * damping;
                    velocities[i].z = (velocities[i].z + forces[i].z) * damping;

                    positions[i].x += velocities[i].x;
                    positions[i].y += velocities[i].y;
                    positions[i].z += velocities[i].z;
                }

                completedIterations = iter + 1;

                // Fortschrittsmeldung senden
                if (completedIterations % progressInterval === 0) {
                    const progressResponse: LayoutWorkerResponse = {
                        type: 'progress',
                        requestId,
                        progress: Math.round((completedIterations / maxIterations) * 100),
                        currentIteration: completedIterations,
                        maxIterations
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
