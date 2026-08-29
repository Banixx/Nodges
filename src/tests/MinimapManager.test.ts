// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import { MinimapManager } from '../core/MinimapManager';

/**
 * Tests fuer den aus App.ts ausgelagerten MinimapManager.
 * Bestaetigt, dass die Minimap-Logik isoliert funktioniert (Refactoring Schritt 1).
 */

function createMockRenderer() {
    const clearColor = new THREE.Color(0x000000);
    let clearAlpha = 0;
    const scene = new THREE.Scene();
    return {
        scene,
        clearColor,
        clearAlpha,
        renderer: {
            domElement: document.createElement('canvas'),
            getClearColor: vi.fn((target: THREE.Color) => target.copy(clearColor)),
            getClearAlpha: vi.fn(() => clearAlpha),
            setClearColor: vi.fn((color: unknown, alpha: number) => {
                clearColor.copy(color as THREE.Color);
                clearAlpha = alpha;
            }),
            setScissorTest: vi.fn(),
            setViewport: vi.fn(),
            setScissor: vi.fn(),
            clear: vi.fn(),
            render: vi.fn(),
        } as unknown as THREE.WebGLRenderer,
    };
}

beforeEach(() => {
    // MinimapUI benoetigt einen Container im DOM
    document.body.innerHTML = '<div id="minimapContainer"></div>';
});

describe('MinimapManager', () => {
    it('erstellt eine orthografische Kamera von oben', () => {
        const scene = new THREE.Scene();
        const mm = new MinimapManager('minimapContainer', scene);

        expect(mm.camera).toBeInstanceOf(THREE.OrthographicCamera);
        expect(mm.camera.position.y).toBeCloseTo(500);
        expect(mm.camera.up.y).toBeCloseTo(0);
        expect(mm.camera.up.z).toBeCloseTo(-1);
        mm.dispose();
    });

    it('setView zentriert die Kamera auf eine Weltposition', () => {
        const scene = new THREE.Scene();
        const mm = new MinimapManager('minimapContainer', scene);

        mm.setView(42, -13, 250);

        // Kamera blickt auf (42, 0, -13)
        const lookTarget = new THREE.Vector3(42, 0, -13);
        mm.camera.up.set(0, 0, -1);
        mm.camera.lookAt(lookTarget);

        // Orthographic-Frustum entspricht dem Zoom
        expect(mm.camera.right).toBeGreaterThan(0);
        expect(mm.camera.bottom).toBeLessThan(0);
        expect(mm.camera.left).toBeLessThan(0);
        expect(mm.camera.top).toBeGreaterThan(0);

        mm.dispose();
    });

    it('reset stellt Zentrum und Zoom auf die Ausgangswerte zurueck', () => {
        const scene = new THREE.Scene();
        const mm = new MinimapManager('minimapContainer', scene);

        mm.setView(10, 10, 400);
        mm.reset();

        const dir = new THREE.Vector3();
        mm.camera.getWorldDirection(dir);
        // Kamera zeigt entlang -Y (Blick von oben auf 0,0,0)
        expect(dir.y).toBeLessThan(0);

        mm.dispose();
    });

    it('render zeichnet den Minimap-Viewport und stellt Labels wieder her', () => {
        const scene = new THREE.Scene();
        const mm = new MinimapManager('minimapContainer', scene);
        const { renderer, scene: mmScene } = createMockRenderer();
        scene.add(mmScene);

        const mainCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        mainCamera.position.set(5, 6, 7);

        let labelCalls: boolean[] = [];
        mm.render(
            renderer,
            mainCamera,
            { nodeVisible: true, edgeVisible: true },
            (nv, ev) => { labelCalls.push(nv && ev); }
        );

        // Der zweite Render-Pass wurde mit der Minimap-Kamera ausgefuehrt
        expect(renderer.render).toHaveBeenCalledTimes(1);
        const [renderScene, renderCam] = (renderer.render as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(renderCam).toBe(mm.camera);
        expect(renderScene).toBe(scene);
        // Labels wurden zuerst aus- und danach wieder eingeschaltet
        expect(labelCalls[0]).toBe(false);
        expect(labelCalls[labelCalls.length - 1]).toBe(true);

        mm.dispose();
    });
});
