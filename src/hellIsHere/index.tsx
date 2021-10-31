import React                                                 from 'react';
import {SceneIgniterContextProvider, useSceneIgniterContext} from "../lessons/lessonIgniter";
import * as THREE                                            from "three";
import {setupCameras}                                        from "./cameras";
import {setupLights}                                         from "./lights";
import {setupRenderer}                                       from "./renderer";
import CannonDebugRenderer, {windowResizeUtil}               from "./utils";
import {setupPhysics}                                        from "./physics";
import dat                                                   from 'dat.gui';
import {OrbitControls}                                       from "three/examples/jsm/controls/OrbitControls";
import {wallObject}                                          from "./objects/wall";
import CANNON                                                from "cannon";
import {carObject}                                           from "./objects/car";
import {groundObject}                                        from "./objects/ground";
import {lampPostObject}                                      from "./objects/lampPost";
import {poolObject}                                          from "./objects/waterpool";
import {benchObject}                                         from "./objects/bench";

export type windowSizesType = {
  width: number
  height: number
}

export type calInTickProps = {
  physicDelta: number
  graphicDelta: number
}
type callInTick = (props: calInTickProps) => void;
type callInPostStep = () => void;

type mostImportantData = {
  scene: THREE.Scene
  physicWorld: CANNON.World
  gui: dat.GUI
  windowSizes: windowSizesType
  clock: THREE.Clock
  addToCallInTickStack: (callInTick: callInTick) => void
  addToCallInPostStepStack: (callInTick: callInPostStep) => void
}

const callInTickStack: callInTick[] = [];
const callInPostStepStack: callInPostStep[] = [];
export const MOST_IMPORTANT_DATA: mostImportantData = {
  scene: new THREE.Scene(),
  physicWorld: setupPhysics().physicWorld,
  gui: new dat.GUI(),
  windowSizes: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  clock: new THREE.Clock(),
  addToCallInTickStack: (callInTick: callInTick) => callInTickStack.push(callInTick),
  addToCallInPostStepStack: (callInPostStep: callInPostStep) => callInPostStepStack.push(callInPostStep)
}

const {scene, physicWorld, windowSizes, clock} = MOST_IMPORTANT_DATA;

const HellIsHere = () => {
  const {canvas} = useSceneIgniterContext();
  const {camera} = setupCameras();
  setupLights()
  const {renderer} = setupRenderer({canvas});
  renderer.shadowMap.enabled = true;

  const orbitControl = new OrbitControls(camera, canvas);
  // orbitControl.enableDamping = true;
  const cannonDebugRenderer = new CannonDebugRenderer(scene, physicWorld)

  // add objects start
  // const {callInTick: callInTickRecorder} = recorderObject({physicWorld, scene})
  // const {callInTick: callInTickTree} = treeObject({physicWorld, scene})
  const {createWall} = wallObject()
  carObject()
  groundObject()
  // const {callInTick: callInTickTeleport} = teleportObject({physicWorld, scene, enterPosition: new THREE.Vector3(4, 4, 0.1), exitPosition: new THREE.Vector3(4, 9, 0.1)})
  lampPostObject({position: new THREE.Vector3(-2, -2, 0)})
  lampPostObject({position: new THREE.Vector3(-2, 2, 0)})
  lampPostObject({position: new THREE.Vector3(-2, 6, 0)})
  poolObject({position: new THREE.Vector3(5, 2, 0)})
  benchObject({position: new THREE.Vector3(10, 2, 5)})

  // const {callInTick: callInTickFirework} = fireworkObject({physicWorld, scene})
  // add objects end

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

  physicWorld.addEventListener("postStep", () => callInPostStepStack.forEach(call => call()))

  let oldElapsedTime: number;
  const minDelta: number = 1000 / 70;
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const physicDelta = Math.round((elapsedTime - oldElapsedTime) * 1000);
    const graphicDelta = elapsedTime - oldElapsedTime;
    if (physicDelta < minDelta) return window.requestAnimationFrame(tick);

    // update call in tick stack
    callInTickStack.forEach(call => call({physicDelta, graphicDelta}))

    // update physic step
    physicWorld.step(1 / 60, physicDelta, 3);

    // update other stuff
    cannonDebugRenderer.update();
    orbitControl.update();
    renderer.render(scene, camera);

    // update old elapsed time
    oldElapsedTime = elapsedTime

    window.requestAnimationFrame(tick);
  }
  tick();

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