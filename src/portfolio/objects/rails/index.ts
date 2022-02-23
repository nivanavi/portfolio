import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { dummyPhysicsMaterial } from '../../physics';
import { DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

// @ts-ignore
import railsModelGltf from './models/rails.gltf';

export const railsObject: (props?: objectProps) => void = props => {
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION } = props || {};
	const { scene, physicWorld, gltfLoader } = MOST_IMPORTANT_DATA;

	const railsContainer: THREE.Group = new THREE.Group();
	railsContainer.name = 'rails';

	// load models
	gltfLoader.load(railsModelGltf, model => {
		const railsModel = model.scene;
		railsModel.children.forEach(child => {
			child.castShadow = true;
		});
		railsModel.scale.set(0.25, 0.25, 0.25);
		railsContainer.add(railsModel);
	});

	railsContainer.position.copy(position);

	// // physic
	const leftRailShape = new CANNON.Box(new CANNON.Vec3(11, 0.03, 0.05));
	const rightRailShape = new CANNON.Box(new CANNON.Vec3(11.2, 0.03, 0.05));
	const leftRail = new CANNON.Body({
		mass: 0,
		material: dummyPhysicsMaterial,
	});
	const rightRail = new CANNON.Body({
		mass: 0,
		material: dummyPhysicsMaterial,
	});
	leftRail.addShape(leftRailShape);
	rightRail.addShape(rightRailShape);
	leftRail.position.set(position.x + 1, position.y + 0.04, position.z - 0.41);
	rightRail.position.set(position.x + 0.4, position.y + 0.04, position.z + 0.4);
	leftRail.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);
	rightRail.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);

	physicWorld.addBody(leftRail);
	physicWorld.addBody(rightRail);
	scene.add(railsContainer);
};
