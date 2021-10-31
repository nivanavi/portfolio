import * as THREE            from "three";
import {MOST_IMPORTANT_DATA} from "../index";

export const setupLights = () => {
  const {scene} = MOST_IMPORTANT_DATA;

  const ambientLight = new THREE.AmbientLight("#ffffff", 0.1);

  const pointLight = new THREE.PointLight("#ffffff", 0.5)
  pointLight.position.set(0, 0, 7);

  scene.add(ambientLight, pointLight)

  return {
    ambientLight,
    pointLight
  }
}