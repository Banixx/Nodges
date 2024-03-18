import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { nodeTemplate, edgeTemplate } from './elements.js';
//import { addGridHelpers } from './helper.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
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
//Gridhelper
const Gridhelp = new addGridHelpers
//scene.add(Gridhelp);
//scene.add(gridHelperXZ);
//scene.add(gridHelperXZ);
//scene.add(gridHelperXZ);

camera.position.z = 6;
camera.position.y = 5;
camera.position.x = -1;
//knoten erstellen
const node1 = nodeTemplate(scene, 0, 0, 2);
const node2 = nodeTemplate(scene, 2, 2, -2);
const node3 = nodeTemplate(scene, (Math.random()*5), (Math.random()*5), 0);
const node4 = nodeTemplate(scene, 2, (Math.random()*5), 0);
(Math.random()*5)
//Kanten erstellen
const edge = edgeTemplate(scene, node1, node2);

const randomEdge = function(){
    console.log ("randomEdge gestartet");
    let sumNodes = [1,2,3,4];
let ranNode = Math.floor(Math.random() * meinArray.length);
console.log("rannode: "+ranNode)
    nodeA = ("node"+ranNode)
    nodeB = ("node"+ranMode)
let edge3 =edgeTemplate(scene, nodeA, nodeB)
}

const size = 30;
const divisions = 10;

//const gridHelper = new THREE.GridHelper(30, 10);
//scene.add(gridHelper);
createGridHelpers(scene);

// Raycaster und Mouse hinzufügen
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    //console.log("x: "+mouse.x+" y: "+mouse.y)

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        console.log("intersects.Length > 0")
        const intersected = intersects[0].object;
        if (intersected.userData.type === 'node' || intersected.userData.type === 'edge') { 
            
        console.log("ist node oder edge")
            const coords = intersected.position; 
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

   // Setze das Intervall auf 1000 Millisekunden (1 Sekunde)
    //const intervallID = setInterval(randomEdge, 1000);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

    
    
 
    

}

animate();
                                                    