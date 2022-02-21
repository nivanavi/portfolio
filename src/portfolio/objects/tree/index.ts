import * as THREE                         from "three";
import * as CANNON                        from 'cannon-es'
import {copyPositions}                    from "../../utils";
import {dummyPhysicsMaterial}                                                                   from "../../physics";
import {DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps, quaternionType} from "../../index";


// @ts-ignore
import bushModelGltf       from "./models/treeBush.gltf";
// @ts-ignore
import pineModelGltf       from "./models/treePine.gltf";
// @ts-ignore
import treeSummerModelGltf from "./models/treeSummer.gltf";
// @ts-ignore
import treeAutumnModelGltf from "./models/treeAutumn.gltf";
// @ts-ignore
import treeAutumn2ModelGltf from "./models/treeAutumn2.gltf";


type treeTypes = "bush" | "pine" | "treeSummer" | "treeAutumn" | "treeAutumn2"

const trees: treeTypes[] = ["bush", "pine", "treeSummer", "treeAutumn", "treeAutumn2"];

export const getRandomTreeAndRotate = (): {tree: treeTypes, quaternion: quaternionType} => {
  const tree: treeTypes = trees[Math.floor(Math.random() * (trees.length))];
  const angle: number = Math.random() * Math.PI;
  return {
    tree,
    quaternion: {
      vector: new CANNON.Vec3(0, -1, 0),
      angle
    }
  }
}

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
    case "treeAutumn2":
      return treeAutumn2ModelGltf;
  }
}

export const treeObject = (props: objectProps, type: treeTypes) => {
  const {scene, physicWorld, gltfLoader} = MOST_IMPORTANT_DATA;
  const {position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION} = props;
  const treeContainer: THREE.Group = new THREE.Group();
  treeContainer.name = type;

  gltfLoader.load(
    getModelByType(type),
    model => {
      const treeModel = model.scene;
      treeModel.children.forEach(child => child.castShadow = true);
      treeModel.scale.set(0.35, 0.35, 0.35);

      if (type === "bush") treeModel.position.set(0, -0.5, 0)
      if (type === "pine") treeModel.position.set(0, -0.5, 0)
      if (type === "treeSummer") treeModel.position.set(0, -0.5, 0)
      if (type === "treeAutumn") treeModel.position.set(0, -0.5, 0)
      if (type === "treeAutumn2") {
        treeModel.position.set(0, -0.5, 0)
        treeModel.scale.set(0.23, 0.23, 0.23);
      }
      treeContainer.add(treeModel);
    }
  )

  const bushShape = new CANNON.Sphere(0.6);
  const pineShape = new CANNON.Cylinder(0.1, 0.2, 1, 8);
  const threeSummerShape = new CANNON.Cylinder(0.18, 0.25, 1, 8);
  const treeAutumnShape = new CANNON.Cylinder(0.15, 0.2, 1, 8);
  const treeAutumn2Shape = new CANNON.Cylinder(0.19, 0.24, 1, 8);

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
  if (type === "treeAutumn2") {
    treeBody.addShape(treeAutumn2Shape)
    treeBody.position.set(position.x, position.y + 0.5, position.z)
  }

  copyPositions({body: treeBody, mesh: treeContainer})

  physicWorld.addBody(treeBody);
  scene.add(treeContainer);

  treeBody.addEventListener("collide", (ev: any) => {

  })
}