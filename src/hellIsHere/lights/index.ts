import * as THREE from "three";

export const setupLights = () => {
  const ambientLight = new THREE.AmbientLight("#ffffff", 0.1);

  const directionalLight = new THREE.DirectionalLight("#ffffff", 1)
  directionalLight.position.set(3, 2, 5);

  return {
    ambientLight,
    directionalLight
  }
}