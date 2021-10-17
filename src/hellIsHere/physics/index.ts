import CANNON from "cannon";

export const groundPhysicsMaterial = new CANNON.Material('floorMaterial')
export const dummyPhysicsMaterial = new CANNON.Material('dummyMaterial')
export const wheelPhysicsMaterial = new CANNON.Material('wheelMaterial')

const groundDummyContactMaterial = new CANNON.ContactMaterial(groundPhysicsMaterial, dummyPhysicsMaterial, { friction: 0.05, restitution: 0.3, contactEquationStiffness: 1000 })
const dummyDummyContactMaterial = new CANNON.ContactMaterial(dummyPhysicsMaterial, dummyPhysicsMaterial, { friction: 0.5, restitution: 0.3, contactEquationStiffness: 1000 })
const groundWheelContactMaterial = new CANNON.ContactMaterial(groundPhysicsMaterial, wheelPhysicsMaterial, { friction: 0.3, restitution: 0.5, contactEquationStiffness: 1000 })

export const setupPhysics = () => {
  const physicWorld = new CANNON.World();
  physicWorld.gravity.set(0, 0, - 2.7)
  physicWorld.broadphase = new CANNON.SAPBroadphase(physicWorld)
  physicWorld.allowSleep = true;
  physicWorld.defaultContactMaterial.friction = 0
  physicWorld.defaultContactMaterial.restitution = 0.2

  physicWorld.addContactMaterial(groundDummyContactMaterial)

  physicWorld.addContactMaterial(dummyDummyContactMaterial)

  physicWorld.addContactMaterial(groundWheelContactMaterial)

  return {
    physicWorld,
    groundPhysicsMaterial,
    dummyPhysicsMaterial,
    wheelPhysicsMaterial
  }
};
