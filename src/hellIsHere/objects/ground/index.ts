import {objectProps}           from "../../types";
import CANNON                  from "cannon";
import {groundPhysicsMaterial} from "../../physics";
import * as THREE              from "three";
import {copyPositions}         from "../../utils";
import {CLEAR_COLOR}           from "../../index";

export const groundObject = ({physicWorld, scene}: objectProps) => {
  const groundMaterial = new THREE.MeshStandardMaterial({color: CLEAR_COLOR});
  const groundGeometry = new THREE.PlaneBufferGeometry(20, 20);
  const groundMesh = new THREE.Mesh(
    groundGeometry,
    groundMaterial
  )
  groundMesh.receiveShadow = true

  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({
    mass: 0,
    shape: groundShape,
    material: groundPhysicsMaterial
  })

  // scene.fog = new THREE.Fog(CLEAR_COLOR, 10, 15);

  physicWorld.addBody(groundBody);
  scene.add(groundMesh);

  const callInTick = () => copyPositions({mesh: groundMesh, body: groundBody})

  return {
    callInTick
  }
}