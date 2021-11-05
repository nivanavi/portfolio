import * as THREE                         from "three";
import * as CANNON                        from 'cannon-es'
import {copyPositions}                    from "../../utils";
import {dummyPhysicsMaterial}                                                   from "../../physics";
import {DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps} from "../../index";
import {GLTFLoader}                                                             from "three/examples/jsm/loaders/GLTFLoader";


// @ts-ignore
import bushModelGltf       from "./models/treeBush.gltf";
// @ts-ignore
import pineModelGltf       from "./models/treePine.gltf";
// @ts-ignore
import treeSummerModelGltf from "./models/treeSummer.gltf";
// @ts-ignore
import treeAutumnModelGltf from "./models/treeAutumn.gltf";


type treeTypes = "bush" | "pine" | "treeSummer" | "treeAutumn"

const getModelByType = (type: treeTypes) => {
  switch (type) {
    case "bush":
      return bushModelGltf;
    case "pine":
      return pineModelGltf;
    case "treeSummer":
      return treeSummerModelGltf;
    case "treeAutumn":
      return treeAutumnModelGltf;
  }
}

const gltfLoader = new GLTFLoader();

export const treeObject = (props: objectProps, type: treeTypes) => {
  const {scene, physicWorld} = MOST_IMPORTANT_DATA;
  const {position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION} = props;
  const treeContainer: THREE.Group = new THREE.Group();
  treeContainer.name = type;

  gltfLoader.load(
    getModelByType(type),
    model => {
      const treeModel = model.scene;
      treeModel.scale.set(0.35, 0.35, 0.35);

      if (type === "bush") treeModel.position.set(0, -0.5, 0)
      if (type === "pine") treeModel.position.set(0, -0.5, 0)
      if (type === "treeSummer") treeModel.position.set(0, -0.5, 0)
      if (type === "treeAutumn") treeModel.position.set(0, -0.5, 0)
      treeContainer.add(treeModel);
    }
  )

  const bushShape = new CANNON.Sphere(0.6);
  const pineShape = new CANNON.Cylinder(0.1, 0.2, 1, 8);
  const threeSummerShape = new CANNON.Cylinder(0.18, 0.25, 1, 8);
  const treeAutumnShape = new CANNON.Cylinder(0.15, 0.2, 1, 8);

  const treeBody = new CANNON.Body({
    mass: 0,
    material: dummyPhysicsMaterial
  })
  treeBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle)

  if (type === "bush") {
    treeBody.addShape(bushShape)
    treeBody.position.set(position.x, position.y + 0.35, position.z)
  }
  if (type === "pine") {
    treeBody.addShape(pineShape)
    treeBody.position.set(position.x, position.y + 0.5, position.z)
  }
  if (type === "treeSummer") {
    treeBody.addShape(threeSummerShape)
    treeBody.position.set(position.x, position.y + 0.5, position.z)
  }
  if (type === "treeAutumn") {
    treeBody.addShape(treeAutumnShape)
    treeBody.position.set(position.x, position.y + 0.5, position.z)
  }

  copyPositions({body: treeBody, mesh: treeContainer})

  physicWorld.addBody(treeBody);
  scene.add(treeContainer);

  treeBody.addEventListener("collide", (ev: any) => {

  })
}