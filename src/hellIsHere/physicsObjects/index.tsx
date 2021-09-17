import CANNON       from "cannon";

export const groundPhysicObject = (material: CANNON.Material) => {
  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({
    mass: 0,
    shape: groundShape,
    material
  })
  // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)

  return {
    groundBody,
    groundShape
  }
}

export const CAR_OPTIONS = {
  // chassis
  chassisWidth: 1.02,
  chassisHeight: 1.16,
  chassisDepth: 2.03,
  chassisMass: 20,
  chassisOffset: new CANNON.Vec3(0, 0, 0.41),

  wheelMass: 5,
  wheelFrontOffsetDepth: 0.635,
  wheelBackOffsetDepth: -0.475,
  wheelOffsetWidth: 0.39,

  maxSteeringForce: Math.PI * 0.17,
  steeringSpeed: 0.005,
  accelerationMaxSpeed: 0.055,
  boostAccelerationMaxSpeed: 0.1,
  acceleratingSpeed: 2,
  brakeForce: 0.45,
}

export const WHEEL_OPTIONS = {
  radius: 0.25,
  height: 0.24,
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

const CAR_DYNAMIC_OPTIONS = {
  steering: 0,
  accelerating: 0,
  speed: 0,
  worldForward: new CANNON.Vec3(),
  angle: 0,
  forwardSpeed: 0,
  oldPosition: new CANNON.Vec3(),
  goingForward: true,
  up: false,
  down: false,
  left: false,
  right: false,
  brake: false,
  boost: false,
  upsideDownState: "watching"
}

export const carPhysicObject = (wheelMaterial: CANNON.Material) => {
  const chassisShape = new CANNON.Box(new CANNON.Vec3(CAR_OPTIONS.chassisDepth * 0.5, CAR_OPTIONS.chassisWidth * 0.5, CAR_OPTIONS.chassisHeight * 0.5))
  const chassisBody = new CANNON.Body({mass: CAR_OPTIONS.chassisMass});
  chassisBody.allowSleep = false;
  chassisBody.position.set(0, 0, 2);
  chassisBody.sleep()
  chassisBody.addShape(chassisShape, CAR_OPTIONS.chassisOffset)

  const vehicle = new CANNON.RaycastVehicle({
    chassisBody
  })

  const jump = (toReturn = true, strength = 60) => {
    let worldPosition = chassisBody.position
    worldPosition = worldPosition.vadd(new CANNON.Vec3(toReturn ? 0.08 : 0, 0, 0))
    chassisBody.applyImpulse(new CANNON.Vec3(0, 0, strength), worldPosition)
  }

  const wheels: CANNON.Body[] = [];

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

  vehicle.wheelInfos.forEach(wheel => {
    const shape = new CANNON.Cylinder(wheel.radius || WHEEL_OPTIONS.radius, wheel.radius || WHEEL_OPTIONS.radius, WHEEL_OPTIONS.height, 20)
    const body = new CANNON.Body({mass: CAR_OPTIONS.wheelMass, material: wheelMaterial})
    const quaternion = new CANNON.Quaternion()
    quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI * 0.5)
    body.addShape(shape, new CANNON.Vec3(), quaternion)
    wheels.push(body);
  })

  const callInPostStepCarPhysic = () => {
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
  }

  const callInTickCarPhysic = (delta: number) => {
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
    const currentMaxAcceleration: number = CAR_DYNAMIC_OPTIONS.boost ? CAR_OPTIONS.boostAccelerationMaxSpeed : CAR_OPTIONS.accelerationMaxSpeed;
    // Accelerate up

    if (CAR_DYNAMIC_OPTIONS.up && CAR_DYNAMIC_OPTIONS.down) {
      console.log("burn out");
    } else if (CAR_DYNAMIC_OPTIONS.up) {
      if (CAR_DYNAMIC_OPTIONS.speed < currentMaxAcceleration || !CAR_DYNAMIC_OPTIONS.goingForward) CAR_DYNAMIC_OPTIONS.accelerating = accelerateForce
      else CAR_DYNAMIC_OPTIONS.accelerating = 0
    } else if (CAR_DYNAMIC_OPTIONS.down) {
      if (CAR_DYNAMIC_OPTIONS.speed < currentMaxAcceleration || CAR_DYNAMIC_OPTIONS.goingForward) CAR_DYNAMIC_OPTIONS.accelerating = -accelerateForce
      else CAR_DYNAMIC_OPTIONS.accelerating = 0
    } else CAR_DYNAMIC_OPTIONS.accelerating = 0

    vehicle.applyEngineForce(-CAR_DYNAMIC_OPTIONS.accelerating, WHEEL_OPTIONS.backLeft)
    vehicle.applyEngineForce(-CAR_DYNAMIC_OPTIONS.accelerating, WHEEL_OPTIONS.backRight)

    // uncomment it for 4x4
    // vehicle.applyEngineForce(-CAR_DYNAMIC_OPTIONS.accelerating, WHEEL_OPTIONS.frontLeft)
    // vehicle.applyEngineForce(-CAR_DYNAMIC_OPTIONS.accelerating, WHEEL_OPTIONS.frontRight)

    // TODO BRAKE
    if (CAR_DYNAMIC_OPTIONS.brake) {
      vehicle.setBrake(CAR_OPTIONS.brakeForce, 0)
      vehicle.setBrake(CAR_OPTIONS.brakeForce, 1)
      vehicle.setBrake(CAR_OPTIONS.brakeForce, 2)
      vehicle.setBrake(CAR_OPTIONS.brakeForce, 3)
    } else {
      vehicle.setBrake(0, 0)
      vehicle.setBrake(0, 1)
      vehicle.setBrake(0, 2)
      vehicle.setBrake(0, 3)
    }

  }


  const keyPressHandler = (ev: KeyboardEvent, isPressed: boolean) => {
    CAR_DYNAMIC_OPTIONS.boost = ev.shiftKey
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
      default:
        return;
    }
  }
  window.addEventListener("keypress", ev => keyPressHandler(ev, true))
  window.addEventListener("keyup", ev => keyPressHandler(ev, false))

  return {
    vehicle,
    chassisBody,
    wheels,
    callInTickCarPhysic,
    callInPostStepCarPhysic
  }
}


export const testSpherePhysicObject = () => {
  const sphereShape = new CANNON.Box(new CANNON.Vec3(1, 2, 1));
  const sphereBody = new CANNON.Body({
    mass: 100,
    shape: sphereShape,
    position: new CANNON.Vec3(2, 2, 2)
  })

  return {
    sphereBody,
    sphereShape
  }
}