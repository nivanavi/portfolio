import CANNON     from "cannon";
import * as THREE from "three";

export type objectProps = {
  physicWorld: CANNON.World
  scene: THREE.Scene
}