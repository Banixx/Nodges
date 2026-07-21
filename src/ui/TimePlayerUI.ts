import { IStateManager } from '../core/interfaces';
import type { App } from '../App';

export class TimePlayerUI {
    private stateManager: IStateManager;
    private container: HTMLElement;
    private slider: HTMLInputElement;
    private playBtn: HTMLButtonElement;
    private timeDisplay: HTMLElement;
    private ticksContainer: HTMLElement;
    private speedSelect: HTMLSelectElement;
    private settingsBtn: HTMLButtonElement;
    private settingsPanel: HTMLElement;
    private fadeToggle: HTMLInputElement;
    private fadeDurationSlider: HTMLInputElement;
    private fadeDurationDisplay: HTMLElement;
    private minTime: number = 0;
    private maxTime: number = 100;

    constructor(stateManager: IStateManager, _app: App) {
        this.stateManager = stateManager;

        // Remove any existing instance to prevent duplicates (e.g., from HMR)
        const existing = document.getElementById('timePlayerContainer');
        if (existing) {
            existing.remove();
        }

        this.container = document.createElement('div');
        this.container.id = 'timePlayerContainer';
        this.container.className = 'time-player-panel';
        
        // Setup UI HTML
        this.container.innerHTML = `
            <div id="tp-settings-panel" class="tp-settings-panel collapsed">
                <div class="mapping-header" id="tp-settings-header" style="cursor: pointer; border-radius: 12px 12px 0 0;">
                    <span style="display: flex; align-items: center; gap: 8px;">Zeiteinstellungen</span>
                    <div class="mapping-toggle" id="tp-settings-toggle">▲</div>
                </div>
                <div class="tp-settings-body">
                    <div class="tp-setting-row">
                        <label class="tp-setting-label">Fade (Nodes/Edges):</label>
                        <input type="checkbox" id="tp-fade-toggle" class="nodges-toggle" checked>
                    </div>
                    <div class="tp-setting-row">
                        <label class="tp-setting-label">Fade Dauer:</label>
                        <input type="range" id="tp-fade-duration" class="tp-slider" min="0" max="50" value="5" step="0.5" style="width: 100px;">
                        <span id="tp-fade-duration-display" class="tp-setting-val">5.0</span>
                    </div>
                </div>
            </div>
            <div class="time-player-controls">
                <button id="tp-play-btn" class="tp-btn" title="Abspielen / Pause">▶</button>
                <div class="tp-slider-wrapper">
                    <input type="range" id="tp-slider" class="tp-slider" min="0" max="100" value="0" step="1">
                    <div id="tp-ticks" class="tp-ticks-container"></div>
                </div>
                <span id="tp-time-display" class="tp-time-display">0</span>
                <select id="tp-speed" class="tp-speed-select" title="Abspielgeschwindigkeit">
                    <option value="0.1">0.1x</option>
                    <option value="0.25">0.25x</option>
                    <option value="0.5">0.5x</option>
                    <option value="1" selected>1.0x</option>
                    <option value="2">2.0x</option>
                    <option value="5">5.0x</option>
                    <option value="10">10.0x</option>
                </select>
            </div>
        `;
        
        document.body.appendChild(this.container);

        this.playBtn = this.container.querySelector('#tp-play-btn') as HTMLButtonElement;
        this.slider = this.container.querySelector('#tp-slider') as HTMLInputElement;
        this.timeDisplay = this.container.querySelector('#tp-time-display') as HTMLElement;
        this.ticksContainer = this.container.querySelector('#tp-ticks') as HTMLElement;
        this.speedSelect = this.container.querySelector('#tp-speed') as HTMLSelectElement;
        this.settingsBtn = this.container.querySelector('#tp-settings-header') as HTMLButtonElement;
        this.settingsPanel = this.container.querySelector('#tp-settings-panel') as HTMLElement;
        this.fadeToggle = this.container.querySelector('#tp-fade-toggle') as HTMLInputElement;
        this.fadeDurationSlider = this.container.querySelector('#tp-fade-duration') as HTMLInputElement;
        this.fadeDurationDisplay = this.container.querySelector('#tp-fade-duration-display') as HTMLElement;

        this.bindEvents();

        // Subscribe to state changes
        this.stateManager.subscribe(state => this.handleStateChange(state), 'system');
        
        // Force initial DOM sync in case state is already populated (e.g. HMR)
        this.handleStateChange(this.stateManager.state);
        this.stateManager.subscribe(state => this.handleDataChange(state), 'data_changed');
    }

    private bindEvents() {
        this.playBtn.addEventListener('click', () => {
            const isPlaying = this.stateManager.state.isPlaying;
            if (!isPlaying && this.stateManager.state.currentTimestamp !== null && this.stateManager.state.currentTimestamp >= this.maxTime) {
                // Restart if at end
                this.stateManager.setCurrentTimestamp(this.minTime);
            }
            this.stateManager.setPlaying(!isPlaying);
        });

        this.slider.addEventListener('input', (e) => {
            const val = parseFloat((e.target as HTMLInputElement).value);
            this.stateManager.setCurrentTimestamp(val);
        });

        this.speedSelect.addEventListener('change', (e) => {
            const val = parseFloat((e.target as HTMLSelectElement).value);
            this.stateManager.update({ playbackSpeed: val });
        });

        this.settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.settingsPanel.classList.toggle('collapsed');
            const toggle = this.settingsPanel.querySelector('#tp-settings-toggle');
            if (toggle) {
                toggle.textContent = this.settingsPanel.classList.contains('collapsed') ? '▲' : '▼';
            }
        });

        this.fadeToggle.addEventListener('change', (e) => {
            const isChecked = (e.target as HTMLInputElement).checked;
            this.stateManager.update({ temporalFadeEnabled: isChecked });
        });

        this.fadeDurationSlider.addEventListener('input', (e) => {
            const val = parseFloat((e.target as HTMLInputElement).value);
            this.fadeDurationDisplay.textContent = val.toFixed(1);
            this.stateManager.update({ temporalFadeDuration: val });
        });
    }

    private handleStateChange(state: any) {
        if (state.currentTimestamp !== null && state.currentTimestamp !== undefined && !isNaN(state.currentTimestamp)) {
            this.container.style.display = 'flex';
            this.slider.value = state.currentTimestamp.toString();
            this.timeDisplay.textContent = this.formatTimestamp(state.currentTimestamp);

            // Auto-stop at end (defer to avoid isUpdating-Guard)
            if (state.isPlaying && state.currentTimestamp >= this.maxTime) {
                const maxTime = this.maxTime;
                setTimeout(() => {
                    this.stateManager.setPlaying(false);
                    this.stateManager.setCurrentTimestamp(maxTime);
                }, 0);
            }
        }

        this.playBtn.textContent = state.isPlaying ? '⏸' : '▶';

        if (state.playbackSpeed !== undefined) {
            this.speedSelect.value = state.playbackSpeed.toString();
        }
        
        if (state.temporalFadeEnabled !== undefined) {
            this.fadeToggle.checked = state.temporalFadeEnabled;
        }
        
        if (state.temporalFadeDuration !== undefined) {
            this.fadeDurationSlider.value = state.temporalFadeDuration.toString();
            this.fadeDurationDisplay.textContent = state.temporalFadeDuration.toFixed(1);
        }
    }

    private formatTimestamp(val: number): string {
        // 1. Sehr grosse geologische/astronomische Skalen (> 1 Mio. Jahre)
        if (val >= 1000000000 || val <= -1000000000) {
            return (val / 1000000000).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' Mrd. J.';
        }
        if (val >= 1000000 || val <= -1000000) {
            return (val / 1000000).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' Mio. J.';
        }

        // 2. Unix Timestamps
        // Millisekunden (z.B. >= 1000000000000)
        if (Math.abs(val) >= 1000000000000) {
            return new Date(val).toLocaleDateString('de-DE');
        }
        // Sekunden (z.B. typischerweise ab 1970 bis 2038)
        if (val >= 500000000 && val <= 2500000000) {
            return new Date(val * 1000).toLocaleDateString('de-DE');
        }

        // 3. Historische Jahreszahlen
        if (val < 0) {
            return Math.abs(Math.round(val)) + ' v. Chr.';
        }
        if (val > 1000 && val < 2100) {
            return Math.round(val).toString();
        }

        // 4. Fallback Standardzahl
        return val.toLocaleString('de-DE', { maximumFractionDigits: 2 });
    }

    private handleDataChange(state: any) {
        const entities = state.graphData.entities;
        const relationships = state.graphData.relationships || [];
        
        let hasTemporal = false;
        let minT = Infinity;
        let maxT = -Infinity;
        const timestamps = new Set<number>();

        const processTemporal = (temp: any) => {
            if (!temp) return;
            hasTemporal = true;
            if (temp.validFrom !== undefined && temp.validFrom !== null) {
                minT = Math.min(minT, temp.validFrom);
                maxT = Math.max(maxT, temp.validTo !== undefined && temp.validTo !== null ? temp.validTo : maxT);
                timestamps.add(temp.validFrom);
            }
            if (temp.validTo !== undefined && temp.validTo !== null) {
                maxT = Math.max(maxT, temp.validTo);
                timestamps.add(temp.validTo);
            }
            if (temp.history) {
                temp.history.forEach((h: any) => {
                    minT = Math.min(minT, h.timestamp);
                    maxT = Math.max(maxT, h.timestamp);
                    timestamps.add(h.timestamp);
                });
            }
        };

        // Knoten verarbeiten
        entities.forEach((e: any) => processTemporal(e.temporal));
        
        // Kanten verarbeiten
        relationships.forEach((r: any) => processTemporal(r.temporal));

        if (hasTemporal && minT !== Infinity && maxT !== -Infinity) {
            this.minTime = minT;
            this.maxTime = maxT;
            
            // Verhindere Division durch 0 bei identischem Start- und Endzeitpunkt
            if (this.minTime === this.maxTime) {
                this.maxTime = this.minTime + 1;
            }

            this.slider.min = this.minTime.toString();
            this.slider.max = this.maxTime.toString();
            
            // Set init time if not set or out of bounds.
            // WICHTIG: Muss per setTimeout(0) ausserhalb des isUpdating-Guards des StateManager aufgerufen werden,
            // da handleDataChange als Subscriber-Callback innerhalb von update() laeuft.
            const capturedMinTime = this.minTime;
            const capturedMaxTime = this.maxTime;
            setTimeout(() => {
                const current = this.stateManager.state.currentTimestamp;
                if (current === null || current < capturedMinTime || current > capturedMaxTime) {
                    this.stateManager.setCurrentTimestamp(capturedMinTime);
                }
                this.stateManager.update({
                    minTimestamp: capturedMinTime,
                    maxTimestamp: capturedMaxTime
                });
            }, 0);
            this.container.style.display = 'flex';

            // Ticks rendern
            this.updateTicks(timestamps);
        } else {
            // No temporal data in graph
            // Auch hier: verzögern wegen isUpdating-Guard
            setTimeout(() => {
                this.stateManager.setCurrentTimestamp(null);
                this.stateManager.update({
                    minTimestamp: null,
                    maxTimestamp: null
                });
                this.stateManager.setPlaying(false);
            }, 0);
            this.container.style.display = 'none';
            this.ticksContainer.innerHTML = '';
        }
    }

    private updateTicks(timestamps: Set<number>) {
        this.ticksContainer.innerHTML = '';
        
        // Berechne eindeutige Zeitpunkte im gueltigen Bereich
        const sortedTicks = Array.from(timestamps)
            .filter(t => t >= this.minTime && t <= this.maxTime)
            .sort((a, b) => a - b);

        // Um visuelles Rauschen zu vermeiden, begrenzen wir die maximale Anzahl an Ticks
        const maxVisibleTicks = 50;
        const skipStep = Math.ceil(sortedTicks.length / maxVisibleTicks);

        sortedTicks.forEach((t, i) => {
            if (i % skipStep !== 0) return;

            const pct = ((t - this.minTime) / (this.maxTime - this.minTime)) * 100;
            const tickElement = document.createElement('span');
            tickElement.className = 'tp-tick';
            tickElement.style.left = `${pct}%`;
            tickElement.setAttribute('data-tooltip', this.formatTimestamp(t));
            
            // Interaktiver Sprung zu diesem Tick bei Klick
            tickElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.stateManager.setCurrentTimestamp(t);
            });

            this.ticksContainer.appendChild(tickElement);
        });
    }
}
