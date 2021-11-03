import * as CANNON from 'cannon-es'
import * as THREE             from "three";
import {copyPositions}        from "../../utils";
import {dummyPhysicsMaterial} from "../../physics";
import {GLTFLoader}           from "three/examples/jsm/loaders/GLTFLoader";

// @ts-ignore
import poolModelGltf         from "./models/fontain.gltf";
import {DRACOLoader}                                      from "three/examples/jsm/loaders/DRACOLoader";
import {calInTickProps, MOST_IMPORTANT_DATA, objectProps} from "../../index";
// @ts-ignore

// const recorderPlayer = new Howl({
//   src: [lampBrokenSong],
//   html5: true,
//   volume: 0.5,
//   loop: false
// });

const gltfLoader = new GLTFLoader();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/draco/' );
gltfLoader.setDRACOLoader( dracoLoader );

export const poolObject = (props?: objectProps) => {
  const {position = new THREE.Vector3()} = props || {};
  const {scene, physicWorld, addToCallInTickStack} = MOST_IMPORTANT_DATA;

  const POOL_OPTIONS = {
    isAlreadyAnimated: false
  }

  const poolContainer: THREE.Group = new THREE.Group();
  poolContainer.name = "pool";

  let mixer: null | THREE.AnimationMixer = null;
  let dolphinAnimation: null | THREE.AnimationAction = null;
  // graphic
  // load models
  gltfLoader.load(
    poolModelGltf,
    model => {
      const poolModel = model.scene;
      mixer = new THREE.AnimationMixer(poolModel);
      dolphinAnimation = mixer.clipAction(model.animations[0]);
      dolphinAnimation.paused = true;
      dolphinAnimation.repetitions = 1;
      dolphinAnimation.play();
      poolModel.scale.set(0.35, 0.35, 0.35);
      poolModel.position.set(0, -0.15, 0)
      poolContainer.add(poolModel);
    }
  )

  // physic
  const poolShape = new CANNON.Cylinder(2.2, 2.2, 0.3, 16);
  const poolBody = new CANNON.Body({
    mass: 0,
    shape: poolShape,
    material: dummyPhysicsMaterial
  })
  poolBody.allowSleep = true;
  poolBody.position.set(position.x, position.y + 0.15, position.z)


  // todo sounds and play only once
  poolBody.addEventListener("collide", (ev: any) => {
    if (ev.contact.getImpactVelocityAlongNormal() < 1.2 || POOL_OPTIONS.isAlreadyAnimated || !dolphinAnimation) return;
    POOL_OPTIONS.isAlreadyAnimated = true;
    dolphinAnimation.reset()
    setTimeout(() => POOL_OPTIONS.isAlreadyAnimated = false, 1000)
  })

  copyPositions({
    body: poolBody,
    mesh: poolContainer
  })
  physicWorld.addBody(poolBody);
  scene.add(poolContainer)


  const callInTick: (props: calInTickProps) => void = ({graphicDelta}) => {
    if (mixer) mixer.update(graphicDelta * 15);
  }
  addToCallInTickStack(callInTick);
}