import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions } from '../../utils';
import { groundPhysicsMaterial } from '../../physics';

// @ts-ignore
import rampModelGltf from './models/ramp.gltf';
import { DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

export const rampObject: (props?: objectProps) => void = props => {
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION } = props || {};
	const { scene, physicWorld, gltfLoader } = MOST_IMPORTANT_DATA;

	const rampContainer: THREE.Group = new THREE.Group();
	rampContainer.name = 'ramp';

	// load models
	gltfLoader.load(rampModelGltf, model => {
		const rampModel = model.scene;
		rampModel.children.forEach(child => {
			child.castShadow = true;
		});
		rampModel.scale.set(0.4, 0.4, 0.4);
		rampModel.position.set(0, 0.34, 0);
		rampModel.rotation.x = Math.PI / 11;
		rampContainer.add(rampModel);
	});

	// physic
	const rampShape = new CANNON.Box(new CANNON.Vec3(0.8, 0.4, 1.22));
	const rampBody = new CANNON.Body({
		mass: 0,
		material: groundPhysicsMaterial,
	});
	rampBody.addShape(rampShape);
	rampBody.position.set(position.x, position.y + 0.05, position.z);
	const quaternionX = new CANNON.Quaternion();
	const quaternionUser = new CANNON.Quaternion();
	quaternionX.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 11);
	quaternionUser.setFromAxisAngle(quaternion.vector, quaternion.angle);
	const quaternionResult = quaternionUser.mult(quaternionX);
	quaternionResult.normalize();

	rampBody.quaternion = quaternionResult;

	copyPositions({
		mesh: rampContainer,
		body: rampBody,
	});

	physicWorld.addBody(rampBody);
	scene.add(rampContainer);
};
