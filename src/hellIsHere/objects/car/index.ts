import * as THREE             from "three";
import CANNON                 from "cannon";
import {objectProps}          from "../../types";
import {wheelPhysicsMaterial} from "../../physics";
import {copyPositions}        from "../../utils";
import {Vector3}              from "three";
import {GLTFLoader}           from "three/examples/jsm/loaders/GLTFLoader";

// models
// @ts-ignore
import delorianModel             from "./models/delorianv2.gltf";
// @ts-ignore
import wheelModel             from "./models/wheel.gltf";


const boxCar = {
  chassisWidth: 1.02,
  chassisHeight: 1.16,
  chassisDepth: 2.03,
  chassisMass: 20,
  chassisOffset: new CANNON.Vec3(0, 0, 0.41),

  wheelMass: 5,
  wheelFrontOffsetDepth: 0.635,
  wheelBackOffsetDepth: -0.475,
  wheelOffsetWidth: 0.39,
}

const delorian = {
  chassisWidth: 1.02,
  chassisHeight: 0.58,
  chassisDepth: 2.03,
  chassisMass: 20,
  chassisOffset: new CANNON.Vec3(0.15, 0, 0.16),

  wheelMass: 5,
  wheelFrontOffsetDepth: 0.735,
  wheelBackOffsetDepth: -0.5,
  wheelOffsetWidth: 0.425,
}

export const CAR_OPTIONS = {
  // chassis

  ...delorian,

  maxSteeringForce: Math.PI * 0.17,
  steeringSpeed: 0.005,
  accelerationMaxSpeed: 0.055,
  boostAccelerationMaxSpeed: 0.1,
  acceleratingSpeed: 2,
  brakeForce: 0.45,
}

export const WHEEL_OPTIONS = {
  radius: 0.17,
  height: 0.1,
  suspensionStiffness: 25,
  suspensionRestLength: 0.1,
  frictionSlip: 5,
  dampingRelaxation: 1.8,
  dampingCompression: 1.5,
  maxSuspensionForce: 100000,
  rollInfluence: 0.01,
  maxSuspensionTravel: 0.3,
  customSlidingRotationalSpeed: -30,
  useCustomSlidingRotationalSpeed: true,
  directionLocal: new CANNON.Vec3(0, 0, -1),
  axleLocal: new CANNON.Vec3(0, 1, 0),
  frontLeft: 0,
  frontRight: 1,
  backLeft: 2,
  backRight: 3,
  chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
}

export const CAR_DYNAMIC_OPTIONS = {
  steering: 0,
  accelerating: 0,
  speed: 0,
  worldForward: new CANNON.Vec3(),
  angle: 0,
  forwardSpeed: 0,
  oldPosition: new CANNON.Vec3(),
  goingForward: true,
  lastStopBurnOut: 0,
  stopBurnOutDelta: 300,
  up: false,
  down: false,
  left: false,
  right: false,
  brake: false,
  boost: false,
  isBurnOut: false,
  upsideDownState: "watching"
}

const gltfLoader = new GLTFLoader();

const wheelsGraphic: THREE.Group[] = [];

const wheelsPhysic: CANNON.Body[] = [];

export const carObject = ({physicWorld, scene}: objectProps) => {
  let chassisMesh: THREE.Group = new THREE.Group();

  // load models
  gltfLoader.load(
    delorianModel,
    model => {
      chassisMesh = model.scene
      chassisMesh.scale.set(0.675, 0.675, 0.675)
      chassisMesh.quaternion.setFromAxisAngle(new Vector3(0, 0, -1), Math.PI * 0.5 )
      chassisMesh.receiveShadow = true;
      scene.add(chassisMesh)
    }
  )

  gltfLoader.load(
    wheelModel,
    model => {
      Array.from({length: 4}).forEach(() => {
        const wheelMesh = model.scene.clone();
        wheelMesh.quaternion.setFromAxisAngle(new Vector3(0, -1, 0), Math.PI * 0.5 )
        wheelMesh.scale.set(0.1, 0.1,0.1)
        scene.add(wheelMesh);
        wheelsGraphic.push(wheelMesh)
      })
    }
  )

  const chassisMaterial = new THREE.MeshStandardMaterial({
    color: "red",
    wireframe: true
  });
  const chassisGeometry = new THREE.BoxBufferGeometry(CAR_OPTIONS.chassisDepth, CAR_OPTIONS.chassisWidth, CAR_OPTIONS.chassisHeight);
  // const chassisMesh = new THREE.Mesh(chassisGeometry, chassisMaterial);

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: "blue"
  });
  const wheelGeometry = new THREE.CylinderBufferGeometry(WHEEL_OPTIONS.radius, WHEEL_OPTIONS.radius, WHEEL_OPTIONS.height, 16);

  const chassisShape = new CANNON.Box(new CANNON.Vec3(CAR_OPTIONS.chassisDepth * 0.5, CAR_OPTIONS.chassisWidth * 0.5, CAR_OPTIONS.chassisHeight * 0.5))
  const chassisBody = new CANNON.Body({mass: CAR_OPTIONS.chassisMass});
  chassisBody.allowSleep = false;
  chassisBody.position.set(0, 0, 6);
  chassisBody.sleep()
  chassisBody.addShape(chassisShape, CAR_OPTIONS.chassisOffset)

  const vehicle = new CANNON.RaycastVehicle({
    chassisBody
  })

// Front left
  vehicle.addWheel({
    ...WHEEL_OPTIONS,
    chassisConnectionPointLocal: new CANNON.Vec3(CAR_OPTIONS.wheelFrontOffsetDepth, CAR_OPTIONS.wheelOffsetWidth, 0)
  })

// Front right
  vehicle.addWheel({
    ...WHEEL_OPTIONS,
    chassisConnectionPointLocal: new CANNON.Vec3(CAR_OPTIONS.wheelFrontOffsetDepth, -CAR_OPTIONS.wheelOffsetWidth, 0)
  })


// Back left
  vehicle.addWheel({
    ...WHEEL_OPTIONS,
    chassisConnectionPointLocal: new CANNON.Vec3(CAR_OPTIONS.wheelBackOffsetDepth, CAR_OPTIONS.wheelOffsetWidth, 0)
  })

// Back right
  vehicle.addWheel({
    ...WHEEL_OPTIONS,
    chassisConnectionPointLocal: new CANNON.Vec3(CAR_OPTIONS.wheelBackOffsetDepth, -CAR_OPTIONS.wheelOffsetWidth, 0)
  })

  vehicle.addToWorld(physicWorld);
  // scene.add(chassisMesh);
  setTimeout(() => chassisBody.wakeUp(), 300)

  vehicle.wheelInfos.forEach(wheel => {
    const shape = new CANNON.Cylinder(wheel.radius || 0, wheel.radius || 0, WHEEL_OPTIONS.height, 20)
    const body = new CANNON.Body({mass: CAR_OPTIONS.wheelMass, material: wheelPhysicsMaterial})
    const quaternion = new CANNON.Quaternion()
    quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI * 0.5)
    body.addShape(shape, new CANNON.Vec3(), quaternion)
    wheelsPhysic.push(body);
  })

  const jump = (toReturn = true, strength = 60) => {
    let worldPosition = chassisBody.position
    worldPosition = worldPosition.vadd(new CANNON.Vec3(toReturn ? 0.08 : 0, 0, 0))
    chassisBody.applyImpulse(new CANNON.Vec3(0, 0, strength), worldPosition)
  }

  const brake = (force: number) => {
    vehicle.setBrake(force, 0)
    vehicle.setBrake(force, 1)
    vehicle.setBrake(force, 2)
    vehicle.setBrake(force, 3)
  }

  const callInPostStep = () => {
    // Update speed
    let positionDelta = new CANNON.Vec3().copy(chassisBody.position)
    positionDelta = positionDelta.vsub(CAR_DYNAMIC_OPTIONS.oldPosition)
    CAR_DYNAMIC_OPTIONS.oldPosition.copy(chassisBody.position)
    CAR_DYNAMIC_OPTIONS.speed = (positionDelta as any).length();

    // Update forward
    const localForward = new CANNON.Vec3(1, 0, 0)
    chassisBody.vectorToWorldFrame(localForward, CAR_DYNAMIC_OPTIONS.worldForward)
    CAR_DYNAMIC_OPTIONS.angle = Math.atan2(CAR_DYNAMIC_OPTIONS.worldForward.y, CAR_DYNAMIC_OPTIONS.worldForward.x)

    CAR_DYNAMIC_OPTIONS.forwardSpeed = CAR_DYNAMIC_OPTIONS.worldForward.dot(positionDelta)
    CAR_DYNAMIC_OPTIONS.goingForward = CAR_DYNAMIC_OPTIONS.forwardSpeed > 0

    // slow stop
    if (!CAR_DYNAMIC_OPTIONS.up && !CAR_DYNAMIC_OPTIONS.down) {
      let slowDownForce = CAR_DYNAMIC_OPTIONS.worldForward.clone();
      if (CAR_DYNAMIC_OPTIONS.goingForward) slowDownForce = slowDownForce.negate()
      slowDownForce = slowDownForce.scale((chassisBody.velocity as any).length() * 0.1)
      chassisBody.applyImpulse(slowDownForce, chassisBody.position)
    }

    // TODO upside down
    let upsideDownTimeout;
    const localUp = new CANNON.Vec3(0, 0, 1);
    const worldUp = new CANNON.Vec3();
    chassisBody.vectorToWorldFrame(localUp, worldUp);

    if (worldUp.dot(localUp) < 0.5) {
      if (CAR_DYNAMIC_OPTIONS.upsideDownState === "watching") {
        CAR_DYNAMIC_OPTIONS.upsideDownState = "pending"
        upsideDownTimeout = window.setTimeout(() => {
          CAR_DYNAMIC_OPTIONS.upsideDownState = "turning"
          jump()
          upsideDownTimeout = window.setTimeout(() => {
            CAR_DYNAMIC_OPTIONS.upsideDownState = "watching"
          }, 1000)
        }, 1000)
      }
    } else {
      if (CAR_DYNAMIC_OPTIONS.upsideDownState === "pending") {
        CAR_DYNAMIC_OPTIONS.upsideDownState = "watching"
        window.clearTimeout(upsideDownTimeout)
      }
    }

    // update wheels
    vehicle.wheelInfos.forEach((wheel, index) => {
      vehicle.updateWheelTransform(index);
      const transform = (vehicle.wheelInfos[index] as any).worldTransform;
      wheelsPhysic[index].position.copy(transform.position)
      wheelsPhysic[index].quaternion.copy(transform.quaternion)
    })
  }


  let rotation = 0;
  const callInTick = (delta: number) => {
    // update
    if (chassisMesh) copyPositions({mesh: chassisMesh, body: chassisBody})

    wheelsPhysic.forEach((wheel, index) => {
      copyPositions({mesh: wheelsGraphic[index], body: wheel})
      if (!CAR_DYNAMIC_OPTIONS.isBurnOut) return;
      if (![WHEEL_OPTIONS.backLeft, WHEEL_OPTIONS.backRight].includes(index)) return;
      rotation = rotation + 8;
      wheelsGraphic[index].rotateOnAxis(new Vector3(0, 1, 0), rotation)
    })

    // TODO STEERING
    const steerForce = delta * CAR_OPTIONS.steeringSpeed
    // Steer right and left
    if (CAR_DYNAMIC_OPTIONS.right && CAR_DYNAMIC_OPTIONS.left) {
      if (Math.abs(CAR_DYNAMIC_OPTIONS.steering) > steerForce) CAR_DYNAMIC_OPTIONS.steering -= steerForce * Math.sign(CAR_DYNAMIC_OPTIONS.steering)
      else CAR_DYNAMIC_OPTIONS.steering = 0
    }
    // steer right
    else if (CAR_DYNAMIC_OPTIONS.right) CAR_DYNAMIC_OPTIONS.steering += steerForce
    // steer left
    else if (CAR_DYNAMIC_OPTIONS.left) CAR_DYNAMIC_OPTIONS.steering -= steerForce

    // Steer center
    else {
      if (Math.abs(CAR_DYNAMIC_OPTIONS.steering) > steerForce) CAR_DYNAMIC_OPTIONS.steering -= steerForce * Math.sign(CAR_DYNAMIC_OPTIONS.steering)
      else CAR_DYNAMIC_OPTIONS.steering = 0
    }

    // check if current steering is greatest than max steering and if its true set max steering
    if (Math.abs(CAR_DYNAMIC_OPTIONS.steering) > CAR_OPTIONS.maxSteeringForce) CAR_DYNAMIC_OPTIONS.steering = Math.sign(CAR_DYNAMIC_OPTIONS.steering) * CAR_OPTIONS.maxSteeringForce

    // Update wheels steering
    vehicle.setSteeringValue(-CAR_DYNAMIC_OPTIONS.steering, WHEEL_OPTIONS.frontLeft)
    vehicle.setSteeringValue(-CAR_DYNAMIC_OPTIONS.steering, WHEEL_OPTIONS.frontRight)

    // TODO ACCELERATE
    const accelerateForce = delta * CAR_OPTIONS.acceleratingSpeed
    const currentMaxSpeed: number = CAR_DYNAMIC_OPTIONS.boost ? CAR_OPTIONS.boostAccelerationMaxSpeed : CAR_OPTIONS.accelerationMaxSpeed;
    // Accelerate up

    if (CAR_DYNAMIC_OPTIONS.up && (CAR_DYNAMIC_OPTIONS.down || CAR_DYNAMIC_OPTIONS.brake)) {
      CAR_DYNAMIC_OPTIONS.isBurnOut = true;
      CAR_DYNAMIC_OPTIONS.accelerating = 0;
      vehicle.setBrake(0.2, WHEEL_OPTIONS.frontLeft)
      vehicle.setBrake(0.2, WHEEL_OPTIONS.frontRight)
      vehicle.setBrake(1, WHEEL_OPTIONS.backLeft)
      vehicle.setBrake(1, WHEEL_OPTIONS.backRight)
      return;
    } else if (CAR_DYNAMIC_OPTIONS.up) {
      // CAR_DYNAMIC_OPTIONS.isBurnOut = false;
      if (CAR_DYNAMIC_OPTIONS.speed < currentMaxSpeed || !CAR_DYNAMIC_OPTIONS.goingForward) CAR_DYNAMIC_OPTIONS.accelerating = accelerateForce
      else CAR_DYNAMIC_OPTIONS.accelerating = 0
    } else if (CAR_DYNAMIC_OPTIONS.down) {
      // CAR_DYNAMIC_OPTIONS.isBurnOut = false;
      if (CAR_DYNAMIC_OPTIONS.speed < currentMaxSpeed || CAR_DYNAMIC_OPTIONS.goingForward) CAR_DYNAMIC_OPTIONS.accelerating = -accelerateForce
      else CAR_DYNAMIC_OPTIONS.accelerating = 0
    } else {
      // CAR_DYNAMIC_OPTIONS.isBurnOut = false;
      CAR_DYNAMIC_OPTIONS.accelerating = 0
    }
    const currentTime = Date.now();
    if (CAR_DYNAMIC_OPTIONS.isBurnOut) CAR_DYNAMIC_OPTIONS.lastStopBurnOut = currentTime;
    if (CAR_DYNAMIC_OPTIONS.isBurnOut) CAR_DYNAMIC_OPTIONS.isBurnOut = false;

    if (currentTime < CAR_DYNAMIC_OPTIONS.lastStopBurnOut + CAR_DYNAMIC_OPTIONS.stopBurnOutDelta) CAR_DYNAMIC_OPTIONS.accelerating = CAR_DYNAMIC_OPTIONS.accelerating * 2;

    vehicle.applyEngineForce(-CAR_DYNAMIC_OPTIONS.accelerating, WHEEL_OPTIONS.backLeft)
    vehicle.applyEngineForce(-CAR_DYNAMIC_OPTIONS.accelerating, WHEEL_OPTIONS.backRight)

    // uncomment it for 4x4
    // vehicle.applyEngineForce(-CAR_DYNAMIC_OPTIONS.accelerating, WHEEL_OPTIONS.frontLeft)
    // vehicle.applyEngineForce(-CAR_DYNAMIC_OPTIONS.accelerating, WHEEL_OPTIONS.frontRight)

    // TODO BRAKE
    if (CAR_DYNAMIC_OPTIONS.brake) {
      brake(CAR_OPTIONS.brakeForce)
    } else {
      brake(0)
    }
  }

  chassisBody.addEventListener("collide", (ev: any) => {
    // console.log(ev);
    // if (!ev?.body?.material) return;
    // if (ev.body.material.name === "floorMaterial") return;
    // ev.body.quaternion.x = 0.5;
  })

  const keyPressHandler = (ev: KeyboardEvent, isPressed: boolean) => {
    switch (ev.code) {
      case "KeyW":
        return CAR_DYNAMIC_OPTIONS.up = isPressed;
      case "KeyA":
        return CAR_DYNAMIC_OPTIONS.left = isPressed;
      case "KeyS":
        return CAR_DYNAMIC_OPTIONS.down = isPressed;
      case "KeyD":
        return CAR_DYNAMIC_OPTIONS.right = isPressed;
      case "Space":
        return CAR_DYNAMIC_OPTIONS.brake = isPressed;
      case "ShiftLeft":
        return CAR_DYNAMIC_OPTIONS.boost = isPressed;
      default:
        return;
    }
  }
  window.addEventListener("keydown", ev => keyPressHandler(ev, true))
  window.addEventListener("keyup", ev => keyPressHandler(ev, false))

  return {
    callInTick,
    callInPostStep,
    chassisBody,
    chassisMesh
  }
}