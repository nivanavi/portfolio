import React                                                 from "react";
import {SceneIgniterContextProvider, useSceneIgniterContext} from "../lessons/lessonIgniter";
import * as THREE                                            from "three";
import * as CANNON                                           from "cannon-es";
import dat                                                   from "dat.gui";
import {setupRenderer}                                       from "./renderer";
import {OrbitControls}                                       from "three/examples/jsm/controls/OrbitControls";
import {setupCameras}      from "./cameras";
import {setupPhysics}      from "./physics";
import {groundObject}      from "./objects/ground";
import {setupLights}       from "./lights";
import {carObject}         from "./objects/car";
import CannonDebugRenderer from "../libs/cannonDebug";
import {windowResizeUtil}  from "./utils";
import {poolObject}        from "./objects/waterpool";
import {benchObject}       from "./objects/bench";
import {teleportObject}    from "./objects/teleport";
import {treeObject}        from "./objects/tree";
import {lampPostObject}    from "./objects/lampPost";
import {GLTFLoader}        from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader}       from "three/examples/jsm/loaders/DRACOLoader";
import {recorderObject}    from "./objects/recorder";
import {logBenchObject} from "./objects/logBench";
import {fireObject}     from "./objects/fire";

export type quaternionType = {
  vector: CANNON.Vec3,
  angle: number
}

export type objectProps = {
  position?: THREE.Vector3
  quaternion?: quaternionType
}

export type windowSizesType = {
  width: number
  height: number
}

export type calInTickProps = {
  physicDelta: number
  graphicDelta: number
  time: number
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
  gltfLoader: GLTFLoader
}

export const DEFAULT_POSITION: THREE.Vector3 = new THREE.Vector3();
export const DEFAULT_QUATERNION: quaternionType = {
  vector: new CANNON.Vec3(),
  angle: 0
}

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/draco/' );
gltfLoader.setDRACOLoader( dracoLoader );

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
  addToCallInPostStepStack: (callInPostStep: callInPostStep) => callInPostStepStack.push(callInPostStep),
  gltfLoader
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
  benchObject({position: new THREE.Vector3(0.8, 0, 6), quaternion: {vector: new CANNON.Vec3(0, -1, 0), angle: Math.PI}})
  lampPostObject({position: new THREE.Vector3(0, 0, 6)})

  benchObject({position: new THREE.Vector3(0.8, 0, -6)})
  lampPostObject({position: new THREE.Vector3(0, 0, -6)})

  benchObject({position: new THREE.Vector3(-6, 0, 0.8), quaternion: {vector: new CANNON.Vec3(0, 1, 0), angle: Math.PI * 0.5}})
  lampPostObject({position: new THREE.Vector3(-6, 0, 0)})

  benchObject({position: new THREE.Vector3(6, 0, 0.8), quaternion: {vector: new CANNON.Vec3(0, -1, 0), angle: Math.PI * 0.5}})
  lampPostObject({position: new THREE.Vector3(6, 0, 0)})

  logBenchObject({position: new THREE.Vector3(16, 0, 0)})

  fireObject({position: new THREE.Vector3(0, 0, 3.5)})

  recorderObject({position: new THREE.Vector3(0, 0.4, 2.1), quaternion: {vector: new CANNON.Vec3(0, 1, 0), angle: Math.PI * 0.5}})


  treeObject({position: new THREE.Vector3(10, 0, 0)}, "bush")
  treeObject({position: new THREE.Vector3(10, 0, -4)}, "treeAutumn")
  treeObject({position: new THREE.Vector3(10, 0, -16), quaternion: {vector: new CANNON.Vec3(0, -1, 0), angle: Math.PI * 0.5}}, "treeAutumn")
  treeObject({position: new THREE.Vector3(10, 0, -8)}, "treeSummer")
  treeObject({position: new THREE.Vector3(10, 0, -12)}, "pine")
  treeObject({position: new THREE.Vector3(10, 0, 4)}, "treeAutumn2")

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
    callInTickStack.forEach(call => call({physicDelta, graphicDelta, time: elapsedTime}))

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