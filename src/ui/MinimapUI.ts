export class MinimapUI {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;

    constructor(containerId: string) {
        const el = document.getElementById(containerId);
        if (!el) {
            throw new Error(`Minimap container ${containerId} not found.`);
        }
        this.container = el;

        // Ensure styling matches the glassmorphism theme
        this.container.innerHTML = `
            <div class="minimap-header">Overview</div>
            <div class="minimap-canvas-wrapper" id="minimapCanvasWrapper"></div>
        `;

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'minimapCanvas';
        this.container.querySelector('#minimapCanvasWrapper')!.appendChild(this.canvas);
    }

    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    // Resize based on container dimensions
    updateSize() {
        const wrapper = this.container.querySelector('#minimapCanvasWrapper') as HTMLElement;
        if (!wrapper) return;
        const rect = wrapper.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
}
