import React                from "react";
import * as THREE           from "three";
import * as dat             from "dat.gui";
import {OrbitControls}      from "three/examples/jsm/controls/OrbitControls";
import colorTextureImg                                from "../../static/textures/door/color.jpg"
import SceneContextProvider, {useSceneIgniterContext} from "../lessonIgniter";



// TODO LOADING MANAGER create loader manager for get load events
// он нужен что бы получить удобные колбэки процесса загрузки текстур
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = () => console.log("start loading awesome textures");
loadingManager.onProgress = () => console.log("we are in progress loading awesome textures");
loadingManager.onLoad = () => console.log("all awesome textures success loaded");
loadingManager.onError = () => console.log("shit some not loaded");

// TODO TEXTURE LOADER create textureLoader for load textures
// нужен для загрузки самих текстур что то типа полифила Image.onLoad
const textureLoader = new THREE.TextureLoader(loadingManager);
// loading textures
const colorTexture = textureLoader.load(colorTextureImg);


// TODO GUI create dat gui its debugger
// дебаггер можно кормить ему параметры и он даст возможность менять их не залезая в код
const gui = new dat.GUI();

// TODO CLOCK create clock for good animation on different fps monitor
// класс отсчитывающий время жизни программы
const clock = new THREE.Clock();

// TODO SCENE create scene
// общаяя сцена на которую помещаются все объекты, свет, и тд
const scene = new THREE.Scene();

// TODO LIGHTS свет. что бы на объектах был эффект нужно юзать MeshStandardMaterial, (а точнее нужно проверять совместимость света и материалов)
// нужно помнить о бэкинге backing это когда свет или тень имитируется на самой текстуре (ну типа просто написовали тень и кажется что она реальная)

// амбиент лайт создает свет со всех сторон из за чего кажется что света никакого и нет
// need gpu resources (low)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

// светит снизу и сверху разными цветами
// need gpu resources (low)
const hemisphereLight = new THREE.HemisphereLight("blue", "green", 0.5)
// scene.add(hemisphereLight)

// светит не ввиде конуса а параллельными лучами из точки свечения в центр сферы, поддерживает тени
// need gpu resources (medium)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)

directionalLight.position.z = 1.5

directionalLight.castShadow = true;
directionalLight.shadow.mapSize.x = 1024;
directionalLight.shadow.mapSize.y = 1024;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.left = -2;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;
directionalLight.shadow.radius = 10;
scene.add(directionalLight)

// лампочка - указывам от куда и она светит (но светит во все стороны), поддерживает тени
// need gpu resources (medium)
const pointLight = new THREE.PointLight("white",  0.5)

// pointLight.position.x = 2;
// pointLight.position.y = 3;
// pointLight.position.z = 4;
// scene.add(pointLight)

// что то типа софт бокса
// need gpu resources (high)
const rectAreaLight = new THREE.RectAreaLight("blue",  0.5, 1, 1)
// scene.add(rectAreaLight)

// что то типа фонарика (прожектора) если попадет на стену оставит круглый свет, поддерживает тени
// need gpu resources (high)
const spotLight = new THREE.SpotLight("blue",  0.5, 1, 1)
// scene.add(spotLight)


// TODO SHADOWS тени. что бы это работало three js перед рендером встает на место источника света тем самым понимая что "видит" этот источник и делаеи карту теней
// что бы они работали нужно выставлять у объектов пропс отбрасывания и пропс отражения тени.
// что бы тень нормально выглядела нужно оптимизировать размеры ее камеры
// типы shadow map
// BasicShadowMap - хорошая производительность выглядит не оч
// PCFShadowMap - не такая хорошая производительность выглядит лучше
// PCFSoftShadowMap - не такая хорошая производительность выглядит плавненько
// VSMShadowMap - не такая хорошая производительность выглядит норм иногда хз как

// TODO PARTICLES
// gpu если ты юзаешь текстуры не понимает какой партикл ближе а какой дальше по этому иногда рисует черные границы текстуры как фиксить
// alphaTest это чисоло тупо говоря она берет пиксель и считает его альфу если она меньше указанного числа то этот пиксель не будет рендерится
// depthTest = false отключает глубину у партиклов соотвественно и проблемы нет но тогда партиклы будут видны сквозь другие объекты
// depthWrite = false вроде норм решает проблему
// particlesMaterial.blending = THREE.AdditiveBlending оказывает влияние на призводительность (полупрозрачные цвета накладываются)
const particlesGeometry = new THREE.BufferGeometry();
const count = 500;

const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);
console.log(positions);
Array.from({length: count * 3}).forEach((_, index) => {
  positions[index] = (Math.random() - 0.5) * 10;
  colors[index] = Math.random();
});
particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.02,
  sizeAttenuation: true
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
particlesMaterial.depthWrite = false;
particlesMaterial.blending = THREE.AdditiveBlending;
particlesMaterial.vertexColors = true;
// scene.add(particles)

// TODO MATERIALS
// MeshStandardMaterial работает только со светом
// MeshBasicMaterial работает с цветами и тд
// MeshDepthMaterial работает с тенями
const cubMaterial = new THREE.MeshStandardMaterial();
const sphereMaterial = new THREE.MeshStandardMaterial();
const torusMaterial = new THREE.MeshStandardMaterial();
const planeMaterial = new THREE.MeshStandardMaterial();

// create object cube
const cube = new THREE.Mesh(
  new THREE.BoxBufferGeometry(0.7, 0.7, 0.7), // geometry of object
  cubMaterial
);
cube.position.x = 2;
// add object to scene
scene.add(cube);

// create object sphere
const sphere = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5, 32, 32), // geometry of object
  sphereMaterial
);
sphere.castShadow = true;
// add object to scene
scene.add(sphere);

// create object torus
const torus = new THREE.Mesh(
  new THREE.TorusBufferGeometry(0.3, 0.2, 16, 32), // geometry of object
  torusMaterial
);
torus.position.x = -2;
// add object to scene
// scene.add(torus);

// create object plane
const plane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(5, 5),
  planeMaterial
)

plane.receiveShadow = true
plane.rotation.x = -Math.PI * 0.5
plane.position.y = -0.65
scene.add(plane);

// TODO RAYCASTER штука которая создает луч и дает инфу о том какие объекты пересекает этот луч, нужен что бы имитировать mouse events
const mouse = new THREE.Vector2();

const raycaster = new THREE.Raycaster();

// const rayOrigin = new THREE.Vector3(-3, 0,0)
// const rayDirection = new THREE.Vector3(10, 0,0)
// rayDirection.normalize();
// raycaster.set(rayOrigin, rayDirection);
//
// const intersects = raycaster.intersectObjects([sphere, cube]);

const cameraPosition = {
  x: 0,
  y: 0
}

// sizes for fov
const windowSizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
// cameras
const camera = new THREE.PerspectiveCamera(75, windowSizes.width / windowSizes.height);
camera.position.z = 3;
// add cameras to scene
scene.add(camera);


// add some to debug
// gui.add(cube.position, "y").min(-3).max(3).step(0.1).name("cube y");
// gui.add(cube.material, "wireframe").name("cube wireframe");
// gui.add(ambientLight, "intensity").min(0).max(1).name("интенсивность света");


const Notes = () => {
  const {canvas} = useSceneIgniterContext();

  // setup orbit
  const orbitControl = new OrbitControls(camera, canvas);
  orbitControl.enableDamping = true;

  // renderer
  const renderer = React.useMemo(() => new THREE.WebGLRenderer({canvas}), [canvas]);
  renderer.setSize(windowSizes.width, windowSizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.BasicShadowMap;
  renderer.render(scene, camera);

  const windowResizeHandler = React.useCallback(() => {
    // update sizes
    windowSizes.width = window.innerWidth;
    windowSizes.height = window.innerHeight;

    // update cameras aspect ratio
    camera.aspect = windowSizes.width / windowSizes.height;
    camera.updateProjectionMatrix();

    // rerender
    renderer.setSize(windowSizes.width, windowSizes.height);
  }, [renderer]);

  const mouseMoveHandler = React.useCallback((ev: MouseEvent) => {
    mouse.x = ev.clientX / windowSizes.width * 2 - 1;
    mouse.y = -(ev.clientY / windowSizes.height) * 2 + 1;
  }, []);

  const tick = React.useCallback(() => {
    // const elapsedTime = clock.getElapsedTime();
    // cameras.position.set(cameraPosition.x * 3, cameraPosition.y * 3, cameras.position.z);
    // cameras.lookAt(cube.position)

    raycaster.setFromCamera(mouse, camera);
    const objectsToSet = [sphere];
    objectsToSet.forEach(object => object.material.color.set("red"));
    const intersects = raycaster.intersectObjects([sphere]);
    // @ts-ignore
    intersects.forEach(intersect => intersect?.object?.material?.color?.set("blue"))



    // update controls if it need
    orbitControl.update();
    // rerender scene
    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
  }, [renderer, orbitControl])

  React.useEffect(() => {
    window.addEventListener("resize", windowResizeHandler)
    return () => {
      window.removeEventListener("resize", windowResizeHandler)
    }
  }, [windowResizeHandler])

  React.useEffect(() => {
    window.addEventListener("mousemove", mouseMoveHandler)
    return () => {
      window.removeEventListener("mousemove", mouseMoveHandler)
    }
  }, [mouseMoveHandler])

  React.useEffect(() => tick(), [tick]);

  return null;
};

export default Notes;


export const NotesIgniter = () => {
  return (
    <SceneContextProvider>
      <Notes/>
    </SceneContextProvider>
  )
}