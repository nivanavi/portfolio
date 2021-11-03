import React                                                 from "react";
import {SceneIgniterContextProvider, useSceneIgniterContext} from "../lessons/lessonIgniter";
import * as THREE          from "three";
import * as CANNON         from "cannon-es";
import dat                 from "dat.gui";
import {setupRenderer}     from "./renderer";
import {OrbitControls}     from "three/examples/jsm/controls/OrbitControls";
import {setupCameras}      from "./cameras";
import {setupPhysics}      from "./physics";
import {groundObject}      from "./objects/ground";
import {setupLights}       from "./lights";
import {carObject}         from "./objects/car";
import CannonDebugRenderer from "../libs/cannonDebug";
import {windowResizeUtil}  from "./utils";
import {poolObject}        from "./objects/waterpool";
import {benchObject}       from "./objects/bench";
import {lampPostObject}    from "./objects/lampPost";
import {teleportObject}    from "./objects/teleport";

export type objectProps = {
  position?: THREE.Vector3
  quaternion?: CANNON.Quaternion
}

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

const {scene, windowSizes, physicWorld, clock} = MOST_IMPORTANT_DATA;


export const Portfolio = () => {
  const {canvas} = useSceneIgniterContext();
  const {renderer} = setupRenderer({canvas});
  renderer.shadowMap.enabled = true;

  const {camera} = setupCameras();
  setupLights();

  // not important stuff
  const orbitControl = new OrbitControls(camera, canvas);
  const cannonDebugRenderer = new CannonDebugRenderer(scene, physicWorld)

  // add objects
  groundObject();
  const {chassisBody, carContainer} = carObject();
  poolObject();
  benchObject({position: new THREE.Vector3(-4, 0.2, 0)})
  lampPostObject({position: new THREE.Vector3(0, 0, -4)})

  const {callInTick} = teleportObject({exitPosition: new THREE.Vector3(18, 0, 8), enterPosition: new THREE.Vector3(8, 0, 8)})

  physicWorld.addEventListener("postStep", () => callInPostStepStack.forEach(call => call()))

  let oldElapsedTime: number;
  const minDelta: number = 1000 / 70;
  const timeStep = 1 / 60;
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const physicDelta = Math.round((elapsedTime - oldElapsedTime) * 1000);
    const graphicDelta = elapsedTime - oldElapsedTime;
    if (physicDelta < minDelta) return window.requestAnimationFrame(tick);

    // update call in tick stack
    callInTickStack.forEach(call => call({physicDelta, graphicDelta}))

    callInTick({body: chassisBody, mesh: carContainer})

    // update physic step
    if (!oldElapsedTime) physicWorld.step(timeStep)
    else physicWorld.step(timeStep, physicDelta, 3)


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
}

export const PortfolioIgniter: React.FC = () => {
  return (
    <SceneIgniterContextProvider>
      <Portfolio/>
    </SceneIgniterContextProvider>
  )
}