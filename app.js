import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { nodeTemplate, edgeTemplate } from './elements.js';
import { createGridHelpers } from './createGridHelpers.js';

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
// Tooltip Element
const tooltip = document.getElementById('tooltip'); 

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Beim Maus-Bewegen
document.addEventListener('mousemove', (event) => {

  // Position des Mauszeigers
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  //console.log("mouse.x: "+mouse.x);
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Raycaster-Strahl aus der Kamera durch die Mausposition
  raycaster.setFromCamera(mouse, camera);

  // Schnittpunkte mit Objekten berechnen
  const intersects = raycaster.intersectObjects(scene.children);
  let objRoot;
  if(intersects.length > 0) {

    // Erstes Objekt in Array
    const obj = intersects[0].object;
    objRoot = obj;
    // Wenn Knoten oder Kante
    if(obj instanceof THREE.Line || obj instanceof THREE.Mesh) {

      tooltip.style.display = 'block';

      // Positionieren
      tooltip.style.left = event.clientX + 20+'px';
      //console.log(tooltip.style.left);
      tooltip.style.top = event.clientY - 60+'px';
      if(tooltip.style.opacity < 0.9) {
        tooltip.style.opacity += 0.05;
      }
      console.log(tooltip.style.opacity);

      // Koordinaten anzeigen
      tooltip.innerHTML = `
      name: ${obj.name}<br>
      id: ${obj.id}<br>
      Y: ${Math.floor(obj.position.y*10)/10}<br>
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
window.sceneRoot = scene;
animate();
                                                    