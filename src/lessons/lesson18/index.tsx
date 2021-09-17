import React                                                 from "react";
import {SceneIgniterContextProvider, useSceneIgniterContext} from "../lessonIgniter";
import * as THREE                                            from "three";
import {OrbitControls}                                       from "three/examples/jsm/controls/OrbitControls";
import * as dat                                              from "dat.gui";
const clock = new THREE.Clock();

const windowSizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const Lesson18: React.FC = () => {
  const gui = new dat.GUI();
  const {canvas} = useSceneIgniterContext();
  const renderer = new THREE.WebGLRenderer({canvas});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(windowSizes.width, windowSizes.height)
  renderer.setClearColor("#262837");
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, windowSizes.width / windowSizes.height);
  camera.position.z = 12;
  const orbitControl = new OrbitControls(camera, canvas);
  orbitControl.enableDamping = true;

  const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.12);

  const moonDirectionalLight = new THREE.DirectionalLight("#b9d5ff", 0.12)
  moonDirectionalLight.position.set(4, 5, -2);

  scene.add(camera, ambientLight, moonDirectionalLight);

  const parameters = {
    count: 1000,
    size: 0.02,
    radius: 3,
    branches: 3,
    spin: 5,
    randomness: 0.02
  };

  console.log("rerender")

  let particlesGeometry: THREE.BufferGeometry | null = null;
  let particlesMaterial: THREE.PointsMaterial | null = null;
  let particles: THREE.Points | null = null;

  const generateGalaxy = React.useCallback(() => {

    if (particlesMaterial) particlesMaterial.dispose()
    if (particlesGeometry) particlesGeometry.dispose()
    if (particles) scene.remove(particles);

    particlesGeometry = new THREE.BufferGeometry();
    particlesMaterial = new THREE.PointsMaterial({
      size: parameters.size,
      sizeAttenuation: true
    });
    particles = new THREE.Points(particlesGeometry, particlesMaterial);

    const positions = new Float32Array(parameters.count * 3);
    Array.from({length: parameters.count * 3}).forEach((_, index) => {
      const axiIndex = index * 3;
      const radius = Math.random() * parameters.radius;
      const branchAngle = (index % parameters.branches) / parameters.branches * Math.PI * 2;
      const spinAngle = radius * parameters.spin;
      const randomX = (Math.random() - 0.5) * parameters.randomness;
      const randomY = (Math.random() - 0.5) * parameters.randomness;
      const randomZ = (Math.random() - 0.5) * parameters.randomness;
      positions[axiIndex] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[axiIndex + 1] = randomY;
      positions[axiIndex + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
    });
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    scene.add(particles);
  }, []);

  gui.add(parameters, "count").min(100).max(10000).step(100).onFinishChange(() => generateGalaxy())
  gui.add(parameters, "size").min(0.001).max(0.1).step(0.001).onFinishChange(() => generateGalaxy());
  gui.add(parameters, "radius").min(0.01).max(20).step(0.01).onFinishChange(() => generateGalaxy());
  gui.add(parameters, "branches").min(1).max(20).step(1).onFinishChange(() => generateGalaxy());
  gui.add(parameters, "spin").min(-10).max(10).step(0.01).onFinishChange(() => generateGalaxy());
  gui.add(parameters, "randomness").min(0).max(2).step(0.01).onFinishChange(() => generateGalaxy());


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

  const tick = React.useCallback(() => {
    const elapsedTime = clock.getElapsedTime();


    orbitControl.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  }, [renderer, scene, camera, orbitControl]);

  React.useEffect(() => tick(), [tick])
  React.useEffect(() => generateGalaxy(), [generateGalaxy])

  React.useEffect(() => {
    window.addEventListener("resize", windowResizeHandler)
    return () => {
      window.removeEventListener("resize", windowResizeHandler)
    }
  }, [windowResizeHandler])

  return null;
};

export const Lesson18Igniter: React.FC = () => {
  return (
    <SceneIgniterContextProvider>
      <Lesson18/>
    </SceneIgniterContextProvider>
  )
}