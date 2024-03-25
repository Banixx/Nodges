import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { nodeTemplate, edgeTemplate } from './elements.js';
import { createGridHelpers } from './createGridHelpers.js';
import tooltip from './tooltip.js';

//const tooltip = new Tooltip('tooltip');

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

const node1 = nodeTemplate(scene, 0, 0, 2);
const node2 = nodeTemplate(scene, 2, 2, -2);
const node3 = nodeTemplate(scene, (Math.random()*5), (Math.random()*5), 0);
const node4 = nodeTemplate(scene, 2, (Math.random()*5), 0);

const edge = edgeTemplate(scene, node1, node2);
const edge1 = edgeTemplate(scene, node1, node3);
const edge2 = edgeTemplate(scene, node2, node4);

createGridHelpers(scene);

//const tooltip2 = document.getElementById('tooltip'); 

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function updateTooltipPosition(event) {
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let posX = event.clientX + 20;
    let posY = event.clientY - 20;

    // Verhindert, dass der Tooltip rechts außerhalb des Fensters angezeigt wird
    if (posX + tooltipWidth > windowWidth) {
        posX = windowWidth - tooltipWidth - 20;
    }

    // Verhindert, dass der Tooltip unten außerhalb des Fensters angezeigt wird
    if (posY + tooltipHeight > windowHeight) {
        posY = windowHeight - tooltipHeight - 20;
    }

    // Verhindert, dass der Tooltip oben außerhalb des Fensters angezeigt wird
    if (posY < 0) {
        posY = 20; // Etwas Abstand zum oberen Rand
    }

    tooltip.style.left = `${posX}px`;
    tooltip.style.top = `${posY}px`;
}

const interactiveObjects = [];
interactiveObjects.push(node1, node2, node3, node4, edge, edge1, edge2);

document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(interactiveObjects);

    if (intersects = true) {
      tooltip.show(`Inhalt des Tooltips`, event.clientX, event.clientY);
  } else {
      tooltip.hide();
  }

    if(intersects.length > 0) {
        const obj = intersects[0].object;

        if(obj instanceof THREE.Line || obj instanceof THREE.Mesh) {
          if ((obj instanceof THREE.Line || obj instanceof THREE.Mesh) && !obj.name.includes("XY") && !obj.name.includes("YZ") && !obj.name.includes("XZ"))
            tooltip.style.display = 'block';
            updateTooltipPosition(event);

            tooltip.innerHTML = `
            name: ${obj.name}<br>
            id: ${obj.id}<br>
            X: ${obj.position.x.toFixed(2)}<br>
            Y: ${obj.position.y.toFixed(2)}<br>
            Z: ${obj.position.z.toFixed(2)}`;
        }
    } else {
        tooltip.style.display = 'none';
    }
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
