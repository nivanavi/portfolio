import CANNON                from "cannon";
import * as THREE            from "three";
import {objectProps}         from "../../types";
import {copyPositions}       from "../../utils";
import {Howl}                from "howler";

// @ts-ignore
import recorderSongUrl        from "./sounds/recorderSong.mp3"
import {dummyPhysicsMaterial} from "../../physics";
import {CAR_DYNAMIC_OPTIONS}  from "../car";

const recorderPlayer = new Howl({
  src: [recorderSongUrl],
  html5: true,
  volume: 0.5,
  loop: true
});

export const RECORDER_OPTIONS = {
  width: 0.6,
  height: 0.4,
  depth: 0.25,
  mass: 10,
  isPlay: false,
  maxVolume: 0.5,
  lastTouche: 0,
  toucheDelta: 200,
  lastBassJump: 0,
  bassJumpDelta: 1000
}

const getVolumeByDistance = (distance: number) => RECORDER_OPTIONS.maxVolume / distance;

export const recorderObject = ({physicWorld, scene}: objectProps) => {
  // graphic
  const recorderMaterial = new THREE.MeshStandardMaterial({
    color: "red"
  });
  const recorderGeometry = new THREE.BoxBufferGeometry(RECORDER_OPTIONS.width, RECORDER_OPTIONS.height, RECORDER_OPTIONS.depth);
  const recorderMesh = new THREE.Mesh(
    recorderGeometry,
    recorderMaterial
  )
  recorderMesh.receiveShadow = true
  recorderMesh.rotation.x = -Math.PI * 0.5
  // physic
  const recorderShape = new CANNON.Box(new CANNON.Vec3(RECORDER_OPTIONS.width * 0.5, RECORDER_OPTIONS.height * 0.5, RECORDER_OPTIONS.depth * 0.5));
  const recorderBody = new CANNON.Body({
    mass: RECORDER_OPTIONS.mass,
    shape: recorderShape,
    material: dummyPhysicsMaterial
  })
  recorderBody.allowSleep = true;
  recorderBody.position.set(-2, -2, 2)
  recorderBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)

  recorderBody.addEventListener("collide", (ev: any) => {
    if (ev.body.mass === 0 || ev.contact.getImpactVelocityAlongNormal() < 1.2) return;
    const currentTime = Date.now();
    if (currentTime < (RECORDER_OPTIONS.lastTouche + RECORDER_OPTIONS.toucheDelta)) return;
    RECORDER_OPTIONS.lastTouche = currentTime;
    RECORDER_OPTIONS.isPlay = !RECORDER_OPTIONS.isPlay;

    if (RECORDER_OPTIONS.isPlay) return recorderPlayer.play();
    return recorderPlayer.stop();
  })

  physicWorld.addBody(recorderBody);
  scene.add(recorderMesh);

  const callInTick = () => {
    recorderPlayer.volume(getVolumeByDistance(recorderBody.position.distanceTo(CAR_DYNAMIC_OPTIONS.oldPosition)))
    copyPositions({
      body: recorderBody,
      mesh: recorderMesh
    })
  }

  return {
    callInTick
  }
}