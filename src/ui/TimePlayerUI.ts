import { IStateManager } from '../core/interfaces';
import type { App } from '../App';

export class TimePlayerUI {
    private stateManager: IStateManager;
    private container: HTMLElement;
    private slider: HTMLInputElement;
    private playBtn: HTMLButtonElement;
    private timeDisplay: HTMLElement;
    private minTime: number = 0;
    private maxTime: number = 100;

    constructor(stateManager: IStateManager, _app: App) {
        this.stateManager = stateManager;

        this.container = document.createElement('div');
        this.container.id = 'timePlayerContainer';
        this.container.className = 'time-player-panel';
        
        // Setup UI HTML
        this.container.innerHTML = `
            <div class="time-player-controls">
                <button id="tp-play-btn" class="tp-btn">▶</button>
                <input type="range" id="tp-slider" min="0" max="100" value="0" step="1">
                <span id="tp-time-display">0</span>
            </div>
        `;
        
        // Basic styles
        Object.assign(this.container.style, {
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--panel-bg, rgba(20, 20, 20, 0.85))',
            padding: '10px 20px',
            borderRadius: '8px',
            display: 'none',
            alignItems: 'center',
            gap: '15px',
            zIndex: '1000',
            border: '1px solid var(--border-color, #444)',
            color: 'var(--text-primary, #fff)',
            fontFamily: 'sans-serif',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        });

        document.body.appendChild(this.container);

        this.playBtn = this.container.querySelector('#tp-play-btn') as HTMLButtonElement;
        this.slider = this.container.querySelector('#tp-slider') as HTMLInputElement;
        this.timeDisplay = this.container.querySelector('#tp-time-display') as HTMLElement;

        // Styling inner elements
        Object.assign(this.playBtn.style, {
            background: 'var(--primary-color, #3498db)',
            border: 'none',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            outline: 'none'
        });
        
        this.slider.style.width = '300px';

        this.bindEvents();

        // Subscribe to state changes
        this.stateManager.subscribe(state => this.handleStateChange(state), 'system');
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
    }

    private handleStateChange(state: any) {
        if (state.currentTimestamp !== null) {
            this.container.style.display = 'flex';
            this.slider.value = state.currentTimestamp.toString();
            this.timeDisplay.textContent = Math.round(state.currentTimestamp).toString();

            // Auto-stop at end
            if (state.isPlaying && state.currentTimestamp >= this.maxTime) {
                this.stateManager.setPlaying(false);
                this.stateManager.setCurrentTimestamp(this.maxTime);
            }
        }

        this.playBtn.textContent = state.isPlaying ? '⏸' : '▶';
    }

    private handleDataChange(state: any) {
        const entities = state.graphData.entities;
        let hasTemporal = false;
        let minT = Infinity;
        let maxT = -Infinity;

        entities.forEach((e: any) => {
            if (e.temporal) {
                hasTemporal = true;
                if (e.temporal.validFrom !== undefined && e.temporal.validFrom !== null) minT = Math.min(minT, e.temporal.validFrom);
                if (e.temporal.validTo !== undefined && e.temporal.validTo !== null) maxT = Math.max(maxT, e.temporal.validTo);
                if (e.temporal.history) {
                    e.temporal.history.forEach((h: any) => {
                        minT = Math.min(minT, h.timestamp);
                        maxT = Math.max(maxT, h.timestamp);
                    });
                }
            }
        });

        if (hasTemporal && minT !== Infinity && maxT !== -Infinity) {
            this.minTime = minT;
            this.maxTime = maxT;
            this.slider.min = minT.toString();
            this.slider.max = maxT.toString();
            
            // Set init time if not set
            if (this.stateManager.state.currentTimestamp === null) {
                this.stateManager.setCurrentTimestamp(minT);
            }
            this.container.style.display = 'flex';
        } else {
            // No temporal data in graph
            this.stateManager.setCurrentTimestamp(null);
            this.stateManager.setPlaying(false);
            this.container.style.display = 'none';
        }
    }
}
