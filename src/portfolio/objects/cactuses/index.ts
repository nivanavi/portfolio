import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { copyPositions } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';
import { DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps, quaternionType } from '../../index';

// @ts-ignore
import bigStoneModelGltf from './models/bigStone.gltf';
// @ts-ignore
import middleStoneModelGltf from './models/middleStone.gltf';
// @ts-ignore
import littleStoneModelGltf from './models/littleStone.gltf';
// @ts-ignore
import tripleCactusModelGltf from './models/tripleCactus.gltf';
// @ts-ignore
import doubleCactusModelGltf from './models/doubleCactus.gltf';

type cactusTypes = 'bigStone' | 'middleStone' | 'littleStone' | 'tripleCactus' | 'doubleCactus';

type cactusObjectProps = { type: cactusTypes } & objectProps;

const cactuses: cactusTypes[] = ['bigStone', 'middleStone', 'littleStone', 'tripleCactus', 'doubleCactus'];

export const getRandomCactusAndRotate = (): { cactus: cactusTypes; quaternion: quaternionType } => {
	const cactus: cactusTypes = cactuses[Math.floor(Math.random() * cactuses.length)];
	const angle: number = Math.random() * Math.PI;
	return {
		cactus,
		quaternion: {
			vector: new CANNON.Vec3(0, -1, 0),
			angle,
		},
	};
};

const getModelByType: (type: cactusTypes) => any = type => {
	switch (type) {
		case 'bigStone':
			return bigStoneModelGltf;
		case 'middleStone':
			return middleStoneModelGltf;
		case 'littleStone':
			return littleStoneModelGltf;
		case 'tripleCactus':
			return tripleCactusModelGltf;
		case 'doubleCactus':
			return doubleCactusModelGltf;
		default:
			return littleStoneModelGltf;
	}
};

export const cactusObject: (props?: cactusObjectProps) => void = props => {
	const { scene, physicWorld, gltfLoader } = MOST_IMPORTANT_DATA;
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION, type = 'littleStone' } = props || {};
	const cactusContainer: THREE.Group = new THREE.Group();
	cactusContainer.name = type;

	gltfLoader.load(getModelByType(type), model => {
		const cactusModel = model.scene;
		cactusModel.children.forEach(child => {
			child.castShadow = true;
		});
		cactusModel.scale.set(0.2, 0.2, 0.2);

		if (type === 'bigStone') cactusModel.position.set(0, 0, 0);
		if (type === 'middleStone') cactusModel.position.set(0, 0.1, -0.05);
		if (type === 'littleStone') cactusModel.position.set(0, 0.05, 0);
		if (type === 'tripleCactus') cactusModel.position.set(0, 0.65, 0);
		if (type === 'doubleCactus') cactusModel.position.set(0, 0.38, 0);
		cactusContainer.add(cactusModel);
	});

	const bigStoneShape = new CANNON.Sphere(0.5);
	const middleStoneShape = new CANNON.Sphere(0.4);
	const littleStoneShape = new CANNON.Sphere(0.2);
	const tripleCactusShape = new CANNON.Cylinder(0.2, 0.2, 1, 8);
	const doubleCactusShape = new CANNON.Cylinder(0.2, 0.2, 1, 8);

	const cactusBody = new CANNON.Body({
		mass: 0,
		material: dummyPhysicsMaterial,
	});
	cactusBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);

	if (type === 'bigStone') {
		cactusBody.addShape(bigStoneShape);
		cactusBody.position.set(position.x, position.y + 0.5, position.z);
	}
	if (type === 'middleStone') {
		cactusBody.addShape(middleStoneShape);
		cactusBody.position.set(position.x, position.y + 0.25, position.z);
	}
	if (type === 'littleStone') {
		cactusBody.addShape(littleStoneShape);
		cactusBody.position.set(position.x, position.y + 0.2, position.z);
	}
	if (type === 'tripleCactus') {
		cactusBody.addShape(tripleCactusShape);
		cactusBody.position.set(position.x, position.y + 0.5, position.z);
	}
	if (type === 'doubleCactus') {
		cactusBody.addShape(doubleCactusShape);
		cactusBody.position.set(position.x, position.y + 0.5, position.z);
	}

	copyPositions({ body: cactusBody, mesh: cactusContainer });

	physicWorld.addBody(cactusBody);
	scene.add(cactusContainer);
};
