import * as CANNON from 'cannon-es'
import * as THREE            from "three";
import {copyPositions}       from "../../utils";
import {Howl}                from "howler";

// @ts-ignore
import recorderSongUrl        from "./sounds/recorderSong.mp3"
// @ts-ignore
import recorderModelGltf       from "./models/recorder.gltf"

import {dummyPhysicsMaterial} from "../../physics";
import {CAR_DYNAMIC_OPTIONS}                                                                    from "../car";
import {calInTickProps, DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps} from "../../index";

const recorderPlayer = new Howl({
  src: [recorderSongUrl],
  html5: true,
  volume: 0.5,
  loop: true
});

export const RECORDER_OPTIONS = {
  isPlay: false,
  maxVolume: 0.5,
  lastTouche: 0,
  toucheDelta: 200
}

const getVolumeByDistance = (distance: number) => RECORDER_OPTIONS.maxVolume / distance;

export const recorderObject = (props: objectProps) => {
  const {position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION} = props;
  const {scene, physicWorld, gltfLoader, addToCallInTickStack} = MOST_IMPORTANT_DATA;
  const recorderContainer: THREE.Group = new THREE.Group();
  recorderContainer.name = "recorder";

  // load models
  gltfLoader.load(
    recorderModelGltf,
    model => {
      const recorderModel = model.scene;
      recorderModel.children.forEach(child => child.castShadow = true);
      recorderModel.scale.set(0.14, 0.12, 0.12);
      recorderModel.position.set(0, 0, 0)
      recorderContainer.add(recorderModel);
    }
  )

  // physic
  const recorderShape = new CANNON.Box(new CANNON.Vec3(0.09, 0.12, 0.235));
  const recorderBody = new CANNON.Body({
    mass: 5,
    material: dummyPhysicsMaterial
  })
  recorderBody.addShape(recorderShape)
  recorderBody.allowSleep = true;
  recorderBody.position.set(position.x, position.y + 0.35, position.z)
  recorderBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle)

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
  scene.add(recorderContainer);

  const callInTick: (props: calInTickProps) => void = () => {
    recorderPlayer.volume(getVolumeByDistance(recorderBody.position.distanceTo(CAR_DYNAMIC_OPTIONS.oldPosition)))
    copyPositions({
      body: recorderBody,
      mesh: recorderContainer
    })
  }

  addToCallInTickStack(callInTick)
}