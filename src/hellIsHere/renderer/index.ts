import * as THREE    from "three";
import {windowSizesType} from "../cameras";

export type setupRendererProps = {
  canvas: HTMLCanvasElement
  windowSizes: windowSizesType
}

export const setupRenderer = ({canvas, windowSizes}: setupRendererProps) => {
  const renderer = new THREE.WebGLRenderer({canvas});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(windowSizes.width, windowSizes.height)

  return {
    renderer
  }
};