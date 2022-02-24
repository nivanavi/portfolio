import * as THREE from 'three';
import { MOST_IMPORTANT_DATA } from '../index';

type setLightsType = (levelYOffset: number) => void;

export const setupLights: () => {
	setLightsFor1Level: setLightsType;
	setLightsFor2Level: setLightsType;
	setLightsFor3Level: setLightsType;
} = () => {
	const { scene } = MOST_IMPORTANT_DATA;
	const ambientLight = new THREE.AmbientLight('#ffffff');

	const pointLight = new THREE.PointLight('#ffffff');
	pointLight.castShadow = true; // default false
	pointLight.shadow.mapSize.height = 1024;
	pointLight.shadow.mapSize.width = 1024;
	scene.add(pointLight);
	scene.add(ambientLight);

	const setLightsFor1Level: setLightsType = (levelYOffset: number) => {
		ambientLight.intensity = 0.5;
		pointLight.intensity = 0.8;
		pointLight.distance = 40;
		pointLight.position.set(0, levelYOffset, -7);
	};

	const setLightsFor2Level: setLightsType = (levelYOffset: number) => {
		ambientLight.intensity = 1;
		pointLight.intensity = 0.8;
		pointLight.distance = 60;
		pointLight.position.set(0, levelYOffset, 7);
	};

	const setLightsFor3Level: setLightsType = levelYOffset => {
		ambientLight.intensity = 1;
		pointLight.intensity = 0.6;
		pointLight.distance = 60;
		pointLight.position.set(12, levelYOffset, 0);
	};

	return {
		setLightsFor1Level,
		setLightsFor2Level,
		setLightsFor3Level,
	};
};
