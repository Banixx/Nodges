// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import { NodeLabelManager } from '../utils/NodeLabelManager';
import { EdgeLabelManager } from '../utils/EdgeLabelManager';
import { ServiceContainer } from '../core/di/ServiceContainer';
import { StateManager } from '../core/StateManager';
import { EntityData } from '../types';

describe('LabelManager LOD and Distance Fading', () => {
    let container: ServiceContainer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let stateManager: StateManager;

    beforeEach(() => {
        // Mock Canvas 2D Context for happy-dom
        const mockContext = {
            measureText: vi.fn(() => ({ width: 50 })),
            fillText: vi.fn(),
            fillRect: vi.fn(),
            beginPath: vi.fn(),
            roundRect: vi.fn(),
            fill: vi.fn(),
            fillStyle: '',
            font: '',
            textAlign: '',
            textBaseline: '',
        };
        HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext as any);

        scene = new THREE.Scene();
        // Camera at origin looking along -Z
        camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
        camera.position.set(0, 0, 0);
        camera.lookAt(0, 0, -100);
        camera.updateMatrixWorld(true);

        container = ServiceContainer.getInstance();
        container.reset();
        container.register('Scene', scene);
        container.register('Camera', camera);

        stateManager = new StateManager();
        (window as any).app = {
            stateManager,
            nodeManager: null,
        };
    });

    describe('NodeLabelManager LOD', () => {
        it('sollte nahe Knoten mit voller Deckkraft anzeigen', () => {
            const manager = new NodeLabelManager(container);
            stateManager.update({
                showLabelsAlways: true,
                labelLodEnabled: true,
                labelFadeDistance: 60,
            });

            const nearNode: EntityData = { id: 'node_near', label: 'Near Node', position: { x: 0, y: 0, z: -10 } };
            const sprite = manager.createOrUpdateLabel(nearNode, new THREE.Vector3(0, 0, -10));
            expect(sprite).toBeDefined();

            manager.update();

            expect(sprite!.visible).toBe(true);
            expect(sprite!.material.opacity).toBeCloseTo(1.0);
        });

        it('sollte Knoten im Uebergangsbereich sanft ausblenden (Distanz-Fading)', () => {
            const manager = new NodeLabelManager(container);
            stateManager.update({
                showLabelsAlways: true,
                labelLodEnabled: true,
                labelFadeDistance: 60, // fadeStart = 36, maxDistance = 60
            });

            // Distanz 48 -> t = (60 - 48) / (60 - 36) = 12 / 24 = 0.5
            const midNode: EntityData = { id: 'node_mid', label: 'Mid Node', position: { x: 0, y: 0, z: -48 } };
            const sprite = manager.createOrUpdateLabel(midNode, new THREE.Vector3(0, 0, -48));

            manager.update();

            expect(sprite!.visible).toBe(true);
            expect(sprite!.material.opacity).toBeCloseTo(0.5);
        });

        it('sollte Knoten jenseits der maximalen Sichtweite komplett cullen', () => {
            const manager = new NodeLabelManager(container);
            stateManager.update({
                showLabelsAlways: true,
                labelLodEnabled: true,
                labelFadeDistance: 60,
            });

            const farNode: EntityData = { id: 'node_far', label: 'Far Node', position: { x: 0, y: 0, z: -80 } };
            const sprite = manager.createOrUpdateLabel(farNode, new THREE.Vector3(0, 0, -80));

            manager.update();

            expect(sprite!.visible).toBe(false);
        });

        it('sollte gehoverte Knoten via On-Demand-Doktrin trotz grosser Distanz voll anzeigen', () => {
            const manager = new NodeLabelManager(container);
            stateManager.update({
                showLabelsAlways: true,
                labelLodEnabled: true,
                labelFadeDistance: 60,
                hoveredObject: { userData: { id: 'node_hover_far' } } as any,
            });

            const farHoverNode: EntityData = { id: 'node_hover_far', label: 'Hover Far', position: { x: 0, y: 0, z: -120 } };
            const sprite = manager.createOrUpdateLabel(farHoverNode, new THREE.Vector3(0, 0, -120));

            manager.update();

            expect(sprite!.visible).toBe(true);
            expect(sprite!.material.opacity).toBeCloseTo(1.0);
        });

        it('sollte Frustum Culling fuer Knoten ausserhalb des Blickfelds anwenden', () => {
            const manager = new NodeLabelManager(container);
            stateManager.update({
                showLabelsAlways: true,
                labelLodEnabled: true,
                labelFadeDistance: 100,
            });

            // Hinter der Kamera (Z = +50, Kamera blickt auf -Z)
            const behindNode: EntityData = { id: 'node_behind', label: 'Behind', position: { x: 0, y: 0, z: 50 } };
            const sprite = manager.createOrUpdateLabel(behindNode, new THREE.Vector3(0, 0, 50));

            manager.update();

            expect(sprite!.visible).toBe(false);
        });
    });

    describe('EdgeLabelManager LOD', () => {
        it('sollte Kanten-Labels mit LOD und On-Demand Hover unterstuetzen', () => {
            const edgeManager = new EdgeLabelManager(container);
            stateManager.update({
                showLabelsAlways: true,
                labelLodEnabled: true,
                labelFadeDistance: 60, // maxDistance = 60 * 0.4 = 24
            });

            const mockLine = new THREE.Object3D();
            mockLine.visible = true;

            const startMesh = new THREE.Object3D();
            startMesh.position.set(0, 0, -10);
            const endMesh = new THREE.Object3D();
            endMesh.position.set(0, 0, -10);

            const edge = {
                id: 'e1',
                line: mockLine,
                startNode: { mesh: startMesh },
                endNode: { mesh: endMesh },
                name: 'Test Rel',
            };

            const sprite = edgeManager.createOrUpdateLabel(edge, 'Test Rel');
            expect(sprite).toBeDefined();

            edgeManager.update();

            expect(sprite!.visible).toBe(true);
            expect(sprite!.material.opacity).toBeGreaterThan(0.5);

            // Nun Kante weit weg verschieben
            startMesh.position.set(0, 0, -100);
            endMesh.position.set(0, 0, -100);

            edgeManager.update();
            expect(sprite!.visible).toBe(false);

            // On-Demand Hover ueberstimmt die Distanz
            stateManager.update({
                hoveredObject: { userData: { id: 'e1' } } as any,
            });

            edgeManager.update();
            expect(sprite!.visible).toBe(true);
        });
    });
});
