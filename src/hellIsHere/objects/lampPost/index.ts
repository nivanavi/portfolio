import CANNON                from "cannon";
import * as THREE            from "three";
import {objectProps}         from "../../types";
import {copyPositions}       from "../../utils";
import {Howl}                from "howler";
import {dummyPhysicsMaterial} from "../../physics";
import {GLTFLoader}           from "three/examples/jsm/loaders/GLTFLoader";

// @ts-ignore
import lampPostModelGltf          from "./models/lampPost.gltf";

// const recorderPlayer = new Howl({
//   src: [recorderSongUrl],
//   html5: true,
//   volume: 0.5,
//   loop: true
// });

const gltfLoader = new GLTFLoader();

export const lampPostObject = ({physicWorld, scene}: objectProps) => {
  const lampPostContainer: THREE.Group = new THREE.Group();
  // graphic
  // load models
  gltfLoader.load(
    lampPostModelGltf,
    model => {
      const lampPostModel = model.scene;
      lampPostModel.scale.set(0.25, 0.25, 0.25)
      // carModel.receiveShadow = true;
      // chassisMesh.add(model.scene)
      lampPostContainer.add(lampPostModel);
    }
  )

  // physic
  const lampPostShape = new CANNON.Box(new CANNON.Vec3(0.2, 0.2, 2));
  const lampPostBody = new CANNON.Body({
    mass: 0,
    shape: lampPostShape,
    material: dummyPhysicsMaterial
  })
  // lampPostBody.allowSleep = true;
  lampPostBody.position.set(-2, -2, 0)
  // lampPostBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)

  lampPostBody.addEventListener("collide", (ev: any) => {

  })

  copyPositions({
    body: lampPostBody,
    mesh: lampPostContainer
  })
  physicWorld.addBody(lampPostBody);
  scene.add(lampPostContainer)

  const callInTick = () => {

  }

  return {
    callInTick
  }
}