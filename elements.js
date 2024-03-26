console.log("elements.js geladen");
import * as THREE from "three";
export const nodeTemplate = (scene, x, y, z) => {
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  const material = new THREE.MeshLambertMaterial({ color: 0x3030b0 });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(x, y, z);
  scene.add(sphere);
  return sphere;
};

export const edgeTemplate = (scene, start, end) => {
  const material = new THREE.LineDashedMaterial({
    color: 0xdfefff,
    linewidth: 1,
    scale: 1,
    dashSize: 3,
    gapSize: 1,
    isLineDashedMaterial: true,
  });
  const points = [];
  points.push(start.position);
  points.push(end.position);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  scene.add(line);
  return line;
};
