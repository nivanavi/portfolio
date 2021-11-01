import * as THREE                            from "three";
import {calInTickProps, MOST_IMPORTANT_DATA} from "../index";

export const CAMERA_OPTIONS = {
  position: new THREE.Vector3(0, -5, 10),
  rotation: new THREE.Quaternion(1, 0, 0, 1),
  angleOfView: new THREE.Vector3(3, 2, 2),

  positionTarget: new THREE.Vector3(0, 0, 0),
  positionEased: new THREE.Vector3(0, 0, 0),
  easing: 0.15,

  zoomValue: 0.3,
  zoomTargetValue: 0.3,
  zoomEasing: 0.1,
  zoomMinDistance: 5,
  zoomAmplitude: 15,
  zoomDistance: 5 + 15 * 0.3,

  panStartValueX: 3,
  panStartValueY: 2,
  panValueX: 0,
  panValueY: 0,
  panTargetValueX: 0,
  panTargetValueY: 0,
  panEasing: 0.1,

  panRaycaster: new THREE.Raycaster()
}

export const setupCameras = () => {
  const {windowSizes, scene, addToCallInTickStack} = MOST_IMPORTANT_DATA;

  const camera = new THREE.PerspectiveCamera(50, windowSizes.width / windowSizes.height, 1, 80);
  camera.up.set(0, 1, 0);
  camera.position.copy(CAMERA_OPTIONS.angleOfView)

  const hitMesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(500, 500, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, visible: false })
  );
  scene.add(hitMesh)

  const callInTickCamera: (props: calInTickProps) => void = () => {
    // update position for zoom
    // CAMERA_OPTIONS.positionEased.x += (CAMERA_OPTIONS.positionTarget.x - CAMERA_OPTIONS.positionEased.x) * CAMERA_OPTIONS.easing
    // CAMERA_OPTIONS.positionEased.y += (CAMERA_OPTIONS.positionTarget.y - CAMERA_OPTIONS.positionEased.y) * CAMERA_OPTIONS.easing
    // CAMERA_OPTIONS.positionEased.z += (CAMERA_OPTIONS.positionTarget.z - CAMERA_OPTIONS.positionEased.z) * CAMERA_OPTIONS.easing
    // // Apply zoom
    // camera.position.copy(CAMERA_OPTIONS.positionEased).add(CAMERA_OPTIONS.angleOfView.clone().normalize().multiplyScalar(CAMERA_OPTIONS.zoomDistance))
    //
    // CAMERA_OPTIONS.zoomValue += (CAMERA_OPTIONS.zoomTargetValue - CAMERA_OPTIONS.zoomValue) * CAMERA_OPTIONS.zoomEasing;
    // CAMERA_OPTIONS.zoomDistance = CAMERA_OPTIONS.zoomMinDistance + CAMERA_OPTIONS.zoomAmplitude * CAMERA_OPTIONS.zoomValue;
    //
    // // update camera pan
    // camera.position.x -= CAMERA_OPTIONS.panValueX
    // camera.position.y -= CAMERA_OPTIONS.panValueY
    //
    // // update position for pan
    // CAMERA_OPTIONS.panRaycaster.setFromCamera(new THREE.Vector2(), camera);
    // const intersects = CAMERA_OPTIONS.panRaycaster.intersectObjects([hitMesh])
    //
    // if(intersects.length) {
    //   CAMERA_OPTIONS.panTargetValueX = - (intersects[0].point.x - CAMERA_OPTIONS.panStartValueX)
    //   CAMERA_OPTIONS.panTargetValueY = - (intersects[0].point.y - CAMERA_OPTIONS.panStartValueY)
    // }
    //
    // CAMERA_OPTIONS.panValueX += (CAMERA_OPTIONS.panTargetValueX - CAMERA_OPTIONS.panValueX) * CAMERA_OPTIONS.panEasing
    // CAMERA_OPTIONS.panValueY += (CAMERA_OPTIONS.panTargetValueY - CAMERA_OPTIONS.panValueY) * CAMERA_OPTIONS.panEasing
    //
    // const currentWatchPosition = new THREE.Vector3(CAR_DYNAMIC_OPTIONS.oldPosition.x, CAR_DYNAMIC_OPTIONS.oldPosition.y, CAR_DYNAMIC_OPTIONS.oldPosition.z)
    // camera.lookAt(currentWatchPosition);
  }
  addToCallInTickStack(callInTickCamera)

  const wheelEventHandler = (ev: WheelEvent) => {
    CAMERA_OPTIONS.zoomTargetValue += ev.deltaY * 0.001
    CAMERA_OPTIONS.zoomTargetValue = Math.min(Math.max(CAMERA_OPTIONS.zoomTargetValue, 0), 1)
  }

  window.addEventListener("wheel", wheelEventHandler)

  return {
    camera
  }
}