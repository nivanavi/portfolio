import * as THREE from "three";

export const setupLights = () => {
  const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.5);

  const directionalLight = new THREE.DirectionalLight("#ffffff", 0.5)
  directionalLight.position.set(4, 5, -2);

  return {
    ambientLight,
    directionalLight
  }
}