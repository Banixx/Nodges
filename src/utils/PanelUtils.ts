export class PanelUtils {
    private static zIndexCounter = 10000;

    public static makeDraggableAndResizable(
        panel: HTMLElement,
        header: HTMLElement,
        options: { minWidth?: number, minHeight?: number, keepSquare?: boolean } = {}
    ) {
        // Z-Index Management
        panel.addEventListener('mousedown', () => {
            panel.style.zIndex = (++this.zIndexCounter).toString();
        });

        // 1. Draggable implementation
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let panelStartX = 0;
        let panelStartY = 0;

        header.style.cursor = 'grab';

        const onDragStart = (e: MouseEvent | PointerEvent) => {
            // Ignore if clicking on buttons, inputs or toggles in the header
            const target = e.target as HTMLElement;
            if (target.closest && target.closest('button, select, input, .mapping-toggle, .panel-toggle, .close-btn, [data-nodrag]')) {
                return;
            }
            
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            
            const rect = panel.getBoundingClientRect();
            panelStartX = rect.left;
            panelStartY = rect.top;

            header.style.cursor = 'grabbing';
            panel.style.zIndex = (++this.zIndexCounter).toString();
            
            // Disable transitions during drag for immediate follow
            panel.style.transition = 'none';

            e.preventDefault();
        };

        const onDragMove = (e: MouseEvent | PointerEvent) => {
            if (!isDragging) return;

            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;

            // Apply absolute position instead of transform for consistent resizing and dragging
            panel.style.setProperty('bottom', 'auto', 'important');
            panel.style.setProperty('right', 'auto', 'important');
            panel.style.setProperty('left', `${panelStartX + dx}px`, 'important');
            panel.style.setProperty('top', `${panelStartY + dy}px`, 'important');
            panel.style.setProperty('transform', 'none', 'important');
        };

        const onDragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            header.style.cursor = 'grab';
        };

        header.addEventListener('pointerdown', onDragStart as any);
        window.addEventListener('pointermove', onDragMove as any);
        window.addEventListener('pointerup', onDragEnd);

        // 2. Resizable implementation (adding a resize handle at bottom-right)
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'panel-resize-handle';
        resizeHandle.style.position = 'absolute';
        resizeHandle.style.bottom = '0';
        resizeHandle.style.right = '0';
        resizeHandle.style.width = '15px';
        resizeHandle.style.height = '15px';
        resizeHandle.style.cursor = 'se-resize';
        resizeHandle.style.zIndex = '10';
        
        // Add visual indicator for resize handle
        resizeHandle.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10" style="position: absolute; bottom: 2px; right: 2px; fill: rgba(255,255,255,0.4);"><polygon points="10,0 10,10 0,10"/></svg>';
        
        panel.appendChild(resizeHandle);

        let isResizing = false;
        let resizeStartX = 0;
        let resizeStartY = 0;
        let panelStartWidth = 0;
        let panelStartHeight = 0;

        const minWidth = options.minWidth || 200;
        const minHeight = options.minHeight || 150;

        const onResizeStart = (e: MouseEvent | PointerEvent) => {
            isResizing = true;
            resizeStartX = e.clientX;
            resizeStartY = e.clientY;
            
            const rect = panel.getBoundingClientRect();
            panelStartWidth = rect.width;
            panelStartHeight = rect.height;

            // Make sure the panel uses left/top positioning, not bottom/right
            panel.style.setProperty('bottom', 'auto', 'important');
            panel.style.setProperty('right', 'auto', 'important');
            panel.style.setProperty('left', `${rect.left}px`, 'important');
            panel.style.setProperty('top', `${rect.top}px`, 'important');
            panel.style.setProperty('transform', 'none', 'important');
            panel.style.transition = 'none';

            e.preventDefault();
            e.stopPropagation(); // Don't trigger panel click
        };

        const onResizeMove = (e: MouseEvent | PointerEvent) => {
            if (!isResizing) return;

            const dx = e.clientX - resizeStartX;
            const dy = e.clientY - resizeStartY;

            let newWidth = Math.max(minWidth, panelStartWidth + dx);
            let newHeight = Math.max(minHeight, panelStartHeight + dy);

            if (options.keepSquare) {
                const size = Math.max(newWidth, newHeight);
                newWidth = size;
                newHeight = size;
            }

            panel.style.setProperty('width', `${newWidth}px`, 'important');
            panel.style.setProperty('height', `${newHeight}px`, 'important');
        };

        const onResizeEnd = () => {
            if (!isResizing) return;
            isResizing = false;
        };

        resizeHandle.addEventListener('pointerdown', onResizeStart as any);
        window.addEventListener('pointermove', onResizeMove as any);
        window.addEventListener('pointerup', onResizeEnd);
    }
}
