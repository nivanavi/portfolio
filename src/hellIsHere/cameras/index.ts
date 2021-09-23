import * as THREE      from "three";

export type windowSizesType = {
  width: number
  height: number
}

export type setupCamerasProps = {
  windowSizes: windowSizesType
}

export const CAMERA_OPTIONS = {
  position: new THREE.Vector3(0, -5, 10),
  rotation: new THREE.Quaternion(1, 0, 0, 1),
  angleOfView: new THREE.Vector3(1.135, - 1.45, 5.15),

  zoomValue: 0.5,
  zoomTargetValue: 0.5,
  zoomEasing: 0.1,
  zoomMinDistance: 14,
  zoomAmplitude: 15,
  zoomDistance: 29 * 0.5
}

export const setupCameras = ({windowSizes}:setupCamerasProps) => {
  const camera = new THREE.PerspectiveCamera(50, windowSizes.width / windowSizes.height, 1, 80);
  camera.up.set(0, 0, 1);
  camera.position.copy(CAMERA_OPTIONS.angleOfView)


  // const callInTickCamera = () => {
  //   CAMERA_OPTIONS.zoomValue += (CAMERA_OPTIONS.zoomTargetValue - CAMERA_OPTIONS.zoomValue) * CAMERA_OPTIONS.zoomEasing;
  //   CAMERA_OPTIONS.zoomDistance = CAMERA_OPTIONS.zoomMinDistance + CAMERA_OPTIONS.zoomAmplitude * CAMERA_OPTIONS.zoomValue;
  // }

  const wheelEventHandler = (ev: WheelEvent) => {
    CAMERA_OPTIONS.zoomTargetValue = ev.deltaY * 0.001
    CAMERA_OPTIONS.zoomTargetValue = Math.min(Math.max(CAMERA_OPTIONS.zoomTargetValue, 0), 1)
  }

  window.addEventListener("wheel", wheelEventHandler)

  return {
    camera
  }
}