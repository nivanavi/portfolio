import * as CANNON from 'cannon-es'
import * as THREE             from "three";
import {copyPositions}        from "../../utils";
import {dummyPhysicsMaterial} from "../../physics";

// @ts-ignore
import heyModelGltf                                                                           from "./models/hey.gltf";
import {calInTickProps, DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps} from "../../index";

export const heyObject = (props?: objectProps) => {
  const {position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION} = props || {};
  const {scene, physicWorld, addToCallInTickStack, gltfLoader} = MOST_IMPORTANT_DATA;

  const heyContainer: THREE.Group = new THREE.Group();
  heyContainer.name = "hey";

  // load models
  gltfLoader.load(
    heyModelGltf,
    model => {
      const heyModel = model.scene;
      heyModel.children.forEach(child => child.castShadow = true);
      heyModel.scale.set(0.17, 0.17, 0.17);
      heyModel.position.set(0, 0, 0)
      heyContainer.add(heyModel);
    }
  )

  // physic
  const heyShape = new CANNON.Box(new CANNON.Vec3(0.45, 0.25, 0.25));
  const heyBody = new CANNON.Body({
    mass: 3,
    material: dummyPhysicsMaterial
  })
  heyBody.allowSleep = true;
  heyBody.sleepSpeedLimit = 0.01;
  heyBody.addShape(heyShape)
  heyBody.position.set(position.x, position.y + 0.28, position.z)
  heyBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle)

  copyPositions({
    mesh: heyContainer,
    body: heyBody
  })

  physicWorld.addBody(heyBody);
  scene.add(heyContainer);

  const callInTick: (props: calInTickProps) => void = () => {
    copyPositions({
      mesh: heyContainer,
      body: heyBody
    })
  }
  addToCallInTickStack(callInTick);
}