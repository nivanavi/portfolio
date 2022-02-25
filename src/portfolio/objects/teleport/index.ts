import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { dummyPhysicsMaterial } from '../../physics';
import { calInTickProps, MOST_IMPORTANT_DATA } from '../../index';
import { CAR_OPTIONS } from '../car';

// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import teleportModelGltf from './models/teleport.gltf';
import { createModelContainer } from '../../utils';

// @ts-ignore
// import recorderSongUrl        from "./sounds/recorderSong.mp3"

export interface teleportProps extends objectProps {
	enter: { position: THREE.Vector3; callback?: () => void };
	exit: { position: THREE.Vector3; callback?: () => void };
}

interface oneTeleportProps extends teleportProps {
	teleportCallback: () => void;
}

const teleport: (props: oneTeleportProps) => { callInTick: () => void } = ({ enter, exit, teleportCallback }) => {
	const { physicWorld, scene, gltfLoader } = MOST_IMPORTANT_DATA;

	// load models
	const teleportContainer = createModelContainer({
		gltfLoader,
		containerName: 'teleport',
		modelSrc: teleportModelGltf,
		scale: new THREE.Vector3(0.4, 0.4, 0.4),
	});

	// lights
	const pointLight = new THREE.PointLight('purple', 1);
	pointLight.distance = 2.5;
	pointLight.intensity = 5;
	// physic
	const teleportLeftShape = new CANNON.Box(new CANNON.Vec3(1, 1.8, 0.3));
	const teleportRightShape = new CANNON.Box(new CANNON.Vec3(1, 1.8, 0.3));
	const teleportLeftBody = new CANNON.Body({
		mass: 0,
		shape: teleportLeftShape,
		material: dummyPhysicsMaterial,
	});
	const teleportRightBody = new CANNON.Body({
		mass: 0,
		shape: teleportRightShape,
		material: dummyPhysicsMaterial,
	});

	pointLight.position.set(enter.position.x + 1.5, enter.position.y + 1.85, enter.position.z - 0.2);
	teleportContainer.position.set(enter.position.x + 1.5, enter.position.y + 1.85, enter.position.z);
	teleportLeftBody.position.set(enter.position.x - 0.7, enter.position.y + 1.8, enter.position.z);
	teleportRightBody.position.set(enter.position.x + 3.8, enter.position.y + 1.8, enter.position.z);

	physicWorld.addBody(teleportLeftBody);
	physicWorld.addBody(teleportRightBody);
	scene.add(teleportContainer);
	scene.add(pointLight);

	const raycaster = new THREE.Raycaster();
	const rayOrigin = new THREE.Vector3(enter.position.x, enter.position.y + 0.3, enter.position.z);
	const rayDirection = new THREE.Vector3(1, 0, 0);
	raycaster.far = 2.6;
	raycaster.set(rayOrigin, rayDirection);

	const callInTick = (): void => {
		const intersects = raycaster.intersectObject(CAR_OPTIONS.chassisMesh);
		if (intersects.length) {
			teleportCallback();
			CAR_OPTIONS.chassisBody.position.set(exit.position.x + 2, exit.position.y + 0.1, exit.position.z);
		}
	};

	return {
		callInTick,
	};
};

export const teleportObject: (props: teleportProps) => void = ({ enter, exit }) => {
	const { addToCallInTickStack } = MOST_IMPORTANT_DATA;
	const TELEPORT_OPTIONS = {
		lastTeleport: 0,
		teleportDelta: 500,
	};

	const teleportCallback = (): void => {
		TELEPORT_OPTIONS.lastTeleport = Date.now();
	};

	const { callInTick: callInTickEnter } = teleport({
		enter,
		exit,
		teleportCallback: () => {
			teleportCallback();
			if (exit.callback) exit.callback();
		},
	});
	const { callInTick: callInTickExit } = teleport({
		enter: exit,
		exit: enter,
		teleportCallback: () => {
			teleportCallback();
			if (enter.callback) enter.callback();
		},
	});

	const callInTick: (props: calInTickProps) => void = () => {
		const currentTime = Date.now();
		if (currentTime < TELEPORT_OPTIONS.lastTeleport + TELEPORT_OPTIONS.teleportDelta) return;

		callInTickEnter();
		callInTickExit();
	};
	addToCallInTickStack(callInTick);
};
