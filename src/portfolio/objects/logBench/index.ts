import * as CANNON from 'cannon-es'
import * as THREE             from "three";
import {copyPositions}        from "../../utils";
import {dummyPhysicsMaterial} from "../../physics";

// @ts-ignore
import logBenchModelGltf                                                                           from "./models/logBench.gltf";
import {calInTickProps, DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps} from "../../index";

export const logBenchObject = (props?: objectProps) => {
  const {position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION} = props || {};
  const {scene, physicWorld, addToCallInTickStack, gltfLoader} = MOST_IMPORTANT_DATA;

  const logBenchContainer: THREE.Group = new THREE.Group();
  logBenchContainer.name = "logBench";

  // load models
  gltfLoader.load(
    logBenchModelGltf,
    model => {
      const logBenchModel = model.scene;
      logBenchModel.children.forEach(child => child.castShadow = true);
      logBenchModel.scale.set(0.15, 0.15, 0.15);
      logBenchContainer.add(logBenchModel);
    }
  )

  // physic
  const logBenchShape = new CANNON.Box(new CANNON.Vec3(0.2, 0.12, 0.9));
  const logBenchBody = new CANNON.Body({
    mass: 25,
    material: dummyPhysicsMaterial
  })
  logBenchBody.addShape(logBenchShape)
  logBenchBody.position.set(position.x, position.y + 0.28, position.z)
  logBenchBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle)

  copyPositions({
    mesh: logBenchContainer,
    body: logBenchBody
  })

  physicWorld.addBody(logBenchBody);
  scene.add(logBenchContainer);

  // logBenchBody.addEventListener("collide", (ev: any) => {
  //   if (ev.contact.getImpactVelocityAlongNormal() < 1.2 || logBench_OPTIONS.isAlreadyAnimated || !dolphinAnimation) return;
  //   logBench_OPTIONS.isAlreadyAnimated = true;
  //   dolphinAnimation.paused = false;
  //   setTimeout(() => {
  //     dolphinAnimation!.paused = true
  //     logBench_OPTIONS.isAlreadyAnimated = false;
  //   }, 683)
  // })



  const callInTick: (props: calInTickProps) => void = () => {
    copyPositions({
      mesh: logBenchContainer,
      body: logBenchBody
    })
  }
  addToCallInTickStack(callInTick);
}