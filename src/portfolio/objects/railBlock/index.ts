import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';

// @ts-ignore
import railBlockModelGltf from './models/railBlock.gltf';
import { DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

export const railBlockObject: (props?: objectProps) => void = props => {
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION } = props || {};
	const { scene, physicWorld, gltfLoader } = MOST_IMPORTANT_DATA;

	const railBlockContainer: THREE.Group = new THREE.Group();
	railBlockContainer.name = 'railBlock';

	// load models
	gltfLoader.load(railBlockModelGltf, model => {
		const railBlockModel = model.scene;
		railBlockModel.children.forEach(child => {
			child.castShadow = true;
		});
		railBlockModel.scale.set(0.15, 0.15, 0.15);
		railBlockModel.position.set(-0.02, 0.03, 0);
		railBlockContainer.add(railBlockModel);
	});

	// physic
	const railBlockShape = new CANNON.Box(new CANNON.Vec3(0.52, 0.45, 0.6));
	const railBlockBody = new CANNON.Body({
		mass: 0,
		material: dummyPhysicsMaterial,
	});
	railBlockBody.addShape(railBlockShape);
	railBlockBody.position.set(position.x, position.y + 0.45, position.z);
	railBlockBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);

	copyPositions({
		mesh: railBlockContainer,
		body: railBlockBody,
	});

	physicWorld.addBody(railBlockBody);
	scene.add(railBlockContainer);
};
