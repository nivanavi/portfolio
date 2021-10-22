import * as THREE    from "three";
import {objectProps} from "../types";

export const setupLights = ({scene}: objectProps) => {
  const ambientLight = new THREE.AmbientLight("#ffffff", 0.1);

  const pointLight = new THREE.PointLight("#ffffff", 0.5)
  pointLight.position.set(0, 0, 7);

  scene.add(ambientLight, pointLight)

  return {
    ambientLight,
    pointLight
  }
}