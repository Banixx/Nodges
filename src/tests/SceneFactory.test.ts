// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { SceneFactory } from '../core/SceneFactory';

/**
 * Tests fuer die aus App.ts ausgelagerte SceneFactory (Refactoring Schritt 2).
 * Der WebGL-Renderer und OrbitControls benoetigen eine echte Render-Context
 * und werden hier bewusst nicht direkt instanziiert; getestet werden die
 * reinen, deterministischen Bestandteile (Boden/Grid-Erzeugung).
 */

describe('SceneFactory', () => {
    it('createGround fuegt Boden und Grid der Szene hinzu', () => {
        const scene = new THREE.Scene();
        const initialCount = scene.children.length;

        const ground = SceneFactory.createGround(scene);

        expect(ground).toBeInstanceOf(THREE.Mesh);
        expect(ground.receiveShadow).toBe(true);

        // Boden (Mesh) + GridHelper wurden hinzugefuegt
        expect(scene.children.length).toBe(initialCount + 2);

        const grid = scene.children[scene.children.length - 1];
        expect(grid).toBeInstanceOf(THREE.GridHelper);
    });

    it('createGround positioniert den Boden unterhalb der Null-Ebene', () => {
        const scene = new THREE.Scene();
        const ground = SceneFactory.createGround(scene);

        expect(ground.position.y).toBeCloseTo(-5);
        expect(ground.rotation.x).toBeCloseTo(-Math.PI / 2);
    });

    it('setup liefert Lichter und Boden ohne Fehler (Dummy-Callbacks)', () => {
        // setup benoetigt einen Renderer; wir testen die Rueckgabestruktur mit
        // einem minimalen Stub-Renderer (keine WebGL-Initialisierung).
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

        const fakeRenderer = {
            setSize: () => {},
            setPixelRatio: () => {},
            autoClear: true,
            shadowMap: { enabled: false, type: 0 },
            domElement: document.createElement('canvas'),
        } as unknown as THREE.WebGLRenderer;

        const fakeControls = {
            enableDamping: true,
            dampingFactor: 0,
            maxPolarAngle: 0,
            minDistance: 0,
            maxDistance: 0,
            addEventListener: () => {},
        } as unknown as import('three/examples/jsm/controls/OrbitControls.js').OrbitControls;

        const result = SceneFactory.setup(scene, camera, fakeRenderer, fakeControls, {
            ambientLightIntensity: 1,
            directionalLightIntensity: 0.5,
        });

        expect(result.ambientLight).toBeInstanceOf(THREE.AmbientLight);
        expect(result.directionalLight).toBeInstanceOf(THREE.DirectionalLight);
        expect(result.ground).toBeInstanceOf(THREE.Mesh);
        // Lichter und Boden wurden zur Szene hinzugefuegt
        expect(scene.children.length).toBeGreaterThan(2);
    });
});
