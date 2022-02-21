import * as CANNON            from 'cannon-es'
import * as THREE             from "three";
import {copyPositions} from "../../utils";
import {dummyPhysicsMaterial} from "../../physics";

// @ts-ignore
import lampPostWestModelGltf                                    from "./models/lampPostWest.gltf";
import {DEFAULT_POSITION, MOST_IMPORTANT_DATA, objectProps} from "../../index";


export const lampPostWestObject = (props: objectProps) => {
  const {position = DEFAULT_POSITION} = props;
  const {scene, physicWorld, gltfLoader} = MOST_IMPORTANT_DATA;

  const lampPostWestContainer: THREE.Group = new THREE.Group();
  lampPostWestContainer.name = "lampPostWestWest";

  // graphic
  // load models
  gltfLoader.load(
    lampPostWestModelGltf,
    model => {
      const lampPostWestModel = model.scene;
      lampPostWestModel.children.forEach(child => child.castShadow = true);
      lampPostWestModel.scale.set(0.7, 0.7, 0.7);
      lampPostWestModel.position.set(0, 0.4, 0)
      lampPostWestContainer.add(lampPostWestModel);
    }
  )

  // physic
  const lampPostWestShape = new CANNON.Box(new CANNON.Vec3(0.1, 0.7, 0.1));
  const lampPostWestBody = new CANNON.Body({
    mass: 0,
    shape: lampPostWestShape,
    material: dummyPhysicsMaterial
  })
  lampPostWestBody.allowSleep = true;
  lampPostWestBody.position.set(position.x, position.y + 0.7, position.z)

  copyPositions({
    body: lampPostWestBody,
    mesh: lampPostWestContainer
  })
  physicWorld.addBody(lampPostWestBody);
  scene.add(lampPostWestContainer)
}