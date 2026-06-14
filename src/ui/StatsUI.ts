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
            this.fpsElement.textContent = String(fps);
        }
    }

    public updateGraphStats(nodeCount: number, edgeCount: number) {
        if (this.nodeCountElement) {
            this.nodeCountElement.textContent = String(nodeCount);
        }
        if (this.edgeCountElement) {
            this.edgeCountElement.textContent = String(edgeCount);
        }
    }

    public updateBounds(bounds: { x: { min: number, max: number }, y: { min: number, max: number }, z: { min: number, max: number } }) {
        const elX = document.getElementById('fileXAxis');
        if (elX) elX.textContent = `${bounds.x.min.toFixed(2)} bis ${bounds.x.max.toFixed(2)}`;

        const elY = document.getElementById('fileYAxis');
        if (elY) elY.textContent = `${bounds.y.min.toFixed(2)} bis ${bounds.y.max.toFixed(2)}`;

        const elZ = document.getElementById('fileZAxis');
        if (elZ) elZ.textContent = `${bounds.z.min.toFixed(2)} bis ${bounds.z.max.toFixed(2)}`;
    }
}
