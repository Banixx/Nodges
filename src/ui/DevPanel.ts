import { IStateManager } from '../core/interfaces';

export class DevPanel {
    private container: HTMLElement;
    private stateManager: IStateManager;

    constructor(containerId: string, stateManager: IStateManager) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`[DevPanel] Container '${containerId}' not found.`);
            // Create a stub to prevent crashes
            this.container = document.createElement('div');
            this.stateManager = stateManager;
            return;
        }

        this.container = container;
        this.stateManager = stateManager;

        this.render();
        this.bindEvents();
    }

    private render() {
        const state = this.stateManager.state;

        // Ensure properties exist on state (fallback if StateManager update hasn't propagated yet)
        const powerPref = state.devPowerPreference || 'high-performance';
        const pixelRatio = state.devPixelRatio || 1.0;
        const fpsLimit = state.devFpsLimit !== undefined ? state.devFpsLimit : 0;

        let hardwareInfo = 'Checking...';
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (gl) {
            const ext = gl.getExtension('WEBGL_debug_renderer_info');
            if (ext) {
                hardwareInfo = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
            }
        } else {
            hardwareInfo = 'WebGL not supported';
        }

        const renderMode = state.renderMode || 'auto';

        this.container.innerHTML = `
            <section class="panel-section">
                <h4 class="section-header">Performance & Testing</h4>
                
                <div class="info-row" style="margin-bottom: 10px;">
                    <span class="info-label">Active GPU:</span>
                    <span class="info-value" style="font-size: 0.8em;" id="devGpuInfo" title="${hardwareInfo}">
                        ${hardwareInfo.length > 25 ? hardwareInfo.substring(0, 25) + '...' : hardwareInfo}
                    </span>
                </div>

                <div class="control-group">
                    <label title="high-performance prefers dedicated GPUs, low-power prefers internal GPUs.">
                        Power Preference (Restart required)
                    </label>
                    <div class="power-state-toggle" style="display: flex; background: #2a2a2a; border-radius: 20px; position: relative; overflow: hidden; margin-top: 5px; height: 30px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);">
                        <input type="radio" name="devPowerMode" id="pm_high" value="high-performance" ${powerPref === 'high-performance' ? 'checked' : ''} style="display: none;">
                        <input type="radio" name="devPowerMode" id="pm_low" value="low-power" ${powerPref === 'low-power' ? 'checked' : ''} style="display: none;">
                        <input type="radio" name="devPowerMode" id="pm_default" value="default" ${powerPref === 'default' ? 'checked' : ''} style="display: none;">
                        
                        <label for="pm_high" style="flex: 1; text-align: center; line-height: 30px; cursor: pointer; z-index: 2; color: #fff; font-size: 11px; font-weight: bold; margin:0; padding:0; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">High (dGPU)</label>
                        <label for="pm_low" style="flex: 1; text-align: center; line-height: 30px; cursor: pointer; z-index: 2; color: #fff; font-size: 11px; font-weight: bold; margin:0; padding:0; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">Low (iGPU)</label>
                        <label for="pm_default" style="flex: 1; text-align: center; line-height: 30px; cursor: pointer; z-index: 2; color: #fff; font-size: 11px; font-weight: bold; margin:0; padding:0; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">Default</label>
                        
                        <div class="thumb" style="position: absolute; top: 2px; left: 2px; width: calc(33.33% - 4px); height: calc(100% - 4px); background: linear-gradient(180deg, #e6a822, #b8860b); border-radius: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.4); z-index: 1; transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);"></div>
                    </div>
                </div>

                <div class="control-group">
                    <label title="Render Mode. Auto switches from Mesh to Instance on low FPS.">
                        Render Mode
                    </label>
                    <div class="tri-state-toggle" style="display: flex; background: #2a2a2a; border-radius: 20px; position: relative; overflow: hidden; margin-top: 5px; height: 30px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);">
                        <input type="radio" name="devRenderMode" id="rm_mesh" value="mesh" ${renderMode === 'mesh' ? 'checked' : ''} style="display: none;">
                        <input type="radio" name="devRenderMode" id="rm_auto" value="auto" ${renderMode === 'auto' ? 'checked' : ''} style="display: none;">
                        <input type="radio" name="devRenderMode" id="rm_instance" value="instance" ${renderMode === 'instance' ? 'checked' : ''} style="display: none;">
                        
                        <label for="rm_mesh" style="flex: 1; text-align: center; line-height: 30px; cursor: pointer; z-index: 2; color: #fff; font-size: 11px; font-weight: bold; margin:0; padding:0; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">Mesh</label>
                        <label for="rm_auto" style="flex: 1; text-align: center; line-height: 30px; cursor: pointer; z-index: 2; color: #fff; font-size: 11px; font-weight: bold; margin:0; padding:0; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">Auto</label>
                        <label for="rm_instance" style="flex: 1; text-align: center; line-height: 30px; cursor: pointer; z-index: 2; color: #fff; font-size: 11px; font-weight: bold; margin:0; padding:0; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">Instance</label>
                        
                        <div class="thumb" style="position: absolute; top: 2px; left: 2px; width: calc(33.33% - 4px); height: calc(100% - 4px); background: linear-gradient(180deg, #e6a822, #b8860b); border-radius: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.4); z-index: 1; transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);">
                        </div>
                    </div>
                </div>

                <div class="control-group">
                    <div class="label-row">
                        <label title="Scales down resolution without shrinking the canvas visual size.">
                            Pixel Ratio Multiplier
                        </label>
                        <span id="devPixelRatioValue" class="value-display">${pixelRatio.toFixed(2)}x</span>
                    </div>
                    <input type="range" id="devPixelRatioSlider" min="0.1" max="2.0" step="0.1" value="${pixelRatio}">
                </div>

                <div class="control-group">
                    <div class="label-row">
                        <label title="Limits Render Loop. 0 = Uncapped/Vsync.">
                            FPS Limit
                        </label>
                        <span id="devFpsLimitValue" class="value-display">${fpsLimit === 0 ? 'Max' : fpsLimit}</span>
                    </div>
                    <input type="range" id="devFpsLimitSlider" min="0" max="144" step="1" value="${fpsLimit}">
                    <div style="display: flex; justify-content: space-between; font-size: 0.7em; color: #888; padding: 0 4px;">
                        <span>Uncapped</span><span>30</span><span>60</span><span>144</span>
                    </div>
                </div>

                <button id="devApplyRestartBtn" class="action-button primary" style="margin-top: 10px;">
                    Apply & Recreate Canvas
                </button>
            </section>
        `;
    }

    private bindEvents() {
        const powerRadios = this.container.querySelectorAll('input[name="devPowerMode"]');
        const powerThumb = this.container.querySelector('.power-state-toggle .thumb') as HTMLElement;
        const powerLabels = this.container.querySelectorAll('.power-state-toggle label');
        const pixelSlider = this.container.querySelector('#devPixelRatioSlider') as HTMLInputElement;
        const pixelValue = this.container.querySelector('#devPixelRatioValue') as HTMLSpanElement;
        const fpsSlider = this.container.querySelector('#devFpsLimitSlider') as HTMLInputElement;
        const fpsValue = this.container.querySelector('#devFpsLimitValue') as HTMLSpanElement;
        const applyBtn = this.container.querySelector('#devApplyRestartBtn') as HTMLButtonElement;

        pixelSlider?.addEventListener('input', (e) => {
            const val = parseFloat((e.target as HTMLInputElement).value);
            if (pixelValue) pixelValue.textContent = val.toFixed(2) + 'x';
            this.stateManager.update({ devPixelRatio: val });
        });

        fpsSlider?.addEventListener('input', (e) => {
            const val = parseInt((e.target as HTMLInputElement).value, 10);
            if (fpsValue) fpsValue.textContent = val === 0 ? 'Max' : val.toString();
            this.stateManager.update({ devFpsLimit: val });
        });

        const updatePowerThumb = (val: string) => {
            if (!powerThumb) return;
            if (val === 'high-performance') powerThumb.style.transform = 'translateX(0%)';
            else if (val === 'low-power') powerThumb.style.transform = 'translateX(100%)';
            else if (val === 'default') powerThumb.style.transform = 'translateX(200%)';
            
            powerLabels.forEach((label) => {
                const inputId = label.getAttribute('for');
                const input = this.container.querySelector('#' + inputId) as HTMLInputElement;
                if (input && input.value === val) {
                    (label as HTMLElement).style.color = '#fff';
                } else {
                    (label as HTMLElement).style.color = '#aaa';
                }
            });
        };

        const currentPower = this.stateManager.state.devPowerPreference || 'high-performance';
        updatePowerThumb(currentPower);

        powerRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const val = (e.target as HTMLInputElement).value as 'high-performance' | 'low-power' | 'default';
                updatePowerThumb(val);
                this.stateManager.update({ devPowerPreference: val });
            });
        });

        applyBtn?.addEventListener('click', () => {
            // Re-render the UI hardware info slightly after app restart
            setTimeout(() => this.render(), 100);
            // Reattach events
            setTimeout(() => this.bindEvents(), 150);

            // The App.ts subscriber will pick up the 'recreate_renderer' trigger
            this.stateManager.update({ _triggerRendererRebuild: Date.now() });
        });

        // Render Mode Toggle Logic
        const radios = this.container.querySelectorAll('input[name="devRenderMode"]');
        const thumb = this.container.querySelector('.tri-state-toggle .thumb') as HTMLElement;
        const labels = this.container.querySelectorAll('.tri-state-toggle label');

        const updateThumbPosition = (val: string) => {
            if (!thumb) return;
            if (val === 'mesh') thumb.style.transform = 'translateX(0%)';
            else if (val === 'auto') thumb.style.transform = 'translateX(100%)';
            else if (val === 'instance') thumb.style.transform = 'translateX(200%)';
            
            // Highlight active text slightly
            labels.forEach((label) => {
                const inputId = label.getAttribute('for');
                const input = this.container.querySelector('#' + inputId) as HTMLInputElement;
                if (input && input.value === val) {
                    (label as HTMLElement).style.color = '#fff';
                } else {
                    (label as HTMLElement).style.color = '#aaa';
                }
            });
        };

        const currentState = this.stateManager.state.renderMode || 'auto';
        updateThumbPosition(currentState);

        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const val = (e.target as HTMLInputElement).value as 'auto' | 'mesh' | 'instance';
                updateThumbPosition(val);
                const activeRenderMode = val === 'auto' ? 'mesh' : val;
                this.stateManager.update({ renderMode: val, activeRenderMode });
            });
        });
    }
}
