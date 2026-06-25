import type { App } from '../App';
import { IStateManager } from '../core/interfaces';
import type { State } from '../core/StateManager';

export class EdgeControlsUI {
    private app: App;
    private stateManager: IStateManager;

    constructor(stateManager: IStateManager, app: App) {
        this.stateManager = stateManager;
        this.app = app;

        this.init();
    }

    private init() {
        this.initEdgeControls();
    }

    private sliderToCurvature(val: number): number {
        // Logarithmic scale: slider 0 -> curvature 0, slider 100 -> curvature ~99.0
        if (val === 0) return 0;
        return Math.pow(10, val / 50) - 1;
    }

    private curvatureToSlider(val: number): number {
        // Inverse of sliderToCurvature
        if (val <= 0) return 0;
        return Math.log10(val + 1) * 50;
    }

    private sliderToHighlightPercent(s: number): number {
        // Range 1% to 200%, middle (50) is 30%
        const B = 170 / 29;
        const P = 841 / 141;
        const Q = -700 / 141;
        return P * Math.pow(B, s / 50) + Q;
    }

    private highlightPercentToSlider(v: number): number {
        const B = 170 / 29;
        const P = 841 / 141;
        const Q = -700 / 141;
        if (v <= Q) return 0;
        return 50 * Math.log((v - Q) / P) / Math.log(B);
    }

    private initEdgeControls() {
        const thicknessSlider = document.getElementById('edgeThicknessSlider') as HTMLInputElement;
        const thicknessValue = document.getElementById('edgeThicknessValue') as HTMLSpanElement;
        const tubularSlider = document.getElementById('edgeSegmentsSlider') as HTMLInputElement;
        const tubularValue = document.getElementById('edgeSegmentsValue') as HTMLSpanElement;
        const radialSlider = document.getElementById('edgeRadialSlider') as HTMLInputElement;
        const radialValue = document.getElementById('edgeRadialValue') as HTMLSpanElement;
        const highlightSlider = document.getElementById('edgeHighlightSlider') as HTMLInputElement;
        const highlightValue = document.getElementById('edgeHighlightValue') as HTMLSpanElement;
        const selectionSlider = document.getElementById('edgeSelectionSlider') as HTMLInputElement;
        const selectionValue = document.getElementById('edgeSelectionValue') as HTMLSpanElement;
        const curveSlider = document.getElementById('edgeCurveSlider') as HTMLInputElement;
        const curveValue = document.getElementById('edgeCurveValue') as HTMLSpanElement;
        const pulseSlider = document.getElementById('edgePulseSlider') as HTMLInputElement;
        const pulseValue = document.getElementById('edgePulseValue');
        const animModeSelect = document.getElementById('edgeAnimModeSelect') as HTMLSelectElement;
        const opacitySlider = document.getElementById('edgeOpacitySlider') as HTMLInputElement;
        const opacityValue = document.getElementById('edgeOpacityValue');
        const resetButton = document.getElementById('resetEdgeControls');

        const updateStateAndRefresh = (key: string, value: State[keyof State]) => {
            this.stateManager.update({ [key]: value });
            if (this.app.edgeObjectsManager) {
                if (this.app.currentEntities && this.app.currentRelationships) {
                    this.app.edgeObjectsManager.updateEdges();
                }
            }
        };

        if (thicknessSlider && thicknessValue) {
            thicknessValue.textContent = parseFloat(thicknessSlider.value).toFixed(2);
            thicknessSlider.addEventListener('input', (e) => {
                const value = parseFloat((e.target as HTMLInputElement).value);
                thicknessValue.textContent = value.toFixed(2);
                updateStateAndRefresh('edgeThickness', value);
            });
        }

        if (tubularSlider && tubularValue) {
            tubularValue.textContent = tubularSlider.value;
            tubularSlider.addEventListener('input', (e) => {
                const value = parseInt((e.target as HTMLInputElement).value);
                tubularValue.textContent = value.toString();
                updateStateAndRefresh('edgeTubularSegments', value);
            });
        }

        if (radialSlider && radialValue) {
            radialValue.textContent = radialSlider.value;
            radialSlider.addEventListener('input', (e) => {
                const value = parseInt((e.target as HTMLInputElement).value);
                radialValue.textContent = value.toString();
                updateStateAndRefresh('edgeRadialSegments', value);
            });
        }

        if (curveSlider && curveValue) {
            curveValue.textContent = this.sliderToCurvature(parseFloat(curveSlider.value)).toFixed(2);
            curveSlider.addEventListener('input', (e) => {
                const sliderVal = parseFloat((e.target as HTMLInputElement).value);
                const curvature = this.sliderToCurvature(sliderVal);
                curveValue.textContent = curvature.toFixed(2);
                updateStateAndRefresh('edgeCurveFactor', curvature);
            });
        }

        if (highlightSlider && highlightValue) {
            const initialVal = this.stateManager.state.highlightThickness;
            highlightSlider.value = this.highlightPercentToSlider(initialVal).toString();
            highlightValue.textContent = `${initialVal.toFixed(0)}%`;

            highlightSlider.addEventListener('input', (e) => {
                const sliderVal = parseFloat((e.target as HTMLInputElement).value);
                const percent = this.sliderToHighlightPercent(sliderVal);
                highlightValue.textContent = `${percent.toFixed(0)}%`;
                this.stateManager.update({ highlightThickness: percent });
                if (this.app.highlightManager) {
                    this.app.highlightManager.updateHighlights(this.stateManager.state);
                }
            });
        }

        if (selectionSlider && selectionValue) {
            const initialVal = this.stateManager.state.selectionThickness;
            selectionSlider.value = initialVal.toString();
            selectionValue.textContent = `${initialVal.toFixed(0)}%`;

            selectionSlider.addEventListener('input', (e) => {
                const value = parseFloat((e.target as HTMLInputElement).value);
                selectionValue.textContent = `${value.toFixed(0)}%`;
                this.stateManager.update({ selectionThickness: value });
                if (this.app.highlightManager) {
                    this.app.highlightManager.updateHighlights(this.stateManager.state);
                }
            });
        }

        if (pulseSlider && pulseValue) {
            pulseValue.textContent = parseFloat(pulseSlider.value).toFixed(2);
            pulseSlider.addEventListener('input', (e) => {
                const value = parseFloat((e.target as HTMLInputElement).value);
                pulseValue.textContent = value.toFixed(2);
                updateStateAndRefresh('edgePulseSpeed', value);
            });
        }

        if (animModeSelect) {
            animModeSelect.addEventListener('change', (e) => {
                const value = (e.target as HTMLSelectElement).value;
                updateStateAndRefresh('edgeAnimationMode', value);
            });
        }

        if (opacitySlider && opacityValue) {
            opacityValue.textContent = parseFloat(opacitySlider.value).toFixed(2);
            opacitySlider.addEventListener('input', (e) => {
                const value = parseFloat((e.target as HTMLInputElement).value);
                opacityValue.textContent = value.toFixed(2);
                this.updateEdgeOpacity(value);
            });
        }

        if (resetButton) {
            resetButton.addEventListener('click', () => {
                const defaults = {
                    edgeThickness: 0.1,
                    edgeTubularSegments: 20,
                    edgeRadialSegments: 8,
                    edgeCurveFactor: 0.4,
                    edgePulseSpeed: 1.0,
                    highlightThickness: 10,
                    selectionThickness: 20,
                    edgeAnimationMode: 'pulse',
                    edgeOpacity: 1.0
                };

                // Update UI elements
                if (thicknessSlider) thicknessSlider.value = defaults.edgeThickness.toString();
                if (thicknessValue) thicknessValue.textContent = defaults.edgeThickness.toFixed(2);
                if (tubularSlider) tubularSlider.value = defaults.edgeTubularSegments.toString();
                if (tubularValue) tubularValue.textContent = defaults.edgeTubularSegments.toString();
                if (radialSlider) radialSlider.value = defaults.edgeRadialSegments.toString();
                if (radialValue) radialValue.textContent = defaults.edgeRadialSegments.toString();
                if (curveSlider) curveSlider.value = this.curvatureToSlider(defaults.edgeCurveFactor).toString();
                if (curveValue) curveValue.textContent = defaults.edgeCurveFactor.toFixed(2);
                if (pulseSlider) pulseSlider.value = defaults.edgePulseSpeed.toString();
                if (pulseValue) pulseValue.textContent = defaults.edgePulseSpeed.toFixed(2);
                if (highlightSlider) highlightSlider.value = this.highlightPercentToSlider(defaults.highlightThickness).toString();
                if (highlightValue) highlightValue.textContent = `${defaults.highlightThickness}%`;
                if (selectionSlider) selectionSlider.value = defaults.selectionThickness.toString();
                if (selectionValue) selectionValue.textContent = `${defaults.selectionThickness}%`;
                if (animModeSelect) animModeSelect.value = defaults.edgeAnimationMode;
                if (opacitySlider) opacitySlider.value = defaults.edgeOpacity.toString();
                if (opacityValue) opacityValue.textContent = defaults.edgeOpacity.toFixed(2);

                // Update State and refresh
                this.stateManager.update(defaults);
                if (this.app.edgeObjectsManager && this.app.currentEntities && this.app.currentRelationships) {
                    this.app.edgeObjectsManager.updateEdges();
                }
                this.updateEdgeOpacity(defaults.edgeOpacity);
            });
        }
    }

    private updateEdgeOpacity(opacity: number) {
        if (this.app.edgeObjectsManager) {
            // Update opacity for existing edge meshes
            const edgeMeshes = this.app.edgeObjectsManager.getMeshes();
            edgeMeshes.forEach((mesh: any) => {
                if (mesh.material) {
                    mesh.material.transparent = opacity < 1.0;
                    mesh.material.opacity = opacity;
                    mesh.material.needsUpdate = true;
                }
            });
        }
    }
}
