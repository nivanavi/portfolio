import * as CANNON from 'cannon-es'
import * as THREE             from "three";
import {objectProps}          from "../../types";
import {dummyPhysicsMaterial} from "../../physics";
import {GLTFLoader}           from "three/examples/jsm/loaders/GLTFLoader";

// @ts-ignore
import ferrisWheelModelGltf from "./models/fontain.gltf";

// @ts-ignore

// const recorderPlayer = new Howl({
//   src: [lampBrokenSong],
//   html5: true,
//   volume: 0.5,
//   loop: false
// });

interface ferrisWheelProps extends objectProps {
  position: THREE.Vector3
}

const gltfLoader = new GLTFLoader();

export const ferrisWheelObject = ({physicWorld, scene, position}: ferrisWheelProps) => {

  const ferrisWheelContainer: THREE.Group = new THREE.Group();
  ferrisWheelContainer.name = "ferrisWheel";

  // let mixer: null | THREE.AnimationMixer = null;
  // let dolphinAnimation: null | THREE.AnimationAction = null;
  // // graphic
  // // load models
  // gltfLoader.load(
  //   ferrisWheelModelGltf,
  //   model => {
  //     const ferrisWheelModel = model.scene;
  //     mixer = new THREE.AnimationMixer(ferrisWheelModel);
  //     dolphinAnimation = mixer.clipAction(model.animations[0]);
  //     // dolphinAnimation.setLoop( THREE.LoopOnce, 1 )
  //     dolphinAnimation.paused = true;
  //     dolphinAnimation.play();
  //     ferrisWheelModel.scale.set(0.35, 0.35, 0.35);
  //     ferrisWheelModel.position.set(0, 0, -0.2)
  //     ferrisWheelContainer.add(ferrisWheelModel);
  //   }
  // )

  // physic
  const ferrisWheelShape = new CANNON.Cylinder(3, 3, 0.2, 14);
  const ferrisWheelBody = new CANNON.Body({
    mass: 0,
    shape: ferrisWheelShape,
    material: dummyPhysicsMaterial
  })
  ferrisWheelBody.allowSleep = true;
  ferrisWheelBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, -1, 0),  Math.PI * 0.5);
  ferrisWheelBody.position.set(position.x, position.y, position.z + 0.2)
  ferrisWheelBody.allowSleep = true;



  // physic
  const cabineShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  const cabineBody = new CANNON.Body({
    mass: 5,
    shape: cabineShape,
    material: dummyPhysicsMaterial
  })

  cabineBody.position.set(10.8, 4.5, 0)


  const debugShape = new CANNON.Box(new CANNON.Vec3(0.1, 0.1, 0.1));
  const debugBody = new CANNON.Body({
    mass: 0,
    shape: debugShape,
    material: dummyPhysicsMaterial
  })
  const debugBody2 = new CANNON.Body({
    mass: 0,
    shape: debugShape,
    material: dummyPhysicsMaterial
  })

  debugBody.position.set(-10.75, -10, 0.4)
  debugBody2.position.set(-10.75, -10, 1.4)


  var s = 0.5, d = 0.1*s;
  var shape = new CANNON.Box(new CANNON.Vec3(s*0.5,s*0.1,s*0.5));
  var body = new CANNON.Body({ mass: 15 });
  body.addShape(shape);
  var staticBody = new CANNON.Body({ mass: 0 });
  staticBody.addShape(shape);
  staticBody.position.z = s + d*2 + 0.5;

  // Hinge it
  var c = new CANNON.HingeConstraint(staticBody, body, {
    pivotA: new CANNON.Vec3(0,0,-s*0.5-d),
    axisA: new CANNON.Vec3(2,0,0),
    pivotB: new CANNON.Vec3(0,0,s*0.5+d),
    axisB: new CANNON.Vec3(2,0,0)
  });
  physicWorld.addConstraint(c);

  physicWorld.addBody(body);
  physicWorld.addBody(staticBody);

  // physicWorld.addBody(debugBody)
  // physicWorld.addBody(debugBody2)


  // ferrisWheelBody.addEventListener("collide", (ev: any) => {
  //   if (ev.contact.getImpactVelocityAlongNormal() < 1.2 || ferrisWheel_OPTIONS.isAlreadyAnimated || !dolphinAnimation) return;
  //   ferrisWheel_OPTIONS.isAlreadyAnimated = true;
  //   dolphinAnimation.paused = false;
  //   setTimeout(() => {
  //     dolphinAnimation!.paused = true
  //     ferrisWheel_OPTIONS.isAlreadyAnimated = false;
  //   }, 683)
  // })




  let angle = 0;
  const callInTick = () => {
    // angle = angle + 0.005
    //
    // const quatZ = new CANNON.Quaternion();
    // const quatY = new CANNON.Quaternion();
    // quatY.setFromAxisAngle(new CANNON.Vec3(0,-1,0), Math.PI * 0.5);
    // quatZ.setFromAxisAngle(new CANNON.Vec3(0,0,1), angle);
    // const resultQuaternion = quatY.mult(quatZ);
    // resultQuaternion.normalize();
    //
    // ferrisWheelBody.quaternion = resultQuaternion;
    // if (mixer) mixer.update(deltaTime * 15);
  }

  return {
    callInTick
  }
}