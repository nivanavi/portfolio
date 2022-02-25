import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { dummyPhysicsMaterial } from '../../physics';

// @ts-ignore
import waterTowerModelGltf from './models/waterTower.gltf';
import { DEFAULT_POSITION, MOST_IMPORTANT_DATA, objectProps } from '../../index';
import { createModelContainer } from '../../utils';

export const waterTowerObject: (props?: objectProps) => void = props => {
	const { position = DEFAULT_POSITION } = props || {};
	const { scene, physicWorld, gltfLoader } = MOST_IMPORTANT_DATA;

	// load models
	const waterTowerContainer = createModelContainer({
		gltfLoader,
		containerName: 'waterTower',
		modelSrc: waterTowerModelGltf,
		scale: new THREE.Vector3(0.12, 0.12, 0.12),
		position: new THREE.Vector3(0, 2.25, 0),
		rotation: {
			vector: new THREE.Vector3(0, -1, 0),
			angle: Math.PI * 1.785,
		},
	});
	waterTowerContainer.position.copy(position);

	// physic
	const waterTowerShape = new CANNON.Box(new CANNON.Vec3(0.1, 1, 0.1));
	const waterTowerLeg1 = new CANNON.Body({
		mass: 0,
		material: dummyPhysicsMaterial,
	});
	const waterTowerLeg2 = new CANNON.Body({
		mass: 0,
		material: dummyPhysicsMaterial,
	});
	const waterTowerLeg3 = new CANNON.Body({
		mass: 0,
		material: dummyPhysicsMaterial,
	});
	const waterTowerLeg4 = new CANNON.Body({
		mass: 0,
		material: dummyPhysicsMaterial,
	});
	waterTowerLeg1.addShape(waterTowerShape);
	waterTowerLeg2.addShape(waterTowerShape);
	waterTowerLeg3.addShape(waterTowerShape);
	waterTowerLeg4.addShape(waterTowerShape);

	waterTowerLeg1.position.set(position.x - 0.1, position.y + 0.5, position.z + 1.2);
	waterTowerLeg2.position.set(position.x + 0.15, position.y + 0.5, position.z - 1.3);
	waterTowerLeg3.position.set(position.x + 1.3, position.y + 0.5, position.z + 0.1);
	waterTowerLeg4.position.set(position.x - 1.2, position.y + 0.5, position.z - 0.12);

	physicWorld.addBody(waterTowerLeg1);
	physicWorld.addBody(waterTowerLeg2);
	physicWorld.addBody(waterTowerLeg3);
	physicWorld.addBody(waterTowerLeg4);
	scene.add(waterTowerContainer);
};
