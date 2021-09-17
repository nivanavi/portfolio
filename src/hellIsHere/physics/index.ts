import CANNON from "cannon";

export const setupPhysics = () => {
  const physicsWorld = new CANNON.World();
  physicsWorld.gravity.set(0, 0, - 3.25)
  physicsWorld.broadphase = new CANNON.SAPBroadphase(physicsWorld)
  physicsWorld.allowSleep = true;
  physicsWorld.defaultContactMaterial.friction = 0
  physicsWorld.defaultContactMaterial.restitution = 0.2

  const groundPhysicsMaterial = new CANNON.Material('floorMaterial')
  const dummyPhysicsMaterial = new CANNON.Material('dummyMaterial')
  const wheelPhysicsMaterial = new CANNON.Material('wheelMaterial')

  const groundDummyContactMaterial = new CANNON.ContactMaterial(groundPhysicsMaterial, dummyPhysicsMaterial, { friction: 0.05, restitution: 0.3, contactEquationStiffness: 1000 })
  physicsWorld.addContactMaterial(groundDummyContactMaterial)

  const dummyDummyContactMaterial = new CANNON.ContactMaterial(dummyPhysicsMaterial, dummyPhysicsMaterial, { friction: 0.5, restitution: 0.3, contactEquationStiffness: 1000 })
  physicsWorld.addContactMaterial(dummyDummyContactMaterial)

  const groundWheelContactMaterial = new CANNON.ContactMaterial(groundPhysicsMaterial, wheelPhysicsMaterial, { friction: 0.3, restitution: 0.5, contactEquationStiffness: 1000 })
  physicsWorld.addContactMaterial(groundWheelContactMaterial)

  return {
    physicsWorld,
    groundPhysicsMaterial,
    dummyPhysicsMaterial,
    wheelPhysicsMaterial
  }
};
