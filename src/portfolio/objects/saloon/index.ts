import * as CANNON from 'cannon-es'
import * as THREE             from "three";
import {copyPositions}        from "../../utils";
import {dummyPhysicsMaterial} from "../../physics";

// @ts-ignore
import saloonModelGltf                                                                           from "./models/saloon.gltf";
import {DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps} from "../../index";

export const saloonObject = (props?: objectProps) => {
  const {position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION} = props || {};
  const {scene, physicWorld, gltfLoader} = MOST_IMPORTANT_DATA;

  const saloonContainer: THREE.Group = new THREE.Group();
  saloonContainer.name = "saloon";

  // load models
  gltfLoader.load(
    saloonModelGltf,
    model => {
      const saloonModel = model.scene;
      saloonModel.children.forEach(child => child.castShadow = true);
      saloonModel.scale.set(0.25, 0.25, 0.25);
      saloonModel.position.set(-0.55, 0.245, 0)
      saloonContainer.add(saloonModel);
    }
  )

  // physic
  const saloonShape = new CANNON.Box(new CANNON.Vec3(1.62, 1, 2.1));
  const saloonBody = new CANNON.Body({
    mass: 0,
    material: dummyPhysicsMaterial
  })
  saloonBody.addShape(saloonShape)
  saloonBody.position.set(position.x, position.y + 1.05, position.z)
  saloonBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle)

  copyPositions({
    mesh: saloonContainer,
    body: saloonBody
  })

  physicWorld.addBody(saloonBody);
  scene.add(saloonContainer);
}