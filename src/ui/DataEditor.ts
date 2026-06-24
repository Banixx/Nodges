import { PanelUtils } from '../utils/PanelUtils';

/**
 * DataEditor - A floating editor for node and edge properties
 */
export class DataEditor {
    private modal: HTMLElement;
    private content: HTMLElement;
    private currentData: any = null;
    private flatData: Record<string, { value: any, type: string }> = {};
    private onSave: (data: any) => void = () => { };

    constructor() {
        this.modal = document.createElement('div');
        this.modal.className = 'modal-content data-editor-panel';
        this.modal.style.position = 'fixed';
        this.modal.style.top = '100px';
        this.modal.style.left = '100px';
        this.modal.style.width = '350px';
        this.modal.style.maxHeight = '600px';
        this.modal.style.display = 'none';
        this.modal.style.flexDirection = 'column';
        this.modal.style.zIndex = '10001';

        const header = document.createElement('div');
        header.className = 'modal-header';
        header.style.cursor = 'grab';
        header.innerHTML = '<h3 style="margin: 0; font-size: 14px;">Eigenschaften bearbeiten</h3>';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => this.hide();
        header.appendChild(closeBtn);

        this.content = document.createElement('div');
        this.content.className = 'modal-body';
        this.content.style.flex = '1';
        this.content.style.overflowY = 'auto';

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
        document.body.appendChild(this.modal);

        // Make draggable and resizable
        PanelUtils.makeDraggableAndResizable(this.modal, header, { minWidth: 250, minHeight: 200 });
    }

    show(data: any, onSave: (updatedData: any) => void) {
        this.currentData = JSON.parse(JSON.stringify(data)); // Deep copy
        this.flatData = this.flattenObject(this.currentData);
        this.onSave = onSave;
        this.renderFields();
        this.modal.style.display = 'flex';
        // Put in front
        this.modal.dispatchEvent(new MouseEvent('mousedown'));
    }

    hide() {
        this.modal.style.display = 'none';
        this.currentData = null;
        this.flatData = {};
    }

    private flattenObject(obj: any, prefix = ''): Record<string, { value: any, type: string }> {
        const result: Record<string, { value: any, type: string }> = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const propName = prefix ? `${prefix}.${key}` : key;
                const val = obj[key];
                if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
                    Object.assign(result, this.flattenObject(val, propName));
                } else {
                    result[propName] = {
                        value: val,
                        type: Array.isArray(val) ? 'array' : typeof val
                    };
                }
            }
        }
        return result;
    }

    private unflattenObject(flatObj: Record<string, any>): any {
        const result: any = {};
        for (const key in flatObj) {
            const parts = key.split('.');
            let current = result;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (i === parts.length - 1) {
                    current[part] = flatObj[key];
                } else {
                    if (!current[part] || typeof current[part] !== 'object') {
                        current[part] = {};
                    }
                    current = current[part];
                }
            }
        }
        return result;
    }

    private renderFields() {
        this.content.innerHTML = '';

        // Container fuer Felder
        const fieldsContainer = document.createElement('div');
        fieldsContainer.className = 'editor-fields';
        this.content.appendChild(fieldsContainer);

        const keys = Object.keys(this.flatData);

        keys.forEach(key => {
            const fieldGroup = document.createElement('div');
            fieldGroup.className = 'form-group';
            fieldGroup.style.display = 'flex';
            fieldGroup.style.flexDirection = 'column';
            fieldGroup.style.position = 'relative';
            fieldGroup.style.marginBottom = '12px';

            const labelRow = document.createElement('div');
            labelRow.style.display = 'flex';
            labelRow.style.justifyContent = 'space-between';
            labelRow.style.alignItems = 'center';

            const label = document.createElement('label');
            label.textContent = key;
            label.style.marginBottom = '4px';
            labelRow.appendChild(label);

            // Loeschen Button fuer Custom-Attribute (nicht fuer Core-Attribute)
            const isCore = ['id', 'type', 'source', 'target', 'position.x', 'position.y', 'position.z'].includes(key);
            if (!isCore) {
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '&minus;';
                deleteBtn.title = 'Eigenschaft loeschen';
                deleteBtn.style.background = 'none';
                deleteBtn.style.border = 'none';
                deleteBtn.style.color = '#e74c3c';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.style.fontSize = '16px';
                deleteBtn.style.padding = '0 5px';
                deleteBtn.onclick = () => {
                    delete this.flatData[key];
                    this.renderFields();
                };
                labelRow.appendChild(deleteBtn);
            }

            fieldGroup.appendChild(labelRow);

            let input: HTMLInputElement | HTMLSelectElement;

            if (this.flatData[key].type === 'boolean') {
                const select = document.createElement('select');
                select.style.marginBottom = '0';
                
                const optTrue = document.createElement('option');
                optTrue.value = 'true';
                optTrue.textContent = 'true';
                if (this.flatData[key].value === true) optTrue.selected = true;

                const optFalse = document.createElement('option');
                optFalse.value = 'false';
                optFalse.textContent = 'false';
                if (this.flatData[key].value === false) optFalse.selected = true;

                select.appendChild(optTrue);
                select.appendChild(optFalse);
                select.dataset.key = key;
                select.dataset.type = 'boolean';
                input = select;
            } else {
                const textInput = document.createElement('input');
                textInput.style.marginBottom = '0';
                textInput.type = this.flatData[key].type === 'number' ? 'number' : 'text';
                textInput.value = this.flatData[key].value !== undefined ? this.flatData[key].value : '';
                textInput.dataset.key = key;
                textInput.dataset.type = this.flatData[key].type;
                if (key === 'id') {
                    textInput.readOnly = true;
                    textInput.style.opacity = '0.6';
                    textInput.style.cursor = 'not-allowed';
                }
                input = textInput;
            }

            fieldGroup.appendChild(input);
            fieldsContainer.appendChild(fieldGroup);
        });

        // Trennlinie
        const divider = document.createElement('hr');
        divider.style.border = 'none';
        divider.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
        divider.style.margin = '15px 0';
        this.content.appendChild(divider);

        // Bereich zum Hinzufuegen einer neuen Eigenschaft
        const addContainer = document.createElement('div');
        addContainer.style.display = 'flex';
        addContainer.style.gap = '8px';
        addContainer.style.alignItems = 'center';

        const newKeyInput = document.createElement('input');
        newKeyInput.type = 'text';
        newKeyInput.placeholder = 'Neue Eigenschaft...';
        newKeyInput.style.margin = '0';
        newKeyInput.style.flex = '2';

        const newTypeSelect = document.createElement('select');
        newTypeSelect.style.margin = '0';
        newTypeSelect.style.flex = '1';
        
        const optionString = document.createElement('option');
        optionString.value = 'string';
        optionString.textContent = 'Text';
        newTypeSelect.appendChild(optionString);

        const optionNumber = document.createElement('option');
        optionNumber.value = 'number';
        optionNumber.textContent = 'Zahl';
        newTypeSelect.appendChild(optionNumber);

        const optionBoolean = document.createElement('option');
        optionBoolean.value = 'boolean';
        optionBoolean.textContent = 'Boolean';
        newTypeSelect.appendChild(optionBoolean);

        const addBtn = document.createElement('button');
        addBtn.className = 'action-button';
        addBtn.style.margin = '0';
        addBtn.style.flex = '0 0 auto';
        addBtn.style.width = 'auto';
        addBtn.style.padding = '6px 12px';
        addBtn.textContent = 'Hinzufuegen';
        addBtn.onclick = () => {
            const key = newKeyInput.value.trim();
            if (!key) return;
            if (this.flatData[key]) {
                alert('Eigenschaft existiert bereits.');
                return;
            }
            if (key.startsWith('.') || key.endsWith('.') || key.includes('..')) {
                alert('Ungueltiger Name fuer Eigenschaft.');
                return;
            }

            const type = newTypeSelect.value;
            let defaultValue: any = '';
            if (type === 'number') defaultValue = 0;
            if (type === 'boolean') defaultValue = false;

            this.flatData[key] = { value: defaultValue, type };
            this.renderFields();
        };

        addContainer.appendChild(newKeyInput);
        addContainer.appendChild(newTypeSelect);
        addContainer.appendChild(addBtn);
        this.content.appendChild(addContainer);

        if (keys.length === 0) {
            const noFieldsMsg = document.createElement('p');
            noFieldsMsg.style.textAlign = 'center';
            noFieldsMsg.style.color = 'var(--text-muted)';
            noFieldsMsg.textContent = 'Keine Eigenschaften vorhanden.';
            fieldsContainer.appendChild(noFieldsMsg);
        }
    }

    private collectData() {
        const inputs = this.content.querySelectorAll('input, select');
        const flatResult: Record<string, any> = {};

        inputs.forEach(input => {
            const key = (input as HTMLElement).dataset.key;
            if (!key) return;

            const type = (input as HTMLElement).dataset.type;
            const val = (input as HTMLInputElement | HTMLSelectElement).value;

            if (type === 'number') {
                flatResult[key] = parseFloat(val);
            } else if (type === 'boolean') {
                flatResult[key] = val === 'true';
            } else {
                flatResult[key] = val;
            }
        });

        return this.unflattenObject(flatResult);
    }
}
