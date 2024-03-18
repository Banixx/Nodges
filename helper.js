import * as THREE from 'three';

// Funktion, die das Gitternetz zur Szene hinzufügt
export function addGridHelpers(scene) {
    // Farben für die GridHelpers
    const c1 = new THREE.Color(0x425634 ); // Bordeaux für Mittellinien
    const c2 = new THREE.Color(0x56e234); // Ein passendes Blau für Gitterlinien
    const c3 = new THREE.Color(0x5634f2); // Ein dezentes Grün für Gitterlinien

    // Erstelle das Gitternetz in der XZ-Ebene (Boden)
    const gridHelperXZ = new THREE.GridHelper(10, 10, c1, c1);
    //scene.add(gridHelperXZ);

    // Erstelle das Gitternetz in der XY-Ebene (Wand/Front)
    const gridHelperXY = new THREE.GridHelper(10, 10, c2, c2);
    gridHelperXY.rotation.x = Math.PI / 2;
    //scene.add(gridHelperXY);

    // Erstelle das Gitternetz in der YZ-Ebene (Seitenwand)
    const gridHelperYZ = new THREE.GridHelper(10, 10, c3, c3);
    gridHelperYZ.rotation.z = Math.PI / 2;
    //scene.add(gridHelperYZ);
}
