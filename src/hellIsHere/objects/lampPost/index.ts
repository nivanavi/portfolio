import CANNON                 from "cannon";
import * as THREE             from "three";
import {objectProps}          from "../../types";
import {copyPositions}        from "../../utils";
import {Howl}                 from "howler";
import {dummyPhysicsMaterial} from "../../physics";
import {GLTFLoader}           from "three/examples/jsm/loaders/GLTFLoader";

// @ts-ignore
import lampPostModelGltf from "./models/lampPost.gltf";
// @ts-ignore
import lampBrokenSong    from "./sounds/lampBroken.mp3";

const recorderPlayer = new Howl({
  src: [lampBrokenSong],
  html5: true,
  volume: 0.5,
  loop: false
});

interface lampPostProps extends objectProps {
  position: THREE.Vector3
}

const gltfLoader = new GLTFLoader();

export const lampPostObject = ({physicWorld, scene, position}: lampPostProps) => {
  const LAMP_POST_OPTIONS = {
    isAlreadyBroken: false
  }

  const lampPostContainer: THREE.Group = new THREE.Group();
  let lampLight: THREE.Object3D = new THREE.Object3D();
  lampPostContainer.name = "lampPost";
  // graphic
  // load models
  gltfLoader.load(
    lampPostModelGltf,
    model => {
      const lampPostModel = model.scene;
      lampPostModel.children.forEach(child => child.type === "SpotLight" ? child.castShadow = true : undefined)
      lampPostModel.children.forEach(child => child.type === "SpotLight" ? lampLight = child : undefined)
      lampPostModel.scale.set(0.18, 0.18, 0.18);
      lampPostModel.position.set(0, 0, -0.7)
      lampPostContainer.add(lampPostModel);
    }
  )

  // physic
  const lampPostShape = new CANNON.Box(new CANNON.Vec3(0.1, 0.1, 0.7));
  const lampPostBody = new CANNON.Body({
    mass: 0,
    shape: lampPostShape,
    material: dummyPhysicsMaterial
  })
  lampPostBody.allowSleep = true;
  lampPostBody.position.set(position.x, position.y, position.z + 0.7)

  lampPostBody.addEventListener("collide", (ev: any) => {
    if (ev.contact.getImpactVelocityAlongNormal() < 1.2 || LAMP_POST_OPTIONS.isAlreadyBroken) return;
    LAMP_POST_OPTIONS.isAlreadyBroken = true;
    recorderPlayer.play();
    lampLight.visible = false

    setTimeout(() => {
      setTimeout(() => {
        lampLight.visible = true;
        setTimeout(() => {
          lampLight.visible = false;
          setTimeout(() => {
            lampLight.visible = true;
            setTimeout(() => {
              lampLight.visible = false;
            }, 450)
          }, 200)
        }, 250)
      }, 100)
    }, 200)
  })

  copyPositions({
    body: lampPostBody,
    mesh: lampPostContainer
  })
  physicWorld.addBody(lampPostBody);
  scene.add(lampPostContainer)


  const callInTick = () => {

  }

  return {
    callInTick
  }
}