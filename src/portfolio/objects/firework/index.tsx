import * as CANNON            from 'cannon-es'
import * as THREE             from "three";
import {copyPositions}        from "../../utils";
import {Howl}                 from "howler";
import {dummyPhysicsMaterial} from "../../physics";
import {objectProps}          from "../../index";

// @ts-ignore
// import recorderSongUrl        from "./sounds/recorderSong.mp3"

const fireworkPlayer = new Howl({
  // src: [recorderSongUrl],
  html5: true,
  volume: 1,
  loop: false
});

export const FIREWORK_OPTIONS = {
  maxX: 0.5,
  maxY: 0.5,
  maxZ: 2,
  horizontalSpeed: 0.01,
  verticalSpeed: 0.005,
  // width: 0.6,
  // height: 0.4,
  // depth: 0.25,
  // mass: 10,
  // isPlay: false,
  // maxVolume: 0.5,
  // lastTouche: 0,
  // toucheDelta: 200,
  // lastBassJump: 0,
  // bassJumpDelta: 1000
}

const randomIntFromInterval = (min: number, max: number) => Math.round((Math.random() * (max - min + 1) + min) * 100) / 100

console.log(randomIntFromInterval(-6, 6));
console.log(randomIntFromInterval(-6, 6));
console.log(randomIntFromInterval(-6, 6));
console.log(randomIntFromInterval(-6, 6));
console.log(randomIntFromInterval(-6, 6));



export const fireworkObject = () => {
  // graphic
  const fireworkMaterial = new THREE.MeshStandardMaterial({
    color: "purple"
  });
  const fireworkGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
  const fireworkMesh = new THREE.Mesh(
    fireworkGeometry,
    fireworkMaterial
  )
  fireworkMesh.receiveShadow = true

  const raycaster = new THREE.Raycaster();
  const rayOrigin = new THREE.Vector3(0, 0, 0);
  const rayDirection = new THREE.Vector3(0, 10, 0);
  rayDirection.normalize();
  raycaster.far = 5;
  raycaster.set(rayOrigin, rayDirection)

  // particles
  const particlesGeometry = new THREE.BufferGeometry();
  const count = 30;

  const currentPositions = new Float32Array(count * 3);
  console.log(currentPositions)
  const endPositions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  Array.from({length: count}).forEach((_, index) => {
    const axiIndex = index * 3;
    endPositions[axiIndex] = randomIntFromInterval(-FIREWORK_OPTIONS.maxX, FIREWORK_OPTIONS.maxX); // x
    endPositions[axiIndex + 1] = randomIntFromInterval(-FIREWORK_OPTIONS.maxY, FIREWORK_OPTIONS.maxY); // y
    endPositions[axiIndex + 2] = randomIntFromInterval(0.5, FIREWORK_OPTIONS.maxZ); // z
  });
  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(currentPositions, 3))
  particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true
  });

  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  // particlesMaterial.depthWrite = false;
  // particlesMaterial.blending = THREE.AdditiveBlending;
  // particlesMaterial.vertexColors = true;
  scene.add(particles)

  // physic
  const fireworkShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  const fireworkBody = new CANNON.Body({
    mass: 0,
    shape: fireworkShape,
    material: dummyPhysicsMaterial
  })

  fireworkBody.allowSleep = true;
  fireworkBody.position.set(0, 3, 0)

  physicWorld.addBody(fireworkBody);
  scene.add(fireworkMesh);

  // todo как только партикл достигнет максимума возвращать его резко в начало


  const callInTick = (object: THREE.Mesh) => {
    const intersects = raycaster.intersectObject(object);

    currentPositions.forEach((position, index) => {
      const endPosition = endPositions[index];
      const isVertical = index !== 0 && (index % 3) === 0;
      const speed = isVertical ? FIREWORK_OPTIONS.verticalSpeed : FIREWORK_OPTIONS.horizontalSpeed;

      if (endPosition <= 0) {
        // if (position <= endPosition) return currentPositions[index] = 0;
        if (position <= endPosition) return;
        currentPositions[index] = currentPositions[index] - speed;
      }
      if (endPosition >= 0) {
        // if (position >= endPosition) return currentPositions[index] = 0;
        if (position >= endPosition) return;
        currentPositions[index] = currentPositions[index] + speed;
      }
    })
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(currentPositions, 3))

    // particlesGeometry.position

    // console.log(intersects);
    // recorderPlayer.volume(getVolumeByDistance(recorderBody.position.distanceTo(CAR_DYNAMIC_OPTIONS.oldPosition)))
    copyPositions({
      body: fireworkBody,
      mesh: fireworkMesh
    })
  }

  return {
    callInTick
  }
}