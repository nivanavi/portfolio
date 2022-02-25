import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions, createModelContainer } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';

// @ts-ignore
import barrelModelGltf from './models/barrel.gltf';
import { calInTickProps, DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

export const barrelObject: (props: objectProps) => void = props => {
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION } = props || {};
	const { scene, physicWorld, addToCallInTickStack, gltfLoader } = MOST_IMPORTANT_DATA;

	// load models
	const barrelContainer = createModelContainer({
		gltfLoader,
		containerName: 'barrel',
		modelSrc: barrelModelGltf,
		scale: new THREE.Vector3(0.25, 0.25, 0.25),
	});

	// physic
	const barrelShape = new CANNON.Cylinder(0.25, 0.25, 0.58, 12);
	const barrelBody = new CANNON.Body({
		mass: 1,
		material: dummyPhysicsMaterial,
	});
	barrelBody.allowSleep = true;
	barrelBody.sleepSpeedLimit = 0.01;
	barrelBody.addShape(barrelShape);
	barrelBody.position.set(position.x, position.y + 0.28, position.z);
	barrelBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);

	copyPositions({
		mesh: barrelContainer,
		body: barrelBody,
	});

	physicWorld.addBody(barrelBody);
	scene.add(barrelContainer);

	const callInTick: (propsCalInTick: calInTickProps) => void = () => {
		copyPositions({
			mesh: barrelContainer,
			body: barrelBody,
		});
	};
	addToCallInTickStack(callInTick);
};
