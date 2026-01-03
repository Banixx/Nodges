/**
 * DataEditor - A modal editor for node and edge properties
 */
export class DataEditor {
    private overlay: HTMLElement;
    private modal: HTMLElement;
    private content: HTMLElement;
    private currentData: any = null;
    private onSave: (data: any) => void = () => { };

    constructor() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.style.display = 'none';

        this.modal = document.createElement('div');
        this.modal.className = 'modal-content';

        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = '<h3>Eigenschaften bearbeiten</h3>';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => this.hide();
        header.appendChild(closeBtn);

        this.content = document.createElement('div');
        this.content.className = 'modal-body';

        const footer = document.createElement('div');
        footer.className = 'modal-footer';

        const saveBtn = document.createElement('button');
        saveBtn.className = 'action-button';
        saveBtn.textContent = 'Speichern';
        saveBtn.onclick = () => {
            const updatedData = this.collectData();
            this.onSave(updatedData);
            this.hide();
        };

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'action-button secondary';
        cancelBtn.textContent = 'Abbrechen';
        cancelBtn.onclick = () => this.hide();

        footer.appendChild(saveBtn);
        footer.appendChild(cancelBtn);

        this.modal.appendChild(header);
        this.modal.appendChild(this.content);
        this.modal.appendChild(footer);
        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        // Close on overlay click
        this.overlay.onclick = (e) => {
            if (e.target === this.overlay) this.hide();
        };
    }

    show(data: any, onSave: (updatedData: any) => void) {
        this.currentData = JSON.parse(JSON.stringify(data)); // Deep copy
        this.onSave = onSave;
        this.renderFields();
        this.overlay.style.display = 'flex';
    }

    hide() {
        this.overlay.style.display = 'none';
        this.currentData = null;
    }

    private renderFields() {
        this.content.innerHTML = '';

        // Filter out internal properties (starting with underscore or three.js specific)
        const keys = Object.keys(this.currentData).filter(key =>
            !key.startsWith('_') &&
            key !== 'id' &&
            key !== 'type' &&
            typeof this.currentData[key] !== 'object'
        );

        keys.forEach(key => {
            const fieldGroup = document.createElement('div');
            fieldGroup.className = 'form-group';

            const label = document.createElement('label');
            label.textContent = key;

            const input = document.createElement('input');
            input.type = typeof this.currentData[key] === 'number' ? 'number' : 'text';
            input.value = this.currentData[key];
            input.dataset.key = key;
            input.dataset.type = typeof this.currentData[key];

            fieldGroup.appendChild(label);
            fieldGroup.appendChild(input);
            this.content.appendChild(fieldGroup);
        });

        if (keys.length === 0) {
            this.content.innerHTML = '<p style="text-align:center; color: var(--text-muted);">Keine bearbeitbaren Eigenschaften gefunden.</p>';
        }
    }

    private collectData() {
        const inputs = this.content.querySelectorAll('input');
        const data = { ...this.currentData };

        inputs.forEach(input => {
            const key = input.dataset.key!;
            const type = input.dataset.type;

            if (type === 'number') {
                data[key] = parseFloat(input.value);
            } else {
                data[key] = input.value;
            }
        });

        return data;
    }
}
