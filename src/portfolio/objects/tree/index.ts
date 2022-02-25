import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { copyPositions, createModelContainer } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';
import { DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps, quaternionType } from '../../index';

// @ts-ignore
import bushModelGltf from './models/treeBush.gltf';
// @ts-ignore
import pineModelGltf from './models/treePine.gltf';
// @ts-ignore
import treeSummerModelGltf from './models/treeSummer.gltf';
// @ts-ignore
import treeAutumnModelGltf from './models/treeAutumn.gltf';
// @ts-ignore
import treeAutumn2ModelGltf from './models/treeAutumn2.gltf';

type treeTypes = 'bush' | 'pine' | 'treeSummer' | 'treeAutumn' | 'treeAutumn2';

const trees: treeTypes[] = ['bush', 'pine', 'treeSummer', 'treeAutumn', 'treeAutumn2'];

type treeObjectProps = { type: treeTypes } & objectProps;

export const getRandomTreeAndRotate = (): { tree: treeTypes; quaternion: quaternionType } => {
	const tree: treeTypes = trees[Math.floor(Math.random() * trees.length)];
	const angle: number = Math.random() * Math.PI;
	return {
		tree,
		quaternion: {
			vector: new CANNON.Vec3(0, -1, 0),
			angle,
		},
	};
};

const getModelByType: (type: treeTypes) => any = type => {
	switch (type) {
		case 'bush':
			return {
				modelSrc: bushModelGltf,
				position: new THREE.Vector3(0, -0.5, 0),
				scale: new THREE.Vector3(0.35, 0.35, 0.35),
			};
		case 'pine':
			return {
				modelSrc: pineModelGltf,
				position: new THREE.Vector3(0, -0.5, 0),
				scale: new THREE.Vector3(0.35, 0.35, 0.35),
			};
		case 'treeSummer':
			return {
				modelSrc: treeSummerModelGltf,
				position: new THREE.Vector3(0, -0.5, 0),
				scale: new THREE.Vector3(0.35, 0.35, 0.35),
			};
		case 'treeAutumn':
			return {
				modelSrc: treeAutumnModelGltf,
				position: new THREE.Vector3(0, -0.5, 0),
				scale: new THREE.Vector3(0.35, 0.35, 0.35),
			};
		case 'treeAutumn2':
			return {
				modelSrc: treeAutumn2ModelGltf,
				position: new THREE.Vector3(0, -0.5, 0),
				scale: new THREE.Vector3(0.23, 0.23, 0.23),
			};
		default:
			return {
				modelSrc: bushModelGltf,
				position: new THREE.Vector3(0, -0.5, 0),
				scale: new THREE.Vector3(0.35, 0.35, 0.35),
			};
	}
};

export const treeObject: (props?: treeObjectProps) => void = props => {
	const { scene, physicWorld, gltfLoader } = MOST_IMPORTANT_DATA;
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION, type = 'bush' } = props || {};

	// load models
	const treeContainer = createModelContainer({
		gltfLoader,
		containerName: type,
		...getModelByType(type),
	});

	const bushShape = new CANNON.Sphere(0.6);
	const pineShape = new CANNON.Cylinder(0.1, 0.2, 1, 8);
	const threeSummerShape = new CANNON.Cylinder(0.18, 0.25, 1, 8);
	const treeAutumnShape = new CANNON.Cylinder(0.15, 0.2, 1, 8);
	const treeAutumn2Shape = new CANNON.Cylinder(0.19, 0.24, 1, 8);

	const treeBody = new CANNON.Body({
		mass: 0,
		material: dummyPhysicsMaterial,
	});
	treeBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);

	if (type === 'bush') {
		treeBody.addShape(bushShape);
		treeBody.position.set(position.x, position.y + 0.35, position.z);
	}
	if (type === 'pine') {
		treeBody.addShape(pineShape);
		treeBody.position.set(position.x, position.y + 0.5, position.z);
	}
	if (type === 'treeSummer') {
		treeBody.addShape(threeSummerShape);
		treeBody.position.set(position.x, position.y + 0.5, position.z);
	}
	if (type === 'treeAutumn') {
		treeBody.addShape(treeAutumnShape);
		treeBody.position.set(position.x, position.y + 0.5, position.z);
	}
	if (type === 'treeAutumn2') {
		treeBody.addShape(treeAutumn2Shape);
		treeBody.position.set(position.x, position.y + 0.5, position.z);
	}

	copyPositions({ body: treeBody, mesh: treeContainer });

	physicWorld.addBody(treeBody);
	scene.add(treeContainer);
};
