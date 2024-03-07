import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { nodeTemplate, edgeTemplate } from './elements.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Erstelle ein planares Licht
const light = new THREE.DirectionalLight(0xffffff, 1); // Farbe, Intensität
light.position.set(1, 1, 1); // Setze die Richtung des Lichts
scene.add(light);

// Positioniere die Kamera
camera.position.z = 6;
camera.position.y = 5;
camera.position.x = -1;

// Erstelle Nodes
const node1 = nodeTemplate(scene, 0, 0, 0);
const node2 = nodeTemplate(scene, 2, 2, 0);

// Verbinde Nodes mit einer Edge
const edge = edgeTemplate(scene, node1, node2);
// Füge GridHelper hinzu
const size = 30;
const divisions = 10;
const gridHelper = new THREE.GridHelper(30, 10, new THREE.Color(0x2d2020), new THREE.Color(0x4d6060));
gridHelper
scene.add(gridHelper);

// Animationsloop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
