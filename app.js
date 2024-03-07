import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { addGridHelpers } from './helper.js';

// Szene, Kamera und Renderer initialisieren
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x123456); // Hintergrundfarbe

// OrbitControls initialisieren
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Optional: für geschmeidigere Bewegung
camera.position.set(0, 5, 10);
controls.update();

// Szene initialisieren usw.
addGridHelpers(scene);

// Einfache Szene hinzufügen: zwei Knotenpunkte und eine Kante
const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
const points = [];
points.push(new THREE.Vector3(-5, 0, 0));
points.push(new THREE.Vector3(5, 0, 0));
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(geometry, material);
scene.add(line);

// Shift-Taste und Mausbewegung Handhabung
let isShiftDown = false;
document.addEventListener('keydown', function(event) {
    if (event.key === 'Shift') {
        isShiftDown = true;
        controls.enabled = false; // Deaktiviere OrbitControls
    }
});
document.addEventListener('keyup', function(event) {
    if (event.key === 'Shift') {
        isShiftDown = false;
        controls.enabled = true; // Aktiviere OrbitControls
    }
});

let previousMousePosition = { x: 0, y: 0 };
document.addEventListener('mousemove', function(event) {
    if (isShiftDown) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        // Einfache Anpassung der Blickrichtung der Kamera
        camera.rotation.y -= deltaX * 0.005;
        camera.rotation.x -= deltaY * 0.005;
        
        // Sorgt dafür, dass die OrbitControls die neue Ausrichtung "übernehmen"
        controls.target.set(
            camera.position.x + 100 * Math.sin(camera.rotation.y) * Math.cos(camera.rotation.x),
            camera.position.y + 100 * Math.sin(camera.rotation.x),
            camera.position.z + 100 * Math.cos(camera.rotation.y) * Math.cos(camera.rotation.x)
        );
        controls.update();
    }

    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
});

// Animationsloop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
