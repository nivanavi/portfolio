import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';
import { calInTickProps, MOST_IMPORTANT_DATA } from '../../index';
import { CAR_OPTIONS } from '../car';

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
	const { physicWorld, scene } = MOST_IMPORTANT_DATA;

	const teleportMaterial = new THREE.MeshStandardMaterial({
		color: 'yellow',
	});
	const teleportGeometry = new THREE.BoxBufferGeometry(0.4, 4, 0.4);

	const teleportLeftMesh = new THREE.Mesh(teleportGeometry, teleportMaterial);
	const teleportRightMesh = new THREE.Mesh(teleportGeometry, teleportMaterial);
	teleportLeftMesh.receiveShadow = true;
	teleportRightMesh.receiveShadow = true;

	// physic
	const teleportShape = new CANNON.Box(new CANNON.Vec3(0.2, 2, 0.2));
	const teleportLeftBody = new CANNON.Body({
		mass: 0,
		shape: teleportShape,
		material: dummyPhysicsMaterial,
	});
	const teleportRightBody = new CANNON.Body({
		mass: 0,
		shape: teleportShape,
		material: dummyPhysicsMaterial,
	});

	teleportLeftBody.position.set(enter.position.x, enter.position.y, enter.position.z);
	teleportRightBody.position.set(exit.position.x + 3, exit.position.y, exit.position.z);

	copyPositions({
		body: teleportLeftBody,
		mesh: teleportLeftMesh,
	});
	copyPositions({
		body: teleportRightBody,
		mesh: teleportRightMesh,
	});

	physicWorld.addBody(teleportLeftBody);
	physicWorld.addBody(teleportRightBody);
	scene.add(teleportLeftMesh, teleportRightMesh);

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
