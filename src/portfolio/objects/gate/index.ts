import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';

// @ts-ignore
import gateModelGltf from './models/gate.gltf';
// @ts-ignore
import gateStandModelGltf from './models/gateStand.gltf';

import { calInTickProps, DEFAULT_POSITION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

type gateObjectProps = { isRevers?: boolean } & objectProps;

export const gateObject: (props: gateObjectProps) => void = props => {
	const { position = DEFAULT_POSITION, isRevers = false } = props || {};
	const { scene, physicWorld, addToCallInTickStack, gltfLoader } = MOST_IMPORTANT_DATA;

	const gateContainer: THREE.Group = new THREE.Group();
	gateContainer.name = 'gate';

	const gateStandContainer: THREE.Group = new THREE.Group();
	gateStandContainer.name = 'gateStand';

	// load models
	gltfLoader.load(gateModelGltf, model => {
		const gateModel = model.scene;
		gateModel.children.forEach(child => {
			child.castShadow = true;
			child.children.forEach(nestChild => {
				nestChild.castShadow = true;
			});
		});
		gateModel.scale.set(0.25, 0.25, 0.25);
		gateModel.position.set(0, 0, 0);
		if (isRevers) gateModel.rotation.y = Math.PI;
		gateContainer.add(gateModel);
	});
	gltfLoader.load(gateStandModelGltf, model => {
		const gateStandModel = model.scene;
		gateStandModel.children.forEach(child => {
			child.castShadow = true;
			child.children.forEach(nestChild => {
				nestChild.castShadow = true;
			});
		});
		gateStandModel.scale.set(0.25, 0.25, 0.25);
		gateStandModel.position.set(0, 0, 0);
		gateStandContainer.add(gateStandModel);
	});

	// physic
	const gateShape = new CANNON.Box(new CANNON.Vec3(0.035, 0.5, 0.6));
	const gateStandShape = new CANNON.Box(new CANNON.Vec3(0.085, 0.6, 0.085));

	const gateBody = new CANNON.Body({ mass: 1, material: dummyPhysicsMaterial });
	gateBody.addShape(gateShape);
	gateBody.allowSleep = true;
	gateBody.sleepSpeedLimit = 0.01;

	const gateStandBody = new CANNON.Body({ mass: 0, material: dummyPhysicsMaterial });
	gateStandBody.addShape(gateStandShape);
	gateStandBody.allowSleep = true;
	gateStandBody.sleepSpeedLimit = 0.01;

	gateStandBody.position.set(position.x, position.y + 0.6, position.z);
	gateBody.position.set(position.x + (isRevers ? -2 : 2), position.y + 0.6, position.z);

	const privotStandTop = new CANNON.Vec3(isRevers ? -0.15 : 0.15, 1.2, 0);
	const privotGateTop = new CANNON.Vec3(0, 1.2, isRevers ? -0.6 : 0.6);
	const privotStandBottom = new CANNON.Vec3(isRevers ? -0.15 : 0.15, 0, 0);
	const privotGateBottom = new CANNON.Vec3(0, 0, isRevers ? -0.6 : 0.6);
	const constraintTop = new CANNON.PointToPointConstraint(gateStandBody, privotStandTop, gateBody, privotGateTop, 15);
	const constraintBottom = new CANNON.PointToPointConstraint(gateStandBody, privotStandBottom, gateBody, privotGateBottom, 15);
	physicWorld.addConstraint(constraintTop);
	physicWorld.addConstraint(constraintBottom);
	physicWorld.addBody(gateBody);
	physicWorld.addBody(gateStandBody);

	copyPositions({
		mesh: gateContainer,
		body: gateBody,
	});

	copyPositions({
		mesh: gateStandContainer,
		body: gateStandBody,
	});

	scene.add(gateContainer);
	scene.add(gateStandContainer);

	const callInTick: (propsCalInTick: calInTickProps) => void = () => {
		copyPositions({
			mesh: gateContainer,
			body: gateBody,
		});
	};
	addToCallInTickStack(callInTick);
};
