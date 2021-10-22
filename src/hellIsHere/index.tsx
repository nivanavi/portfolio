import React                                                                    from 'react';
import {SceneIgniterContextProvider, useSceneIgniterContext}                    from "../lessons/lessonIgniter";
import * as THREE                                                               from "three";
import {setupCameras, windowSizesType}                          from "./cameras";
import {setupLights}                                                            from "./lights";
import {setupRenderer}                                                          from "./renderer";
import CannonDebugRenderer, {copyPositions, copyPositionType, windowResizeUtil} from "./utils";
import {setupPhysics}             from "./physics";
import dat                        from 'dat.gui';
import {OrbitControls}            from "three/examples/jsm/controls/OrbitControls";
import {recorderObject}           from "./objects/recorder";
import {treeObject}               from "./objects/tree";
import {BRICK_OPTION, wallObject} from "./objects/wall";
import CANNON                     from "cannon";
import {carObject}                from "./objects/car";
import {groundObject}             from "./objects/ground";
import {fireworkObject}           from "./objects/firework";
import {teleportObject}           from "./objects/teleport";
import {lampPostObject}           from "./objects/lampPost";
import {triTable}                 from "three/examples/jsm/objects/MarchingCubes";
import {poolObject}               from "./objects/waterpool";

export const CLEAR_COLOR = "#f5aa58";

const windowSizes: windowSizesType = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const clock = new THREE.Clock();
const gui = new dat.GUI();
const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper(5);
const {physicWorld} = setupPhysics();

const objectsToUpdate: copyPositionType[] = [];

const HellIsHere = () => {
  const {canvas} = useSceneIgniterContext();
  const {camera, callInTickCamera} = setupCameras({windowSizes, scene});
  const {} = setupLights({scene, physicWorld})
  const {renderer} = setupRenderer({canvas, windowSizes});
  renderer.shadowMap.enabled = true;

  const orbitControl = new OrbitControls(camera, canvas);
  // orbitControl.enableDamping = true;
  // const cannonDebugRenderer = new CannonDebugRenderer(scene, physicWorld)

  // add objects start
  // const {callInTick: callInTickRecorder} = recorderObject({physicWorld, scene})
  // const {callInTick: callInTickTree} = treeObject({physicWorld, scene})
  const {callInTick: callInTickWall, createWall} = wallObject({physicWorld, scene})
  const {callInTick: callInTickCar, callInPostStep: callInPostStepCar, chassisBody, carContainer} = carObject({physicWorld, scene})
  const {callInTick: callInTickGround} = groundObject({physicWorld, scene})
  // const {callInTick: callInTickTeleport} = teleportObject({physicWorld, scene, enterPosition: new THREE.Vector3(4, 4, 0.1), exitPosition: new THREE.Vector3(4, 9, 0.1)})
  const {} = lampPostObject({physicWorld, scene, position: new THREE.Vector3(-2, -2, 0)})
  const {} = lampPostObject({physicWorld, scene, position: new THREE.Vector3(-2, 2, 0)})
  const {} = lampPostObject({physicWorld, scene, position: new THREE.Vector3(-2, 6, 0)})
  const {callInTick: callInTickPool} = poolObject({physicWorld, scene, position: new THREE.Vector3(5, 2, 0)})

  // const {callInTick: callInTickFirework} = fireworkObject({physicWorld, scene})
  // add objects end


  const gg = {
    teleport: () => {
      chassisBody.position.set(2, 2, 0.1)
      chassisBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, -1), Math.PI)
    }
  }

  gui.add(gg, "teleport");

  //
  // createWall({
  //   rows: 1,
  //   brickInRows: 1,
  //   position: new CANNON.Vec3(0, -2, 0.1),
  //   isYDirection: true
  // })
  //
  // createWall({
  //   rows: 5,
  //   brickInRows: 10,
  //   position: new CANNON.Vec3(10, 0, 0.1),
  //   isYDirection: true
  // })
  //
  // createWall({
  //   rows: 3,
  //   brickInRows: 5,
  //   position: new CANNON.Vec3(15, 0, 0.1),
  //   isYDirection: true
  // })
  //
  // createWall({
  //   rows: 5,
  //   brickInRows: 10,
  //   position: new CANNON.Vec3(5, 0.1, 0.2)
  // })
  //
  // createWall({
  //   rows: 5,
  //   brickInRows: 10,
  //   position: new CANNON.Vec3(4.8, 0.5, 0.2),
  //   isYDirection: true,
  // })

  physicWorld.addEventListener("postStep", () => {
    callInPostStepCar()
  })

  let oldElapsedTime: number;
  const minDelta: number = 1000 / 70;
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const physicsDeltaTime = Math.round((elapsedTime - oldElapsedTime) * 1000);
    const graphicsDeltaTime = elapsedTime - oldElapsedTime;

    if (physicsDeltaTime < minDelta) return window.requestAnimationFrame(tick);

    // call objects tick start
    callInTickGround();
    // callInTickRecorder();
    // callInTickTree();
    callInTickWall();
    callInTickCar(physicsDeltaTime);
    callInTickPool(graphicsDeltaTime);
    // callInTickTeleport({mesh: carContainer, body: chassisBody});

    // callInTickFirework(chassisMesh);
    // call objects tick end

    callInTickCamera()

    oldElapsedTime = elapsedTime
    // update physics world

    physicWorld.step(1 / 60, physicsDeltaTime, 3);

    // // update tree js
    objectsToUpdate.forEach(objects => copyPositions({...objects}));

    // cannonDebugRenderer.update();
    orbitControl.update();
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