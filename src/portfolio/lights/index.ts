import * as THREE            from "three";
import {MOST_IMPORTANT_DATA} from "../index";

export const setupLights = () => {
  const {scene} = MOST_IMPORTANT_DATA;
  const ambientLight = new THREE.AmbientLight("#ffffff", 1);


  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
  const helper = new THREE.DirectionalLightHelper( directionalLight, 5, "red" );

  directionalLight.position.set(0, 13, 0);
  directionalLight.castShadow = true;
  // directionalLight.shadow.mapSize.x = 15024;
  // directionalLight.shadow.mapSize.y = 15024;
  // directionalLight.shadow.camera.top = 20;
  // directionalLight.shadow.camera.right = 20;
  // directionalLight.shadow.camera.bottom = -20;
  // directionalLight.shadow.camera.left = -20;
  // directionalLight.shadow.camera.near = 15;
  // directionalLight.shadow.camera.far = 15;
  // directionalLight.shadow.radius = 10;

  scene.add(ambientLight, directionalLight)
  scene.add( helper );
  return {
    ambientLight,
    directionalLight
  }
}