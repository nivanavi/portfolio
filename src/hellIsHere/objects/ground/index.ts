import {objectProps}           from "../../types";
import CANNON                  from "cannon";
import {groundPhysicsMaterial} from "../../physics";
import * as THREE              from "three";
import {copyPositions}         from "../../utils";

export const groundObject = ({physicWorld, scene}: objectProps) => {
  const groundMaterial = new THREE.MeshStandardMaterial();
  const groundGeometry = new THREE.PlaneBufferGeometry(10, 10);
  const groundMesh = new THREE.Mesh(
    groundGeometry,
    groundMaterial
  )
  groundMesh.receiveShadow = true
  groundMesh.rotation.x = -Math.PI * 0.5


  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({
    mass: 0,
    shape: groundShape,
    material: groundPhysicsMaterial
  })

  physicWorld.addBody(groundBody);
  scene.add(groundMesh);

  const callInTick = () => copyPositions({mesh: groundMesh, body: groundBody})

  return {
    callInTick
  }
}