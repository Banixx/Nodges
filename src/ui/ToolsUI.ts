import { IStateManager } from '../core/interfaces';

export class ToolsUI {
    // private stateManager: IStateManager;
    private toolbar: HTMLElement | null;

    constructor(_stateManager: IStateManager) {
        // this.stateManager = stateManager;
        this.toolbar = document.getElementById('toolbar');
        this.initToolbar();
    }

    private initToolbar() {
        // Example: Reset Layout Button
        const resetBtn = document.getElementById('resetLayoutBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                // Dispatch event or call manager directly if available via DI
                console.log('Reset Layout clicked');
                // TODO: Trigger Layout Reset via Event or Command
            });
        }
    }

    public setVisible(visible: boolean) {
        if (this.toolbar) {
            this.toolbar.style.display = visible ? 'flex' : 'none';
        }
    }
}
