import * as CANNON from 'cannon-es'
import * as THREE             from "three";
import {copyPositions}        from "../../utils";
import {dummyPhysicsMaterial} from "../../physics";
import {GLTFLoader}           from "three/examples/jsm/loaders/GLTFLoader";

// @ts-ignore
import benchModelGltf                                                                           from "./models/bench.gltf";
import {calInTickProps, DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps} from "../../index";


// const recorderPlayer = new Howl({
//   src: [lampBrokenSong],
//   html5: true,
//   volume: 0.5,
//   loop: false
// });

const gltfLoader = new GLTFLoader();

export const benchObject = (props?: objectProps) => {
  const {position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION} = props || {};
  const {scene, physicWorld, addToCallInTickStack} = MOST_IMPORTANT_DATA;

  const benchContainer: THREE.Group = new THREE.Group();
  benchContainer.name = "bench";

  // graphic
  // load models
  gltfLoader.load(
    benchModelGltf,
    model => {
      const benchModel = model.scene;
      benchModel.scale.set(0.27, 0.27, 0.27);
      benchModel.position.set(0, 0, 0)
      benchContainer.add(benchModel);
    }
  )

  // physic
  const benchShape = new CANNON.Box(new CANNON.Vec3(0.46, 0.28, 0.3));
  const benchBody = new CANNON.Body({
    mass: 5,
    material: dummyPhysicsMaterial
  })
  benchBody.addShape(benchShape)
  benchBody.position.set(position.x, position.y + 0.14, position.z)
  benchBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle)

  copyPositions({
    mesh: benchContainer,
    body: benchBody
  })

  physicWorld.addBody(benchBody);
  scene.add(benchContainer);

  // benchBody.addEventListener("collide", (ev: any) => {
  //   if (ev.contact.getImpactVelocityAlongNormal() < 1.2 || bench_OPTIONS.isAlreadyAnimated || !dolphinAnimation) return;
  //   bench_OPTIONS.isAlreadyAnimated = true;
  //   dolphinAnimation.paused = false;
  //   setTimeout(() => {
  //     dolphinAnimation!.paused = true
  //     bench_OPTIONS.isAlreadyAnimated = false;
  //   }, 683)
  // })



  const callInTick: (props: calInTickProps) => void = () => {
    copyPositions({
      mesh: benchContainer,
      body: benchBody
    })
  }
  addToCallInTickStack(callInTick);
}