import * as CANNON            from 'cannon-es'
import * as THREE             from "three";
import {copyPositions}        from "../../utils";
import {Howl}                 from "howler";
import {dummyPhysicsMaterial} from "../../physics";
import {MOST_IMPORTANT_DATA}  from "../../index";
import {CAR_DYNAMIC_OPTIONS}  from "../car";


// @ts-ignore
// import recorderSongUrl        from "./sounds/recorderSong.mp3"


export interface teleportProps extends objectProps {
  enterPosition: THREE.Vector3
  exitPosition: THREE.Vector3
}

interface oneTeleportProps extends teleportProps {
  teleportCallback: () => void
}

export type callInTickTeleport = {
  mesh: THREE.Object3D
  body: CANNON.Body
}

const teleportPlayer = new Howl({
  // src: [recorderSongUrl],
  html5: true,
  volume: 1,
  loop: false
});

const teleport = ({enterPosition, exitPosition, teleportCallback}: oneTeleportProps) => {
  const {physicWorld, scene} = MOST_IMPORTANT_DATA;

  const teleportMaterial = new THREE.MeshStandardMaterial({
    color: "yellow"
  });
  const teleportGeometry = new THREE.BoxBufferGeometry(0.4, 4, 0.4);

  const teleportLeftMesh = new THREE.Mesh(
    teleportGeometry,
    teleportMaterial
  )
  const teleportRightMesh = new THREE.Mesh(
    teleportGeometry,
    teleportMaterial
  )
  teleportLeftMesh.receiveShadow = true
  teleportRightMesh.receiveShadow = true

  // physic
  const teleportShape = new CANNON.Box(new CANNON.Vec3(0.2, 2, 0.2));
  const teleportLeftBody = new CANNON.Body({
    mass: 0,
    shape: teleportShape,
    material: dummyPhysicsMaterial
  })
  const teleportRightBody = new CANNON.Body({
    mass: 0,
    shape: teleportShape,
    material: dummyPhysicsMaterial
  })

  teleportLeftBody.position.set(enterPosition.x, enterPosition.y, enterPosition.z);
  teleportRightBody.position.set(enterPosition.x + 3, enterPosition.y, enterPosition.z);

  copyPositions({
    body: teleportLeftBody,
    mesh: teleportLeftMesh
  })
  copyPositions({
    body: teleportRightBody,
    mesh: teleportRightMesh
  })

  physicWorld.addBody(teleportLeftBody);
  physicWorld.addBody(teleportRightBody);
  scene.add(teleportLeftMesh, teleportRightMesh);


  const raycaster = new THREE.Raycaster();
  const rayOrigin = new THREE.Vector3(enterPosition.x, enterPosition.y + 0.3, enterPosition.z);
  const rayDirection = new THREE.Vector3(1, 0, 0);
  raycaster.far = 2.6;
  raycaster.set(rayOrigin, rayDirection)

  const callInTick = ({body, mesh}: callInTickTeleport) => {

    const intersects = raycaster.intersectObject(mesh);
    if (intersects.length) {
      console.log("body before teleport", body)
      teleportCallback();
      body.position.set(exitPosition.x+ 2, exitPosition.y + 0.1, exitPosition.z)
    }
  }

  return {
    callInTick
  }
}

export const teleportObject = ({enterPosition, exitPosition}: teleportProps) => {
  const {addToCallInTickStack} = MOST_IMPORTANT_DATA;
  const TELEPORT_OPTIONS = {
    lastTeleport: 0,
    teleportDelta: 500
  }

  const teleportCallback = () => TELEPORT_OPTIONS.lastTeleport = Date.now();

  const {callInTick: callInTickEnter} = teleport({enterPosition, exitPosition, teleportCallback})
  const {callInTick: callInTickExit} = teleport({enterPosition: exitPosition, exitPosition: enterPosition, teleportCallback})

  const callInTick = (props: callInTickTeleport) => {
    const currentTime = Date.now();
    if (currentTime < TELEPORT_OPTIONS.lastTeleport + TELEPORT_OPTIONS.teleportDelta) return;

    callInTickEnter(props)
    callInTickExit(props)
  }

  return {
    callInTick
  }
}