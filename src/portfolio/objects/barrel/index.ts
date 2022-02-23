import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';

// @ts-ignore
import barrelModelGltf from './models/barrel.gltf';
import { calInTickProps, DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

export const barrelObject: (props: objectProps) => void = props => {
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION } = props || {};
	const { scene, physicWorld, addToCallInTickStack, gltfLoader } = MOST_IMPORTANT_DATA;

	const barrelContainer: THREE.Group = new THREE.Group();
	barrelContainer.name = 'barrel';

	// load models
	gltfLoader.load(barrelModelGltf, model => {
		const barrelModel = model.scene;
		barrelModel.children.forEach(child => {
			child.castShadow = true;
			child.children.forEach(nestChild => {
				nestChild.castShadow = true;
			});
		});
		barrelModel.scale.set(0.25, 0.25, 0.25);
		barrelModel.position.set(0, 0, 0);
		barrelContainer.add(barrelModel);
	});

	// physic
	const barrelShape = new CANNON.Cylinder(0.25, 0.25, 0.58, 12);
	const barrelBody = new CANNON.Body({
		mass: 3,
		material: dummyPhysicsMaterial,
	});
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
