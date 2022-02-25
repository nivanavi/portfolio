import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions, createModelContainer } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';

// @ts-ignore
import ballModelGltf from './models/ball.gltf';
import { calInTickProps, DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

export const ballObject: (props: objectProps) => void = props => {
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION } = props || {};
	const { scene, physicWorld, addToCallInTickStack, gltfLoader } = MOST_IMPORTANT_DATA;

	// load models
	const ballContainer = createModelContainer({
		gltfLoader,
		containerName: 'ball',
		modelSrc: ballModelGltf,
		scale: new THREE.Vector3(0.6, 0.6, 0.6),
	});

	// physic
	const ballShape = new CANNON.Sphere(0.6);
	const ballBody = new CANNON.Body({
		mass: 3,
		material: dummyPhysicsMaterial,
	});
	ballBody.allowSleep = true;
	ballBody.sleepSpeedLimit = 0.01;
	ballBody.addShape(ballShape);
	ballBody.position.set(position.x, position.y + 0.8, position.z);
	ballBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);

	copyPositions({
		mesh: ballContainer,
		body: ballBody,
	});

	physicWorld.addBody(ballBody);
	scene.add(ballContainer);

	const callInTick: (propsCalInTick: calInTickProps) => void = () => {
		copyPositions({
			mesh: ballContainer,
			body: ballBody,
		});
	};
	addToCallInTickStack(callInTick);
};
