import * as THREE            from "three";
import {MOST_IMPORTANT_DATA} from "../index";

export const setupLights = () => {
  const {scene} = MOST_IMPORTANT_DATA;
  const ambientLight = new THREE.AmbientLight("#ffffff", 1);

  const pointLight = new THREE.PointLight("#ffffff", 0.5)
  pointLight.position.set(0, 13, 0);

  scene.add(ambientLight, pointLight)

  return {
    ambientLight,
    pointLight
  }
}