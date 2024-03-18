import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { nodeTemplate, edgeTemplate } from './elements.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { createGridHelpers } from './createGridHelpers.js';
import { onMouseMove } from "./temp.js";

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
camera.position.y = 3;
camera.position.x = 5;
//knoten erstellen
const node1 = nodeTemplate(scene, 0, 0, 2);
const node2 = nodeTemplate(scene, 2, 2, -2);
const node3 = nodeTemplate(scene, (Math.random()*5), (Math.random()*5), 0);
const node4 = nodeTemplate(scene, 2, (Math.random()*5), 0);
(Math.random()*5)
//Kanten erstellen
const edge = edgeTemplate(scene, node1, node2);
const edge1 = edgeTemplate(scene, node1, node3);
const edge2 = edgeTemplate(scene, node2, node4);

createGridHelpers(scene);

// Raycaster und Mouse hinzufügen
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    console.log("intersects.Length > 0")
       if (intersects.length > 0) { 
        let intersected = intersects[0].object;
       }


window.addEventListener('mousemove', mouseEvents.onMouseMove, false);



onMouseMove(event);


function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
                                                    