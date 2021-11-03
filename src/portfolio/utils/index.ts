import * as CANNON from 'cannon-es'
import * as THREE        from "three";
import {windowSizesType} from "../index";

export type copyPositionType = {
  body: CANNON.Body | null | undefined,
  mesh: THREE.Mesh | THREE.Group | null | undefined,
  isCopyRotation?: boolean
  positionOffset?: THREE.Vector3 | CANNON.Vec3
}

export const copyPositions = ({body, mesh, isCopyRotation = true, positionOffset}:copyPositionType) => {
  if (!body || !mesh) return console.log("U try copy position of null");

  mesh.position.x = body.position.x + (positionOffset?.x || 0);
  mesh.position.y = body.position.y + (positionOffset?.y || 0);
  mesh.position.z = body.position.z + (positionOffset?.z || 0);

  if (!isCopyRotation) return;
  mesh.quaternion.copy(new THREE.Quaternion(
    body.quaternion.x,
    body.quaternion.y,
    body.quaternion.z,
    body.quaternion.w
  ));
}

export type windowResizeUtilProps = {
  windowSizes: windowSizesType
  renderer: THREE.Renderer
  callback?: () => void
}

export const windowResizeUtil = ({windowSizes, renderer, callback}: windowResizeUtilProps) => {
  windowSizes.width = window.innerWidth;
  windowSizes.height = window.innerHeight;
  renderer.setSize(windowSizes.width, windowSizes.height);
  if (callback) callback()
}