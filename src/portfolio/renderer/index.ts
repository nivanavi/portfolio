import * as THREE from 'three';
import { MOST_IMPORTANT_DATA } from '../index';

export type setupRendererProps = {
	canvas: HTMLCanvasElement;
};

export const setupRenderer: (props: setupRendererProps) => { renderer: THREE.WebGLRenderer } = ({ canvas }) => {
	const { windowSizes } = MOST_IMPORTANT_DATA;

	const renderer = new THREE.WebGLRenderer({ canvas });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.setSize(windowSizes.width, windowSizes.height);

	return {
		renderer,
	};
};
