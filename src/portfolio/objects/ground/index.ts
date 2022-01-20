import * as CANNON                           from 'cannon-es'
import {groundPhysicsMaterial}               from "../../physics";
import * as THREE                            from "three";
import {copyPositions}                                                      from "../../utils";
import {DEFAULT_POSITION, MOST_IMPORTANT_DATA, objectProps} from "../../index";

interface groundObjectProps extends objectProps {
  color?: string
}

export const groundObject = (props?: groundObjectProps) => {
  const {position = DEFAULT_POSITION, color = "#3f8e0b"} = props || {};
  const {scene, physicWorld} = MOST_IMPORTANT_DATA;

  const groundMaterial = new THREE.MeshStandardMaterial({color});
  const groundGeometry = new THREE.PlaneBufferGeometry(20000, 20000);
  const groundMesh = new THREE.Mesh(
    groundGeometry,
    groundMaterial
  )
  groundMesh.receiveShadow = true;

  const groundShape = new CANNON.Box(new CANNON.Vec3(20000, 20000, 0.01));
  const groundBody = new CANNON.Body({
    mass: 0,
    material: groundPhysicsMaterial
  })
  groundBody.addShape(groundShape)
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
  groundBody.position.set(position.x, position.y, position.z);
  copyPositions({mesh: groundMesh, body: groundBody});
  groundMesh.position.y = position.y + 0.02
  // scene.fog = new THREE.Fog("green", 10, 15);

  physicWorld.addBody(groundBody);
  scene.add(groundMesh);

}