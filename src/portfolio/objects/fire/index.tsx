import * as THREE             from "three";
import {Howl}                                                               from "howler";
import {calInTickProps, DEFAULT_POSITION, MOST_IMPORTANT_DATA, objectProps} from "../../index";

// @ts-ignore
// import recorderSongUrl        from "./sounds/recorderSong.mp3"

// const fireworkPlayer = new Howl({
//   // src: [recorderSongUrl],
//   html5: true,
//   volume: 1,
//   loop: false
// });

export const FIREWORK_OPTIONS = {
  maxX: 0.5,
  maxY: 0.5,
  maxZ: 1,
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


export const fireObject = (props?: objectProps) => {
  const {position = DEFAULT_POSITION} = props || {};
  const {scene, addToCallInTickStack} = MOST_IMPORTANT_DATA;

  const fireContainer: THREE.Group = new THREE.Group();
  fireContainer.position.set(position.x, position.y, position.z);
  // graphic

  // particles
  const particlesGeometry = new THREE.BufferGeometry();
  const count = 1;

  const currentPositions = new Float32Array(count * 3);
  const endPositions = new Float32Array(count * 3);


  Array.from({length: count}).forEach((_, index) => {
    const axiIndex = index * 3;
    // endPositions[axiIndex] = randomIntFromInterval(-FIREWORK_OPTIONS.maxX, FIREWORK_OPTIONS.maxX); // x
    endPositions[axiIndex + 1] = randomIntFromInterval(0.1, FIREWORK_OPTIONS.maxZ); // y
    // endPositions[axiIndex + 2] = randomIntFromInterval(-FIREWORK_OPTIONS.maxY, FIREWORK_OPTIONS.maxY); // z
  });
  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(currentPositions, 3))
  // particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.2
  });

  const particles = new THREE.Points(particlesGeometry, particlesMaterial);

  console.log(particles)

  // particlesMaterial.depthWrite = false;
  // particlesMaterial.blending = THREE.AdditiveBlending;
  // particlesMaterial.vertexColors = true;
  fireContainer.add(particles)
  scene.add(fireContainer)

  const callInTick: (props: calInTickProps) => void = () => {
    currentPositions.forEach((position, index) => {
      const endPosition = endPositions[index];
      const speed = FIREWORK_OPTIONS.verticalSpeed;

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
  }
  addToCallInTickStack(callInTick)
}