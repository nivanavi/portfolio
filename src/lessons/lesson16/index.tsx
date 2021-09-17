import React                                                 from "react";
import {SceneIgniterContextProvider, useSceneIgniterContext} from "../lessonIgniter";
import * as THREE                                            from "three";
import {OrbitControls}                                       from "three/examples/jsm/controls/OrbitControls";
import {Mesh}                                                from "three";
import doorColorImg from "../../static/textures/door/color.jpg"
import doorAlphaImg from "../../static/textures/door/alpha.jpg"
import doorAmbientOcclusionImg from "../../static/textures/door/ambientOcclusion.jpg"
import doorHeightImg from "../../static/textures/door/height.jpg"
import doorNormalImg from "../../static/textures/door/normal.jpg"
import doorMetalnessImg from "../../static/textures/door/metalness.jpg"
import doorRoughnessImg from "../../static/textures/door/roughness.jpg"


import wallColorImg from "../../static/textures/bricks/color.jpg"
import wallAmbientOcclusionImg from "../../static/textures/bricks/normal.jpg"
import wallNormalImg from "../../static/textures/bricks/ambientOcclusion.jpg"
import wallRoughnessImg from "../../static/textures/bricks/roughness.jpg"


import groundColorImg from "../../static/textures/grass/color.jpg"
import groundAmbientOcclusionImg from "../../static/textures/grass/normal.jpg"
import groundNormalImg from "../../static/textures/grass/ambientOcclusion.jpg"
import groundRoughnessImg from "../../static/textures/grass/roughness.jpg"

const clock = new THREE.Clock();

const windowSizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const textureLoader = new THREE.TextureLoader();
const doorColorTexture = textureLoader.load(doorColorImg);
const doorAlphaTexture = textureLoader.load(doorAlphaImg);
const doorAmbientOcclusionTexture = textureLoader.load(doorAmbientOcclusionImg);
const doorHeightTexture = textureLoader.load(doorHeightImg);
const doorNormalTexture = textureLoader.load(doorNormalImg);
const doorMetalnessTexture = textureLoader.load(doorMetalnessImg);
const doorRoughnessTexture = textureLoader.load(doorRoughnessImg);

const wallColorTexture = textureLoader.load(wallColorImg);
const wallAmbientOcclusionTexture = textureLoader.load(wallAmbientOcclusionImg);
const wallNormalTexture = textureLoader.load(wallNormalImg);
const wallRoughnessTexture = textureLoader.load(wallRoughnessImg);

const groundColorTexture = textureLoader.load(groundColorImg);
const groundAmbientOcclusionTexture = textureLoader.load(groundAmbientOcclusionImg);
const groundNormalTexture = textureLoader.load(groundNormalImg);
const groundRoughnessTexture = textureLoader.load(groundRoughnessImg);

groundColorTexture.repeat.set(8, 8);
groundAmbientOcclusionTexture.repeat.set(8, 8);
groundNormalTexture.repeat.set(8, 8);
groundRoughnessTexture.repeat.set(8, 8);

groundColorTexture.wrapS = THREE.RepeatWrapping;
groundAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
groundNormalTexture.wrapS = THREE.RepeatWrapping;
groundRoughnessTexture.wrapS = THREE.RepeatWrapping;

groundColorTexture.wrapT = THREE.RepeatWrapping;
groundAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
groundNormalTexture.wrapT = THREE.RepeatWrapping;
groundRoughnessTexture.wrapT = THREE.RepeatWrapping;

const Lesson16: React.FC = () => {
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

  const fog = new THREE.Fog("#262837", 1, 15);

  const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.12);

  const moonDirectionalLight = new THREE.DirectionalLight("#b9d5ff", 0.12)
  moonDirectionalLight.position.set(4, 5, -2);

  scene.add(camera, ambientLight, moonDirectionalLight);
  scene.fog = fog;

  const house = new THREE.Group();

  const walls = new THREE.Mesh(
    new THREE.BoxBufferGeometry(5,3,5, 20, 20, 20),
    new THREE.MeshStandardMaterial({
      map: wallColorTexture,
      aoMap: wallAmbientOcclusionTexture,
      normalMap: wallNormalTexture,
      roughnessMap: wallRoughnessTexture
    })
  )
  walls.castShadow = true;
  walls.geometry.setAttribute("uv2", new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2))
  walls.position.y = 3 / 2;
  house.add(walls)

  const roof = new THREE.Mesh(
    new THREE.ConeBufferGeometry(4,2,4),
    new THREE.MeshStandardMaterial({color: "#b22222"})
  )
  roof.position.y = 3 + 2 / 2;
  roof.rotation.y = Math.PI * 0.25;
  house.add(roof)

  const door = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1.8, 2, 20, 20),
    new THREE.MeshStandardMaterial({
      transparent: true,
      displacementScale: 0.1,
      map: doorColorTexture,
      alphaMap: doorAlphaTexture,
      aoMap: doorAmbientOcclusionTexture,
      displacementMap: doorHeightTexture,
      normalMap: doorNormalTexture,
      metalnessMap: doorMetalnessTexture,
      roughnessMap: doorRoughnessTexture
    })
  )
  door.geometry.setAttribute("uv2", new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2))
  door.position.y = 2 / 2;
  door.position.z = 5 / 2 + 0.01;
  house.add(door)

  const doorLampPointLight = new THREE.PointLight("#ff7d46", 1, 7);
  doorLampPointLight.position.z = 5 / 2 + 0.1;
  doorLampPointLight.position.y = 2.5;
  doorLampPointLight.castShadow = true;
  doorLampPointLight.shadow.mapSize.width = 256;
  doorLampPointLight.shadow.mapSize.height = 256;
  doorLampPointLight.shadow.camera.far = 7;
  house.add(doorLampPointLight)


  const bushGeometry = new THREE.SphereBufferGeometry(1, 16, 16);
  const bushMaterial = new THREE.MeshStandardMaterial({color: "green"});
  const firstBush = new Mesh(bushGeometry, bushMaterial);
  firstBush.castShadow = true;
  firstBush.scale.set(1, 1, 1)
  firstBush.position.x = -3;
  firstBush.position.y = 1 / 2;
  firstBush.position.z = 5 / 2 + 2;
  house.add(firstBush)

  const secondBush = new Mesh(bushGeometry, bushMaterial);
  secondBush.castShadow = true;
  secondBush.scale.set(0.7, 0.7, 0.7)
  secondBush.position.x = 2;
  secondBush.position.y = 1 / 2;
  secondBush.position.z = 5 / 2 + 1.5;
  house.add(secondBush)


  const graves = new THREE.Group();

  const graveGeometry = new THREE.BoxBufferGeometry(0.8, 1.2, 0.3);
  const graveMaterial = new THREE.MeshStandardMaterial({color: "grey"});

  Array.from({length: 40}).forEach((_, index) => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 6 + Math.random() * 3
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    const grave = new THREE.Mesh(graveGeometry, graveMaterial);
    grave.castShadow = true;
    grave.position.set(x, 1.2 / 2, z)
    grave.rotation.y = Math.random() - 0.5;
    graves.add(grave)
  })

  const ghost1 = new THREE.PointLight("#ff00ff", 2, 5);
  ghost1.castShadow = true;
  ghost1.shadow.mapSize.width = 256;
  ghost1.shadow.mapSize.height = 256;
  ghost1.shadow.camera.far = 7;
  scene.add(ghost1);
  const ghost2 = new THREE.PointLight("#ffff00", 2, 5);
  ghost2.castShadow = true;
  ghost2.shadow.mapSize.width = 256;
  ghost2.shadow.mapSize.height = 256;
  ghost2.shadow.camera.far = 7;
  scene.add(ghost2);
  const ghost3 = new THREE.PointLight("#00ffff", 2, 5);
  ghost3.castShadow = true;
  ghost3.shadow.mapSize.width = 256;
  ghost3.shadow.mapSize.height = 256;
  ghost3.shadow.camera.far = 7;
  scene.add(ghost3);


  const ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(20, 20, 20, 20),
    new THREE.MeshStandardMaterial({
      map: groundColorTexture,
      aoMap: groundAmbientOcclusionTexture,
      normalMap: groundNormalTexture,
      roughnessMap: groundRoughnessTexture
    })
  );
  ground.receiveShadow = true;
  ground.geometry.setAttribute("uv2", new THREE.Float32BufferAttribute(ground.geometry.attributes.uv.array, 2))
  ground.rotation.x = -Math.PI * 0.5;
  ground.position.y = 0

  scene.add(house, ground, graves);

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

    const ghost1Angle = elapsedTime;
    const ghost2Angle = - elapsedTime * 0.3;
    const ghost3Angle = elapsedTime * 0.7;

    ghost1.position.x = Math.cos(ghost1Angle) * 5;
    ghost1.position.z = Math.sin(ghost1Angle) * 5;
    ghost1.position.y = Math.sin(ghost1Angle) * 3;

    ghost2.position.x = Math.cos(ghost2Angle) * 5;
    ghost2.position.z = Math.sin(ghost2Angle) * 5;

    ghost3.position.x = Math.cos(ghost3Angle) * 8;
    ghost3.position.z = Math.sin(ghost3Angle) * 2;
    ghost3.position.y = Math.sin(ghost3Angle) * 3;

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

export const Lesson16Igniter: React.FC = () => {
  return (
    <SceneIgniterContextProvider>
      <Lesson16/>
    </SceneIgniterContextProvider>
  )
}