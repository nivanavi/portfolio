import CANNON                 from "cannon";
import * as THREE             from "three";
import {objectProps}          from "../../types";
import {copyPositions}        from "../../utils";
import {dummyPhysicsMaterial} from "../../physics";
import {GLTFLoader}           from "three/examples/jsm/loaders/GLTFLoader";

// @ts-ignore
import benchModelGltf                        from "./models/bench.gltf";
import {calInTickProps, MOST_IMPORTANT_DATA} from "../../index";


// const recorderPlayer = new Howl({
//   src: [lampBrokenSong],
//   html5: true,
//   volume: 0.5,
//   loop: false
// });

interface benchProps extends objectProps {
  position: THREE.Vector3
}

const gltfLoader = new GLTFLoader();

export const benchObject = ({position}: benchProps) => {
  const {scene, physicWorld, addToCallInTickStack} = MOST_IMPORTANT_DATA;

  const benchContainer: THREE.Group = new THREE.Group();
  benchContainer.name = "bench";

  // graphic
  // load models
  gltfLoader.load(
    benchModelGltf,
    model => {
      const benchModel = model.scene;
      benchModel.scale.set(0.35, 0.35, 0.35);
      benchModel.position.set(0, 0, -0.2)
      benchContainer.add(benchModel);
    }
  )

  // physic
  const benchShape = new CANNON.Cylinder(3, 3, 0.2, 14);
  const benchBody = new CANNON.Body({
    mass: 5,
    shape: benchShape,
    material: dummyPhysicsMaterial
  })
  benchBody.allowSleep = true;
  benchBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, -1, 0),  Math.PI * 0.5);
  benchBody.position.set(position.x, position.y, position.z + 0.2)
  benchBody.allowSleep = true;

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