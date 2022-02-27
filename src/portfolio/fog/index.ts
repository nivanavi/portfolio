import * as THREE from 'three';
import { MOST_IMPORTANT_DATA } from '../index';

type setFogType = () => void;

export const setupFog: () => {
	setFogFor1Level: setFogType;
	setFogFor2Level: setFogType;
	setFogFor3Level: setFogType;
} = () => {
	const { scene } = MOST_IMPORTANT_DATA;

	const colorFor1level: string = '#1F4705';
	const colorFor2level: string = '#D58B1C';
	const colorFor3level: string = '#7C7C7C';

	const fog1level = new THREE.Fog(colorFor1level, 65, 80);
	const fog2level = new THREE.Fog(colorFor2level, 65, 80);
	const fog3level = new THREE.Fog(colorFor3level, 65, 80);

	const setFogFor1Level: setFogType = () => {
		scene.background = new THREE.Color(colorFor1level);
		scene.fog = fog1level;
	};

	const setFogFor2Level: setFogType = () => {
		scene.background = new THREE.Color(colorFor2level);
		scene.fog = fog2level;
	};

	const setFogFor3Level: setFogType = () => {
		scene.background = new THREE.Color(colorFor3level);
		scene.fog = fog3level;
	};

	return {
		setFogFor1Level,
		setFogFor2Level,
		setFogFor3Level,
	};
};
