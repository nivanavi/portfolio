import CANNON                 from "cannon";
import * as THREE             from "three";
import {objectProps}          from "../../types";
import {copyPositions}        from "../../utils";
import {Howl}                 from "howler";
import {dummyPhysicsMaterial} from "../../physics";
import {GLTFLoader}           from "three/examples/jsm/loaders/GLTFLoader";

// @ts-ignore
import poolModelGltf from "./models/fontain.gltf";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
// @ts-ignore

// const recorderPlayer = new Howl({
//   src: [lampBrokenSong],
//   html5: true,
//   volume: 0.5,
//   loop: false
// });

interface poolProps extends objectProps {
  position: THREE.Vector3
}

const gltfLoader = new GLTFLoader();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/draco/' );
gltfLoader.setDRACOLoader( dracoLoader );

export const poolObject = ({physicWorld, scene, position}: poolProps) => {
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
      dolphinAnimation.setLoop( THREE.LoopOnce, 1 )
      poolModel.scale.set(0.35, 0.35, 0.35);
      poolModel.position.set(0, 0, -0.2)
      poolContainer.add(poolModel);
    }
  )

  // physic
  const poolShape = new CANNON.Cylinder(2.2, 2.2, 0.4, 16);
  const poolBody = new CANNON.Body({
    mass: 0,
    shape: poolShape,
    material: dummyPhysicsMaterial
  })
  poolBody.allowSleep = true;
  poolBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, -1),  Math.PI * 0.5);
  poolBody.position.set(position.x, position.y, position.z + 0.2)

  poolBody.addEventListener("collide", (ev: any) => {
    if (ev.contact.getImpactVelocityAlongNormal() < 1.2 || POOL_OPTIONS.isAlreadyAnimated || !dolphinAnimation) return;
    POOL_OPTIONS.isAlreadyAnimated = true;
    dolphinAnimation.play();
    setTimeout(() => {
      dolphinAnimation!.paused = true
      POOL_OPTIONS.isAlreadyAnimated = false;
    }, 500)
  })

  copyPositions({
    body: poolBody,
    mesh: poolContainer
  })
  physicWorld.addBody(poolBody);
  scene.add(poolContainer)


  const callInTick = (deltaTime: number) => {
    if (mixer) mixer.update(deltaTime * 15);
  }

  return {
    callInTick
  }
}