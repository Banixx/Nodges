import { PanelUtils } from '../utils/PanelUtils';

export class MinimapUI {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;

    public onZoom?: (delta: number) => void;
    public onPan?: (deltaX: number, deltaY: number) => void;

    private isDragging: boolean = false;
    private lastPointerPos: { x: number, y: number } = { x: 0, y: 0 };

    constructor(containerId: string) {
        const el = document.getElementById(containerId);
        if (!el) {
            throw new Error(`Minimap container ${containerId} not found.`);
        }
        this.container = el;

        // Move to body to ensure it's a global overlay and not nested in other panels
        document.body.appendChild(this.container);

        // FORCED STYLES via JS to bypass any CSS caching or overrides
        this.container.style.setProperty('position', 'fixed', 'important');
        this.container.style.setProperty('bottom', '20px', 'important');
        this.container.style.setProperty('left', '10px', 'important');
        this.container.style.setProperty('right', 'auto', 'important');
        this.container.style.setProperty('z-index', '99999', 'important');
        this.container.style.setProperty('display', 'flex', 'important');
        this.container.style.setProperty('width', '250px');
        this.container.style.setProperty('height', '250px');
        this.container.style.setProperty('touch-action', 'none', 'important');
        
        // Disable ANY blur filters hart via JS
        this.container.style.setProperty('backdrop-filter', 'none', 'important');
        this.container.style.setProperty('filter', 'none', 'important');
        this.container.style.setProperty('-webkit-backdrop-filter', 'none', 'important');

        // Ensure styling matches the glassmorphism theme
        this.container.innerHTML = `
            <div class="minimap-header">
                <span>Minimap</span>
                <div class="minimap-toggle" id="minimapToggle">▼</div>
            </div>
            <div class="minimap-canvas-wrapper" id="minimapCanvasWrapper"></div>
        `;

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'minimapCanvas';
        const wrapper = this.container.querySelector('#minimapCanvasWrapper') as HTMLElement;
        wrapper.appendChild(this.canvas);

        // Toggle logic
        const toggle = this.container.querySelector('#minimapToggle') as HTMLElement;
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.container.classList.toggle('collapsed');
            toggle.textContent = this.container.classList.contains('collapsed') ? '▲' : '▼';

            // Trigger resize after transition
            setTimeout(() => this.updateSize(), 350);
        });

        // Make minimap draggable and resizable
        const header = this.container.querySelector('.minimap-header') as HTMLElement;
        if (header) {
            header.style.cursor = 'grab';
            PanelUtils.makeDraggableAndResizable(this.container, header, { minWidth: 100, minHeight: 100, keepSquare: true });
            
            // Allow clicking header to bring to front
            header.addEventListener('mousedown', () => {
                this.container.dispatchEvent(new MouseEvent('mousedown'));
            });
        }

        // Zoom logic (Mouse wheel)
        wrapper.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (this.onZoom) {
                this.onZoom(e.deltaY);
            }
        }, { passive: false });

        // Pan logic (Pointer drag)
        wrapper.addEventListener('pointerdown', (e) => {
            this.isDragging = true;
            this.lastPointerPos = { x: e.clientX, y: e.clientY };
            wrapper.setPointerCapture(e.pointerId);
        });

        wrapper.addEventListener('pointermove', (e) => {
            if (!this.isDragging) return;
            const deltaX = e.clientX - this.lastPointerPos.x;
            const deltaY = e.clientY - this.lastPointerPos.y;
            this.lastPointerPos = { x: e.clientX, y: e.clientY };
            if (this.onPan) {
                this.onPan(deltaX, deltaY);
            }
        });

        wrapper.addEventListener('pointerup', (e) => {
            this.isDragging = false;
            wrapper.releasePointerCapture(e.pointerId);
        });

        // Initialize size and listen for window changes to maintain sharpness
        window.addEventListener('resize', () => this.updateSize());
        
        // Observe panel resize to update canvas when resized via drag handle
        const resizeObserver = new ResizeObserver(() => {
            if (!this.container.classList.contains('collapsed')) {
                this.updateSize();
            }
        });
        resizeObserver.observe(this.container);

        setTimeout(() => this.updateSize(), 150); // Slight delay to ensure DOM is settled
    }

    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    // Resize based on container dimensions
    updateSize() {
        const wrapper = this.container.querySelector('#minimapCanvasWrapper') as HTMLElement;
        if (!wrapper) return;
        const rect = wrapper.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // CSS size stays the same
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        this.canvas.style.imageRendering = 'auto'; // Let the renderer handle it since it's DPR aware now
    }
}
