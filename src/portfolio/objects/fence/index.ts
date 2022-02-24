import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';

// @ts-ignore
import fenceModelGltf from './models/fence.gltf';
import { DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

export const fenceObject: (props?: objectProps) => void = props => {
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION } = props || {};
	const { scene, physicWorld, gltfLoader } = MOST_IMPORTANT_DATA;

	const fenceContainer: THREE.Group = new THREE.Group();
	fenceContainer.name = 'fence';

	// load models
	gltfLoader.load(fenceModelGltf, model => {
		const fenceModel = model.scene;
		fenceModel.children.forEach(child => {
			child.castShadow = true;
		});
		fenceModel.scale.set(0.4, 0.4, 0.4);
		fenceModel.position.set(0, 0, 0);
		fenceContainer.add(fenceModel);
	});

	// physic
	const fenceShape = new CANNON.Box(new CANNON.Vec3(4.45, 0.15, 0.05));
	const fenceBody = new CANNON.Body({
		mass: 0,
		material: dummyPhysicsMaterial,
	});
	fenceBody.addShape(fenceShape);
	fenceBody.position.set(position.x, position.y + 0.18, position.z);
	fenceBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);

	copyPositions({
		mesh: fenceContainer,
		body: fenceBody,
	});

	physicWorld.addBody(fenceBody);
	scene.add(fenceContainer);
};
