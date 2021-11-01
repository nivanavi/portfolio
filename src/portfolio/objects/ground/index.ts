import * as CANNON from 'cannon-es'
import {groundPhysicsMaterial} from "../../physics";
import * as THREE              from "three";
import {copyPositions}                       from "../../utils";
import {calInTickProps, MOST_IMPORTANT_DATA} from "../../index";

export const groundObject = () => {
  const {scene, physicWorld, addToCallInTickStack} = MOST_IMPORTANT_DATA;

  const groundMaterial = new THREE.MeshStandardMaterial();
  const groundGeometry = new THREE.PlaneBufferGeometry(20, 20);
  const groundMesh = new THREE.Mesh(
    groundGeometry,
    groundMaterial
  )
  groundMesh.receiveShadow = true;

  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({
    mass: 0,
    material: groundPhysicsMaterial
  })
  groundBody.addShape(groundShape)
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
  // scene.fog = new THREE.Fog(CLEAR_COLOR, 10, 15);

  physicWorld.addBody(groundBody);
  scene.add(groundMesh);

  const callInTick: (props: calInTickProps) => void = () => copyPositions({mesh: groundMesh, body: groundBody})
  addToCallInTickStack(callInTick);
}