// createGridHelpers.js
import * as THREE from 'three';

function createGridHelpers(scene) {

    const helperLayer = new THREE.Layers();
    helperLayer.set(1);  

    const size = 10;
    const divisions = 10;
    const gridColorXY = 0x6666CC;
    const gridColorYZ = 0x12CC66;
    const gridColorXZ = 0xCCff66;

    // XY-Ebene
    const gridHelperXY = new THREE.GridHelper(size, divisions,gridColorXY,gridColorXY);
    gridHelperXY.name = "XY"
    
    gridHelperXY.layers.enable(2); // Aktiviere diesen Layer für den GridHelper
    gridHelperXY.layers.disable(0); // Aktiviere diesen Layer für den GridHelper
    scene.add(gridHelperXY);

    gridHelperXY.rotation.x = Math.PI / 2
    gridHelperXY.position.z = -5;
    gridHelperXY.position.y = 5;


    // YZ-Ebene
    const gridHelperYZ = new THREE.GridHelper(size, divisions,gridColorYZ,gridColorYZ);
    gridHelperYZ.name = "YZ"

    gridHelperYZ.layers.enable(3);
    gridHelperYZ.layers.disable(0); 


    gridHelperYZ.rotation.z = Math.PI / 2;
    gridHelperYZ.position.x = -size / 2;
    gridHelperYZ.position.y = +5
  

    

    scene.add(gridHelperYZ);

    // XZ-Ebene (standardmäßig von Three.js bereitgestellt)
    const gridHelperXZ = new THREE.GridHelper(size, divisions,gridColorXZ,gridColorXZ);
    
    gridHelperXZ.layers.enable(4);
    gridHelperXZ.layers.enable(2);
    gridHelperXZ.layers.disable(0); 


    gridHelperXZ.name = "XZ"
    gridHelperXZ.position.y = 0
    scene.add(gridHelperXZ);
}

export { createGridHelpers };
