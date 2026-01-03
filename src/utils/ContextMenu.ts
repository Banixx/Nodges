/**
 * ContextMenu - A simple, stylish context menu for Nodges
 */
export interface ContextMenuOption {
    label: string;
    action: () => void;
    icon?: string;
    disabled?: boolean;
}

export class ContextMenu {
    private container: HTMLElement;
    private isOpen: boolean = false;

    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'context-menu';
        this.container.style.display = 'none';
        this.container.style.position = 'fixed';
        this.container.style.zIndex = '1000';
        document.body.appendChild(this.container);

        // Close on click elsewhere
        window.addEventListener('click', () => this.hide());
        window.addEventListener('contextmenu', (e) => {
            if (this.isOpen && !this.container.contains(e.target as Node)) {
                this.hide();
            }
        });
    }

    show(x: number, y: number, options: ContextMenuOption[]) {
        this.container.innerHTML = '';

        options.forEach(option => {
            const item = document.createElement('div');
            item.className = 'context-menu-item';
            if (option.disabled) {
                item.classList.add('disabled');
            }
            item.textContent = option.label;
            if (!option.disabled) {
                item.onclick = (e) => {
                    e.stopPropagation();
                    option.action();
                    this.hide();
                };
            }
            this.container.appendChild(item);
        });

        // Ensure menu stays within window bounds
        this.container.style.display = 'block';
        const rect = this.container.getBoundingClientRect();

        let posX = x;
        let posY = y;

        if (x + rect.width > window.innerWidth) posX = window.innerWidth - rect.width - 5;
        if (y + rect.height > window.innerHeight) posY = window.innerHeight - rect.height - 5;

        this.container.style.left = `${posX}px`;
        this.container.style.top = `${posY}px`;
        this.isOpen = true;
    }

    hide() {
        this.container.style.display = 'none';
        this.isOpen = false;
    }
}
