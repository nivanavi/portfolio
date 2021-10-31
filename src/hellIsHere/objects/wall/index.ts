import * as THREE                        from "three";
import CANNON                            from "cannon";
import {copyPositions, copyPositionType} from "../../utils";
import {dummyPhysicsMaterial}            from "../../physics";
import {Howl}          from "howler";

// @ts-ignore
import recorderSongUrl                       from "./sounds/brickSound.mp3"
import {calInTickProps, MOST_IMPORTANT_DATA} from "../../index";


type createWallProps = {
  brickInRows: number
  rows: number
  position: CANNON.Vec3
  isYDirection?: boolean
}

const brickPlayer = new Howl({
  src: [recorderSongUrl],
  volume: 0.5,
  html5: true,
});

export const BRICK_OPTION = {
  width: 0.56,
  height: 0.25,
  depth: 0.25,
  mass: 0.5,
  lastPlaySound: 0,
  soundDelta: 100
}

export const wallObject = () => {
  const {scene, physicWorld, addToCallInTickStack} = MOST_IMPORTANT_DATA;

  const brickMaterial = new THREE.MeshStandardMaterial();
  const brickGeometry = new THREE.BoxBufferGeometry(BRICK_OPTION.width, BRICK_OPTION.height, BRICK_OPTION.depth);
  const brickShape = new CANNON.Box(new CANNON.Vec3(BRICK_OPTION.width * 0.5, BRICK_OPTION.height * 0.5, BRICK_OPTION.depth * 0.5));

  const bricks: copyPositionType[] = []

  const createBrick = (position: CANNON.Vec3, isYDirection?: boolean) => {
    const body = new CANNON.Body({
      mass: BRICK_OPTION.mass,
      shape: brickShape,
      material: dummyPhysicsMaterial
    })
    body.allowSleep = true;
    body.position.copy(position)
    if (isYDirection) body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, -1), Math.PI * 0.5)
    const mesh = new THREE.Mesh(
      brickGeometry,
      brickMaterial
    )
    mesh.castShadow = true;

    physicWorld.addBody(body)
    scene.add(mesh)

    bricks.push({
      mesh,
      body
    })

    body.addEventListener("collide", (ev: any) => {
      const force: number = ev.contact.getImpactVelocityAlongNormal();
      const currentTime = Date.now();
      if (currentTime < (BRICK_OPTION.lastPlaySound + BRICK_OPTION.soundDelta) || force < 0.7) return;
      BRICK_OPTION.lastPlaySound = currentTime;
      const volume = Math.pow(Math.min(Math.max((force - 0.7) * 0.75, 0.2), 0.85), 2)
      brickPlayer.volume(volume)
      brickPlayer.play();
    })
  }

  const createWall = ({brickInRows, rows, position, isYDirection}: createWallProps) => {
    Array.from({length: rows}).forEach((_, rowIndex) => {
      const isEven: boolean = rowIndex % 2 === 0;
      const rowPosition = new CANNON.Vec3();
      if (!isYDirection) rowPosition.set(isEven ? position.x : position.x + BRICK_OPTION.width * 0.5, position.y, position.z + rowIndex * BRICK_OPTION.height + 0.05);
      if (isYDirection) rowPosition.set(position.x, isEven ? position.y : position.y + BRICK_OPTION.width * 0.5, position.z + rowIndex * BRICK_OPTION.height + 0.05);
      Array.from({length: brickInRows}).forEach((_, brickIndex) => {
        const brickPosition = new CANNON.Vec3().copy(rowPosition)
        if (!isYDirection) brickPosition.x = rowPosition.x + (brickIndex * BRICK_OPTION.width) + 0.05;
        if (isYDirection) brickPosition.y = rowPosition.y + (brickIndex * BRICK_OPTION.width) + 0.05;
        createBrick(brickPosition, isYDirection)
      })
    })
  }

  const callInTick: (props: calInTickProps) => void = () => bricks.forEach(brick => copyPositions(brick));
  addToCallInTickStack(callInTick)

  return {
    createWall
  }
}