import * as THREE from "three";

export const setupLights = () => {
  const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.1);

  const directionalLight = new THREE.DirectionalLight("#ffffff", 1)
  directionalLight.position.set(2, 2, 3);

  return {
    ambientLight,
    directionalLight
  }
}