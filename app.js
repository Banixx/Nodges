import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { nodeTemplate, edgeTemplate } from './elements.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Positioniere die Kamera
camera.position.z = 6;

// Erstelle Nodes
const node1 = nodeTemplate(scene, 0, 0, 0);
const node2 = nodeTemplate(scene, 2, 2, 0);

// Verbinde Nodes mit einer Edge
const edge = edgeTemplate(scene, node1, node2);
// Füge GridHelper hinzu
const size = 10;
const divisions = 10;
const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

// Animationsloop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
