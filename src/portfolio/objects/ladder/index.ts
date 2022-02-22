import * as CANNON from 'cannon-es'
import * as THREE             from "three";
import {copyPositions}        from "../../utils";
import {dummyPhysicsMaterial} from "../../physics";

// @ts-ignore
import ladderModelGltf                                                                           from "./models/ladder.gltf";
import {calInTickProps, DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps} from "../../index";

export const ladderObject = (props?: objectProps) => {
  const {position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION} = props || {};
  const {scene, physicWorld, addToCallInTickStack, gltfLoader} = MOST_IMPORTANT_DATA;

  const ladderContainer: THREE.Group = new THREE.Group();
  ladderContainer.name = "ladder";

  // load models
  gltfLoader.load(
    ladderModelGltf,
    model => {
      const ladderModel = model.scene;
      ladderModel.children.forEach(child => child.castShadow = true);
      ladderModel.scale.set(0.27, 0.27, 0.27);
      ladderModel.position.set(0, 0, 0)
      ladderContainer.add(ladderModel);
    }
  )

  // physic
  const ladderShape = new CANNON.Box(new CANNON.Vec3(0.04, 0.77, 0.2));
  const ladderBody = new CANNON.Body({
    mass: 5,
    material: dummyPhysicsMaterial
  })
  ladderBody.addShape(ladderShape)
  ladderBody.position.set(position.x, position.y + 1, position.z)
  ladderBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle)
  // ladderBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, -1, 0), 1.5)

  copyPositions({
    mesh: ladderContainer,
    body: ladderBody
  })

  physicWorld.addBody(ladderBody);
  scene.add(ladderContainer);

  const callInTick: (props: calInTickProps) => void = () => {
    copyPositions({
      mesh: ladderContainer,
      body: ladderBody
    })
  }
  addToCallInTickStack(callInTick);
}