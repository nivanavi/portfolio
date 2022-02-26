import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions, createModelContainer } from '../../utils';

// @ts-ignore
import recorderModelGltf from './models/recorder.gltf';

import { dummyPhysicsMaterial } from '../../physics';
import { calInTickProps, DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

export const RECORDER_OPTIONS = {
	isPlay: false,
	maxVolume: 0.5,
	lastTouche: 0,
	toucheDelta: 200,
};

// const getVolumeByDistance: (distance: number) => number = distance => RECORDER_OPTIONS.maxVolume / distance;

export const recorderObject: (props?: objectProps) => void = props => {
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION } = props || {};
	const { scene, physicWorld, gltfLoader, addToCallInTickStack } = MOST_IMPORTANT_DATA;

	// load models
	const recorderContainer = createModelContainer({
		gltfLoader,
		containerName: 'recorder',
		modelSrc: recorderModelGltf,
		scale: new THREE.Vector3(0.14, 0.12, 0.12),
	});

	// physic
	const recorderShape = new CANNON.Box(new CANNON.Vec3(0.09, 0.12, 0.235));
	const recorderBody = new CANNON.Body({
		mass: 5,
		material: dummyPhysicsMaterial,
	});
	recorderBody.allowSleep = true;
	recorderBody.sleepSpeedLimit = 0.01;
	recorderBody.addShape(recorderShape);
	recorderBody.position.set(position.x, position.y + 0.35, position.z);
	recorderBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);

	recorderBody.addEventListener('collide', (ev: any) => {
		if (ev.body.mass === 0 || ev.contact.getImpactVelocityAlongNormal() < 1.2) return;
		const currentTime = Date.now();
		if (currentTime < RECORDER_OPTIONS.lastTouche + RECORDER_OPTIONS.toucheDelta) return;
		RECORDER_OPTIONS.lastTouche = currentTime;
		RECORDER_OPTIONS.isPlay = !RECORDER_OPTIONS.isPlay;

		// if (RECORDER_OPTIONS.isPlay) return recorderPlayer.play();
		// return recorderPlayer.stop();
	});

	physicWorld.addBody(recorderBody);
	scene.add(recorderContainer);

	const callInTick: (propsCalInTick: calInTickProps) => void = () => {
		// recorderPlayer.volume(getVolumeByDistance(recorderBody.position.distanceTo(CAR_DYNAMIC_OPTIONS.oldPosition)));
		copyPositions({
			body: recorderBody,
			mesh: recorderContainer,
		});
	};

	addToCallInTickStack(callInTick);
};
