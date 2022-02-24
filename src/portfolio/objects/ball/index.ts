import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';

// @ts-ignore
import ballModelGltf from './models/ball.gltf';
import { calInTickProps, DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

export const ballObject: (props: objectProps) => void = props => {
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION } = props || {};
	const { scene, physicWorld, addToCallInTickStack, gltfLoader } = MOST_IMPORTANT_DATA;

	const ballContainer: THREE.Group = new THREE.Group();
	ballContainer.name = 'ball';

	// load models
	gltfLoader.load(ballModelGltf, model => {
		const ballModel = model.scene;
		ballModel.children.forEach(child => {
			child.castShadow = true;
			child.children.forEach(nestChild => {
				nestChild.castShadow = true;
			});
		});
		ballModel.scale.set(0.6, 0.6, 0.6);
		ballModel.position.set(0, 0, 0);
		ballContainer.add(ballModel);
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
