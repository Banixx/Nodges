/**
 * ContextMenu - A simple, stylish, and context-aware context menu for Nodges
 */
export interface ContextMenuOption {
    label: string;
    action?: () => void;
    icon?: string;
    disabled?: boolean;
    separator?: boolean;
    danger?: boolean;
    badge?: string;
    isToggle?: boolean;
    isActive?: boolean;
}

export interface ContextMenuHeader {
    title: string;
    modeBadge?: string;
    modeBadgeType?: 'simple' | 'expert' | 'dev';
    subtitle?: string;
}

export class ContextMenu {
    private container: HTMLElement;
    private isOpen: boolean = false;

    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'context-menu';
        this.container.style.display = 'none';
        this.container.style.position = 'fixed';
        this.container.style.zIndex = '10000';
        document.body.appendChild(this.container);

        // Close on click elsewhere
        window.addEventListener('click', () => this.hide());
        window.addEventListener('contextmenu', (e) => {
            if (this.isOpen && !this.container.contains(e.target as Node)) {
                this.hide();
            }
        });
    }

    show(x: number, y: number, options: ContextMenuOption[], header?: ContextMenuHeader) {
        this.container.innerHTML = '';

        if (header) {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'context-menu-header';

            const titleRow = document.createElement('div');
            titleRow.className = 'context-menu-title-row';

            const titleSpan = document.createElement('span');
            titleSpan.className = 'context-menu-title';
            titleSpan.textContent = header.title;
            titleSpan.title = header.title;
            titleRow.appendChild(titleSpan);

            if (header.modeBadge) {
                const badgeSpan = document.createElement('span');
                badgeSpan.className = `context-menu-mode-badge mode-${header.modeBadgeType || 'simple'}`;
                badgeSpan.textContent = header.modeBadge;
                titleRow.appendChild(badgeSpan);
            }

            headerDiv.appendChild(titleRow);

            if (header.subtitle) {
                const subSpan = document.createElement('div');
                subSpan.className = 'context-menu-subtitle';
                subSpan.textContent = header.subtitle;
                subSpan.title = header.subtitle;
                headerDiv.appendChild(subSpan);
            }

            this.container.appendChild(headerDiv);
        }

        options.forEach(option => {
            if (option.separator) {
                const sep = document.createElement('div');
                sep.className = 'context-menu-separator';
                this.container.appendChild(sep);
                return;
            }

            const item = document.createElement('div');
            item.className = 'context-menu-item';
            if (option.disabled) {
                item.classList.add('disabled');
            }
            if (option.danger) {
                item.classList.add('danger');
            }
            if (option.isToggle && option.isActive) {
                item.classList.add('toggle-active');
            }

            const labelSpan = document.createElement('span');
            let labelText = option.label;
            if (option.isToggle) {
                labelText = `${option.isActive ? '✓ ' : '○ '}${labelText}`;
            }
            labelSpan.textContent = labelText;
            item.appendChild(labelSpan);

            if (option.badge) {
                const badge = document.createElement('span');
                badge.className = 'context-menu-item-badge';
                badge.textContent = option.badge;
                item.appendChild(badge);
            }

            if (!option.disabled && option.action) {
                item.onclick = (e) => {
                    e.stopPropagation();
                    option.action!();
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

        // Delay setting isOpen via setTimeout to prevent current event from immediate closing
        setTimeout(() => {
            this.isOpen = true;
        }, 0);
    }

    hide() {
        this.container.style.display = 'none';
        this.isOpen = false;
    }
}
