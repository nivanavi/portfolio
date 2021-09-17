import React                                                               from 'react';
import {SceneIgniterContextProvider, useSceneIgniterContext}               from "../lessons/lessonIgniter";
import * as THREE                                                          from "three";
import CANNON                                          from "cannon";
import {CAMERA_OPTIONS, setupCameras, windowSizesType} from "./cameras";
import {setupLights}                                   from "./lights";
import {setupRenderer}                                                          from "./renderer";
import CannonDebugRenderer, {copyPositions, copyPositionType, windowResizeUtil} from "./utils";
import {carGraphicsObject, groundGraphicsObject, testSphereGraphicsObject}        from "./graphicObjects";
import {CAR_OPTIONS, carPhysicObject, groundPhysicObject, testSpherePhysicObject} from "./physicsObjects";
import {setupPhysics}                                                             from "./physics";
import dat                                                                 from 'dat.gui';
import {OrbitControls}                                                     from "three/examples/jsm/controls/OrbitControls";

const windowSizes: windowSizesType = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const clock = new THREE.Clock();
const gui = new dat.GUI();
const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper(5);
const {physicsWorld, wheelPhysicsMaterial, groundPhysicsMaterial, dummyPhysicsMaterial} = setupPhysics();

const objectsToUpdate: copyPositionType[] = [];

const HellIsHere = () => {
  const {canvas} = useSceneIgniterContext();
  const {camera} = setupCameras({windowSizes});
  const {ambientLight, directionalLight} = setupLights()
  const {renderer} = setupRenderer({canvas, windowSizes});
  const cameraHelper = new THREE.CameraHelper(camera);
  scene.add(ambientLight, directionalLight, axesHelper, cameraHelper);

  // const orbitControl = new OrbitControls(camera, canvas);
  // orbitControl.enableDamping = true;

  const cannonDebugRenderer = new CannonDebugRenderer(scene, physicsWorld)

  const {groundMesh} = groundGraphicsObject();
  const {groundBody} = groundPhysicObject(groundPhysicsMaterial);

  const {chassisMesh, createWheelMesh} = carGraphicsObject();
  const {chassisBody, vehicle, wheels, callInTickCarPhysic, callInPostStepCarPhysic} = carPhysicObject(wheelPhysicsMaterial);

  const {sphereBody} = testSpherePhysicObject();
  const {sphereMesh} = testSphereGraphicsObject()

  const setupTestSphere = () => {
    physicsWorld.addBody(sphereBody);
    scene.add(sphereMesh);
    copyPositions({
      body: sphereBody,
      mesh: sphereMesh
    });

    objectsToUpdate.push({
      mesh: sphereMesh,
      body: sphereBody
    })
  }

  gui.add(CAMERA_OPTIONS.position, "x").min(-10).max(10).step(1)
  gui.add(CAMERA_OPTIONS.position, "y").min(-10).max(10).step(1)
  gui.add(CAMERA_OPTIONS.position, "z").min(-10).max(10).step(1)


  // gui.add(CAMERA_OPTIONS.rotation, "x").min(-10).max(10).step(0.01).name("rotation x")
  // gui.add(CAMERA_OPTIONS.rotation, "y").min(-10).max(10).step(0.01).name("rotation y")
  // gui.add(CAMERA_OPTIONS.rotation, "z").min(-10).max(10).step(0.01).name("rotation z")
  // gui.add(CAMERA_OPTIONS, "rotation").min(-10).max(10).step(0.01).name("на что умнож")

  const setupGround = () => {
    physicsWorld.addBody(groundBody);
    copyPositions({body: groundBody, mesh: groundMesh});
    scene.add(groundMesh);
    objectsToUpdate.push({
      mesh: groundMesh,
      body: groundBody
    })
  }

  const setupCar = () => {
    vehicle.addToWorld(physicsWorld);
    scene.add(chassisMesh);
    setTimeout(() => chassisBody.wakeUp(), 300)

    copyPositions({body: chassisBody, mesh: chassisMesh});

    objectsToUpdate.push({
      mesh: chassisMesh,
      body: chassisBody,
      positionOffset: CAR_OPTIONS.chassisOffset
    })

    wheels.forEach(wheelBody => {
      const wheelMesh = createWheelMesh();
      copyPositions({body: wheelBody, mesh: wheelMesh});
      scene.add(wheelMesh);

      objectsToUpdate.push({
        mesh: wheelMesh,
        body: wheelBody
      })
    })
  }

  physicsWorld.addEventListener("postStep", () => {
    callInPostStepCarPhysic()
    vehicle.wheelInfos.forEach((wheel, index) => {
      vehicle.updateWheelTransform(index);
      const transform = (vehicle.wheelInfos[index] as any).worldTransform;
      wheels[index].position.copy(transform.position)
      wheels[index].quaternion.copy(transform.quaternion)
    })
  })

  let oldElapsedTime: number;
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = Math.round((elapsedTime - oldElapsedTime) * 1000);
    oldElapsedTime = elapsedTime
    // update physics world
    physicsWorld.step(1 / 60, deltaTime, 3);

    callInTickCarPhysic(deltaTime);

    camera.lookAt(chassisMesh.position)

    // // update three js
    objectsToUpdate.forEach(objects => copyPositions({...objects}));

    cannonDebugRenderer.update();
    // orbitControl.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  }

  const windowResizeHandler = React.useCallback(() => {
    windowResizeUtil({
      windowSizes,
      renderer,
      callback: () => {
        camera.aspect = windowSizes.width / windowSizes.height;
        camera.updateProjectionMatrix();
      }
    })
  }, [renderer, camera]);


  tick();
  // for setup objects
  React.useEffect(() => {
    setupGround();
    setupCar();
    setupTestSphere();
  }, [setupGround, setupCar, setupTestSphere])

  React.useEffect(() => {
    window.addEventListener("resize", windowResizeHandler)
    return () => {
      window.removeEventListener("resize", windowResizeHandler)
    }
  }, [windowResizeHandler])

  return null;
};

export const HellIsHereIgniter: React.FC = () => {
  return (
    <SceneIgniterContextProvider>
      <HellIsHere/>
    </SceneIgniterContextProvider>
  )
}