import { IStateManager } from './interfaces';

/**
 * Quality levels used to describe how much visual fidelity to sacrifice
 * to keep the target FPS. Higher level = better quality.
 */
export type QualityLevel = 'ultra' | 'high' | 'medium' | 'low';

interface PerformanceMonitorConfig {
    targetFps: number;      // e.g. 55 – we try to stay above this
    sampleWindow: number;   // ms to average FPS over (default 2000ms)
    hysteresis: number;     // FPS margin before changing quality (prevents flicker)
}

const DEFAULT_CONFIG: PerformanceMonitorConfig = {
    targetFps: 50,
    sampleWindow: 2000,
    hysteresis: 5,
};

/**
 * PerformanceMonitor
 *
 * Tracks the rolling FPS and computes a QualityLevel.
 * Third-party code (App, EdgeObjectsManager, etc.) can call
 * `getQualityLevel()` each frame to decide how detailed to render.
 *
 * Quality levels:
 *  ultra  = > targetFps + hysteresis  → all effects enabled
 *  high   = > targetFps               → standard quality
 *  medium = > targetFps - 15          → reduce tube segments, softer glow
 *  low    = <= targetFps - 15         → minimal geometry, no animation
 */
export class PerformanceMonitor {
    private config: PerformanceMonitorConfig;
    private frameTimes: number[] = [];
    private lastFrameTime: number = 0;
    private currentQuality: QualityLevel = 'high';
    private stateManager: IStateManager | null;

    constructor(stateManager?: IStateManager, config: Partial<PerformanceMonitorConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.stateManager = stateManager ?? null;
    }

    /**
     * Call this once per animation frame (inside requestAnimationFrame).
     */
    tick() {
        const now = performance.now();
        if (this.lastFrameTime === 0) {
            this.lastFrameTime = now;
            return;
        }

        const delta = now - this.lastFrameTime;
        this.lastFrameTime = now;

        this.frameTimes.push(delta);

        // Drop frames older than the sample window
        let total = 0;
        let i = this.frameTimes.length - 1;
        while (i >= 0 && total < this.config.sampleWindow) {
            total += this.frameTimes[i];
            i--;
        }
        this.frameTimes = this.frameTimes.slice(i + 1);

        // Compute rolling average FPS
        const avgDelta = total / this.frameTimes.length;
        const fps = 1000 / avgDelta;

        this.updateQuality(fps);
    }

    private updateQuality(fps: number) {
        const { targetFps, hysteresis } = this.config;
        let next: QualityLevel;

        if (fps >= targetFps + hysteresis) {
            next = 'ultra';
        } else if (fps >= targetFps) {
            next = 'high';
        } else if (fps >= targetFps - 15) {
            next = 'medium';
        } else {
            next = 'low';
        }

        if (next !== this.currentQuality) {
            console.log(`[PerformanceMonitor] FPS=${fps.toFixed(1)} → quality: ${this.currentQuality} → ${next}`);
            this.currentQuality = next;

            // Optionally propagate to state so UI can react
            if (this.stateManager) {
                (this.stateManager as any).update?.({ renderQuality: next });
            }
        }
    }

    getQualityLevel(): QualityLevel {
        return this.currentQuality;
    }

    /**
     * Returns recommended edge tube segments for the current quality level.
     */
    getRecommendedTubularSegments(baseSegments: number): number {
        switch (this.currentQuality) {
            case 'ultra': return baseSegments;
            case 'high': return baseSegments;
            case 'medium': return Math.max(4, Math.floor(baseSegments * 0.5));
            case 'low': return Math.max(3, Math.floor(baseSegments * 0.25));
        }
    }

    /**
     * Returns whether animated effects (pulse glow, etc.) should be active.
     */
    areEffectsEnabled(): boolean {
        return this.currentQuality === 'ultra' || this.currentQuality === 'high';
    }

    /**
     * Returns recommended node geometry detail (widthSegments / heightSegments multiplier).
     */
    getNodeDetailMultiplier(): number {
        switch (this.currentQuality) {
            case 'ultra': return 1.0;
            case 'high': return 1.0;
            case 'medium': return 0.6;
            case 'low': return 0.4;
        }
    }
}
