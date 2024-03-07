import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { nodeTemplate, edgeTemplate } from './elements.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);

camera.position.z = 6;
camera.position.y = 5;
camera.position.x = -1;

const node1 = nodeTemplate(scene, 0, 0, 0);
const node2 = nodeTemplate(scene, 2, 2, 0);

const edge = edgeTemplate(scene, node1, node2);

const size = 30;
const divisions = 10;
const gridHelper = new THREE.GridHelper(30, 10);
scene.add(gridHelper);

// Raycaster und Mouse hinzufügen
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const intersected = intersects[0].object;
        if (intersected.userData.type === 'node' || intersected.userData.type === 'edge') { // Du musst sicherstellen, dass deine Knoten/Edges userData haben
            const coords = intersected.position; // oder Logik für Kanten, falls anders gehandhabt
            document.getElementById('tooltip').style.display = 'block';
            document.getElementById('tooltip').style.left = `${event.clientX}px`;
            document.getElementById('tooltip').style.top = `${event.clientY}px`;
            document.getElementById('tooltip').innerHTML = `Koordinaten: ${JSON.stringify(coords)}`;
        }
    } else {
        document.getElementById('tooltip').style.display = 'none';
    }
}

window.addEventListener('mousemove', onMouseMove, false);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
