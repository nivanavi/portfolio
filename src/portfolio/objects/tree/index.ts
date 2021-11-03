import * as THREE             from "three";
import * as CANNON            from 'cannon-es'
import {copyPositions}        from "../../utils";
import {dummyPhysicsMaterial} from "../../physics";

export const treeObject = () => {
  const treeMaterial = new THREE.MeshStandardMaterial();
  const treeGeometry = new THREE.BoxBufferGeometry(0.2, 3, 0.2);
  const treeMesh = new THREE.Mesh(
    treeGeometry,
    treeMaterial
  )
  treeMesh.receiveShadow = true
  treeMesh.rotation.x = -Math.PI * 0.5

  const treeShape = new CANNON.Box(new CANNON.Vec3(0.2, 3, 0.2));
  const treeBody = new CANNON.Body({
    mass: 0,
    shape: treeShape,
    material: dummyPhysicsMaterial
  })
  treeBody.position.set(2, 2, 3)
  treeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)

  physicWorld.addBody(treeBody);
  scene.add(treeMesh);

  treeBody.addEventListener("collide", (ev: any) => {
    if (ev.body.mass === 0 || ev.contact.getImpactVelocityAlongNormal() < 1) return;
    // const quaternion = new CANNON.Quaternion();
    // console.log(new CANNON.Vec3(treeBody.position.x + ev.contact.ni.x, treeBody.position.y + ev.contact.ni.y, treeBody.position.z))
    // quaternion.setFromAxisAngle(new CANNON.Vec3(treeBody.position.x + ev.contact.ni.x, treeBody.position.y + ev.contact.ni.y, treeBody.position.z), Math.PI * 0.5)

    // treeBody.quaternion.copy(quaternion);
    // console.log(new CANNON.Vec3(treeBody.position.x + ev.contact.ni.x, treeBody.position.y + ev.contact.ni.y, treeBody.position.z))

    // treeBody.quaternion.set(treeBody.position.x + ev.contact.ni.x, treeBody.position.y + ev.contact.ni.y, treeBody.position.z)
    // console.log(ev.contact);
  })

  const callInTick = () => {
    copyPositions({
      body: treeBody,
      mesh: treeMesh
    })
  }

  return {
    callInTick
  }
}