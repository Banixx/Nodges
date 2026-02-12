import { IStateManager } from '../core/interfaces';

export class StatsUI {
    private fpsElement: HTMLElement | null;
    private nodeCountElement: HTMLElement | null;
    private edgeCountElement: HTMLElement | null;
    // private stateManager: IStateManager;

    constructor(_stateManager: IStateManager) {
        // this.stateManager = stateManager;
        this.fpsElement = document.getElementById('fileFPS');
        this.nodeCountElement = document.getElementById('fileNodeCount');
        this.edgeCountElement = document.getElementById('fileEdgeCount');
    }

    public updateFps(fps: number) {
        if (this.fpsElement) {
            this.fpsElement.textContent = `FPS: ${fps}`;
        }
    }

    public updateGraphStats(nodeCount: number, edgeCount: number) {
        if (this.nodeCountElement) {
            this.nodeCountElement.textContent = `Anzahl Knoten: ${nodeCount}`;
        }
        if (this.edgeCountElement) {
            this.edgeCountElement.textContent = `Anzahl Kanten: ${edgeCount}`;
        }
    }

    public updateBounds(bounds: { x: { min: number, max: number }, y: { min: number, max: number }, z: { min: number, max: number } }) {
        const elX = document.getElementById('fileXAxis');
        if (elX) elX.textContent = `X-Achse: ${bounds.x.min.toFixed(2)} bis ${bounds.x.max.toFixed(2)}`;

        const elY = document.getElementById('fileYAxis');
        if (elY) elY.textContent = `Y-Achse: ${bounds.y.min.toFixed(2)} bis ${bounds.y.max.toFixed(2)}`;

        const elZ = document.getElementById('fileZAxis');
        if (elZ) elZ.textContent = `Z-Achse: ${bounds.z.min.toFixed(2)} bis ${bounds.z.max.toFixed(2)}`;
    }
}
