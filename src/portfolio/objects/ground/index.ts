import * as CANNON                           from 'cannon-es'
import {groundPhysicsMaterial}               from "../../physics";
import * as THREE                            from "three";
import {copyPositions}                                                      from "../../utils";
import {calInTickProps, DEFAULT_POSITION, MOST_IMPORTANT_DATA, objectProps} from "../../index";

export const groundObject = (props?: objectProps) => {
  const {position = DEFAULT_POSITION} = props || {};
  const {scene, physicWorld} = MOST_IMPORTANT_DATA;

  const groundMaterial = new THREE.MeshStandardMaterial({color: "green"});
  const groundGeometry = new THREE.PlaneBufferGeometry(20000, 20000);
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
  groundBody.position.set(position.x, position.y, position.z);
  copyPositions({mesh: groundMesh, body: groundBody});
  // scene.fog = new THREE.Fog("green", 10, 15);

  physicWorld.addBody(groundBody);
  scene.add(groundMesh);

}