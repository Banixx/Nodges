import { IStateManager } from '../core/interfaces';

export class LayersPanel {
    private stateManager: IStateManager;

    constructor(_elementId: string, stateManager: IStateManager) {
        this.stateManager = stateManager;
        this.init();
    }

    private init() {
        for (let i = 1; i <= 4; i++) {
            const toggle = document.getElementById(`layer${i}Toggle`) as HTMLInputElement;
            const opacitySlider = document.getElementById(`layer${i}Opacity`) as HTMLInputElement;

            if (toggle) {
                // Initialize toggle state from StateManager
                toggle.checked = this.stateManager.state[`layer${i}Visible`] !== false;
                
                // Add event listener
                toggle.addEventListener('change', (e) => {
                    const isVisible = (e.target as HTMLInputElement).checked;
                    this.stateManager.update({ [`layer${i}Visible`]: isVisible });
                });
            }

            if (opacitySlider) {
                // Initialize opacity value from StateManager
                opacitySlider.value = String(this.stateManager.state[`layer${i}Opacity`] !== undefined 
                    ? this.stateManager.state[`layer${i}Opacity`] 
                    : 1.0);

                // Add event listener
                opacitySlider.addEventListener('input', (e) => {
                    const val = parseFloat((e.target as HTMLInputElement).value);
                    this.stateManager.update({ [`layer${i}Opacity`]: val });
                });
            }

            // Layer value selects event listeners
            const valSelect = document.getElementById(`layer${i}ValueSelect`) as HTMLSelectElement;
            if (valSelect) {
                valSelect.addEventListener('change', (e) => {
                    const val = (e.target as HTMLSelectElement).value;
                    this.stateManager.update({ [`layer${i}Value`]: val });
                });
            }
        }

        // Layering attribute select event listener
        const attributeSelect = document.getElementById('layeringAttributeSelect') as HTMLSelectElement;
        if (attributeSelect) {
            attributeSelect.addEventListener('change', (e) => {
                const attr = (e.target as HTMLSelectElement).value;
                
                // When layering attribute changes, reset layer values to first 4 unique values
                const entities = this.stateManager.getEntities();
                const uniqueValues = new Set<string>();
                entities.forEach(entity => {
                    const val = entity[attr];
                    if (val !== undefined && val !== null) {
                        uniqueValues.add(String(val));
                    }
                });
                const sortedValues = Array.from(uniqueValues).sort();

                this.stateManager.batchUpdate({
                    layeringAttribute: attr,
                    layer1Value: sortedValues[0] || '',
                    layer2Value: sortedValues[1] || '',
                    layer3Value: sortedValues[2] || '',
                    layer4Value: sortedValues[3] || '',
                });
            });
        }

        // Subscribe to category DATA updates to keep selects updated
        this.stateManager.subscribe(() => {
            this.updateDropdowns();
        }, 'DATA');

        // Initial population
        this.updateDropdowns();
    }

    private updateDropdowns() {
        const attributeSelect = document.getElementById('layeringAttributeSelect') as HTMLSelectElement;
        if (!attributeSelect) return;

        const entities = this.stateManager.getEntities();
        
        // 1. Gather all possible attributes from the loaded entities
        const keys = new Set<string>();
        keys.add('layer');
        keys.add('type');
        entities.forEach(entity => {
            Object.keys(entity).forEach(key => {
                if (key !== 'id' && key !== 'label' && key !== 'position') {
                    keys.add(key);
                }
            });
        });

        // Determine current attribute selection
        const currentAttr = this.stateManager.state.layeringAttribute || 'layer';
        
        // Populate layering attribute dropdown if it's different/empty
        const currentOptions = Array.from(attributeSelect.options).map(o => o.value);
        const newOptions = Array.from(keys).sort();
        const needsAttributeRepopulate = currentOptions.length !== newOptions.length || 
            !newOptions.every((val, index) => val === currentOptions[index]);

        if (needsAttributeRepopulate) {
            attributeSelect.innerHTML = '';
            newOptions.forEach(key => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = key;
                if (key === currentAttr) {
                    option.selected = true;
                }
                attributeSelect.appendChild(option);
            });
        } else {
            attributeSelect.value = currentAttr;
        }

        // 2. Gather unique values for the selected attribute
        const uniqueValues = new Set<string>();
        entities.forEach(entity => {
            const val = entity[currentAttr];
            if (val !== undefined && val !== null) {
                uniqueValues.add(String(val));
            }
        });

        const sortedValues = Array.from(uniqueValues).sort();

        // 3. Populate each layer value select dropdown
        for (let i = 1; i <= 4; i++) {
            const valSelect = document.getElementById(`layer${i}ValueSelect`) as HTMLSelectElement;
            if (!valSelect) continue;

            const currentVal = this.stateManager.state[`layer${i}Value`] || '';

            // Check if current options match sortedValues + noneOption
            const existingOptions = Array.from(valSelect.options).map(o => o.value);
            const targetOptions = ['', ...sortedValues];
            const needsValueRepopulate = existingOptions.length !== targetOptions.length ||
                !targetOptions.every((val, index) => val === existingOptions[index]);

            if (needsValueRepopulate) {
                valSelect.innerHTML = '';
                
                // Add none/empty option
                const noneOption = document.createElement('option');
                noneOption.value = '';
                noneOption.textContent = '-- Keine --';
                valSelect.appendChild(noneOption);

                sortedValues.forEach(val => {
                    const option = document.createElement('option');
                    option.value = val;
                    option.textContent = val;
                    if (val === currentVal) {
                        option.selected = true;
                    }
                    valSelect.appendChild(option);
                });
            } else {
                valSelect.value = currentVal;
            }
        }
    }
}
