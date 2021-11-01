import React                                                 from "react";
import {SceneIgniterContextProvider, useSceneIgniterContext} from "../lessonIgniter";
import * as THREE                                            from "three";
import {OrbitControls}                                       from "three/examples/jsm/controls/OrbitControls";
import * as dat       from "dat.gui";
import * as CANNON from 'cannon-es'

const clock = new THREE.Clock();

const windowSizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const physicsWorld = new CANNON.World();
physicsWorld.gravity.set(0, -9.82,0);

// physics material

const concreteMaterial = new CANNON.Material("concrete");
const plasticMaterial = new CANNON.Material("plastic");

const concretePlasticContactMaterial = new CANNON.ContactMaterial(concreteMaterial, plasticMaterial, {
  friction: 0.1,
  restitution: 0.7
})

physicsWorld.addContactMaterial(concretePlasticContactMaterial);

const sphereShape = new CANNON.Sphere(0.5);
const sphereBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0, 3, 0),
  shape: sphereShape,
  material: plasticMaterial
})
physicsWorld.addBody(sphereBody);

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
  mass: 0,
  shape: floorShape,
  material: concreteMaterial
})
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)

physicsWorld.addBody(sphereBody);
physicsWorld.addBody(floorBody);

const Lesson20: React.FC = () => {
  const gui = new dat.GUI();
  const {canvas} = useSceneIgniterContext();
  const renderer = new THREE.WebGLRenderer({canvas});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(windowSizes.width, windowSizes.height)
  renderer.setClearColor("#262837");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, windowSizes.width / windowSizes.height);
  camera.position.z = 3;
  camera.position.y = 1;
  const orbitControl = new OrbitControls(camera, canvas);
  orbitControl.enableDamping = true;

  const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.5);

  const moonDirectionalLight = new THREE.DirectionalLight("#b9d5ff", 0.5)
  moonDirectionalLight.position.set(4, 5, -2);

  scene.add(camera, ambientLight, moonDirectionalLight);

  const sphereMaterial = new THREE.MeshStandardMaterial();
  const planeMaterial = new THREE.MeshStandardMaterial();

// create object sphere
  const sphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 32, 32), // geometry of object
    sphereMaterial
  );
  sphere.castShadow = true;
  sphere.position.y = 3;
// add object to scene
  scene.add(sphere);

// create object plane
  const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(5, 5),
    planeMaterial
  )

  plane.receiveShadow = true
  plane.rotation.x = -Math.PI * 0.5
  scene.add(plane);

  const windowResizeHandler = React.useCallback(() => {
    // update sizes
    windowSizes.width = window.innerWidth;
    windowSizes.height = window.innerHeight;

    // update cameras aspect ratio
    camera.aspect = windowSizes.width / windowSizes.height;
    camera.updateProjectionMatrix();

    // rerender
    renderer.setSize(windowSizes.width, windowSizes.height);
  }, [renderer, camera]);


  let oldElapsedTime: number;
  const tick = React.useCallback(() => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime
    // update physics world
    physicsWorld.step(1/60, deltaTime,3);

    // update tree js
    sphere.position.x = sphereBody.position.x;
    sphere.position.y = sphereBody.position.y;
    sphere.position.z = sphereBody.position.z;
    orbitControl.update();
    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
  }, [renderer, scene, camera, orbitControl]);

  React.useEffect(() => tick(), [tick])

  React.useEffect(() => {
    window.addEventListener("resize", windowResizeHandler)
    return () => {
      window.removeEventListener("resize", windowResizeHandler)
    }
  }, [windowResizeHandler])

  return null;
};

export const Lesson20Igniter: React.FC = () => {
  return (
    <SceneIgniterContextProvider>
      <Lesson20/>
    </SceneIgniterContextProvider>
  )
}