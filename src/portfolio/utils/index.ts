import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { windowSizesType } from '../index';

export type copyPositionType = {
	body: CANNON.Body | null | undefined;
	mesh: THREE.Mesh | THREE.Group | THREE.Object3D | null | undefined;
	isCopyRotation?: boolean;
	positionOffset?: THREE.Vector3 | CANNON.Vec3;
};

export const copyPositions: (props: copyPositionType) => void = ({ body, mesh, isCopyRotation = true, positionOffset }) => {
	if (!body || !mesh) return;

	mesh.position.x = body.position.x + (positionOffset?.x || 0);
	mesh.position.y = body.position.y + (positionOffset?.y || 0);
	mesh.position.z = body.position.z + (positionOffset?.z || 0);

	if (!isCopyRotation) return;
	mesh.quaternion.copy(new THREE.Quaternion(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w));
};

export type windowResizeUtilProps = {
	windowSizes: windowSizesType;
	renderer: THREE.Renderer;
	callback?: () => void;
};

export const windowResizeUtil: (props: windowResizeUtilProps) => void = ({ windowSizes, renderer, callback }) => {
	windowSizes.width = window.innerWidth;
	windowSizes.height = window.innerHeight;
	renderer.setSize(windowSizes.width, windowSizes.height);
	if (callback) callback();
};

export const sleep: (ms: number) => Promise<unknown> = ms =>
	new Promise(resolve => {
		setTimeout(resolve, ms);
	});

export const updateCOM: (body: CANNON.Body) => void = body => {
	// first calculate the center of mass
	// NOTE: this method assumes all the shapes are voxels of equal mass.
	// If you're not using voxels, you'll need to calculate the COM a different way.
	const com = new CANNON.Vec3();
	body.shapeOffsets.forEach(offset => {
		com.vadd(offset, com);
	});
	com.scale(1 / body.shapes.length, com);

	// move the shapes so the body origin is at the COM
	body.shapeOffsets.forEach(offset => {
		offset.vsub(com, offset);
	});

	// now move the body so the shapes' net displacement is 0
	const worldCOM = new CANNON.Vec3();
	body.vectorToWorldFrame(com, worldCOM);
	body.position.vadd(worldCOM, body.position);
};

type quaternionType = {
	vector: THREE.Vector3;
	angle: number;
};

type loadModelType = {
	containerName: string;
	position?: THREE.Vector3;
	scale?: THREE.Vector3;
	rotation?: quaternionType;
	gltfLoader: GLTFLoader;
	modelSrc: string;
	callback?: (container: THREE.Group, modelScene: THREE.Group) => void;
};

export const createModelContainer: (props: loadModelType) => THREE.Group = props => {
	const { position = new THREE.Vector3(0, 0, 0), scale = new THREE.Vector3(1, 1, 1), rotation, containerName, gltfLoader, modelSrc, callback } = props;
	const container: THREE.Group = new THREE.Group();
	container.name = containerName;

	gltfLoader.load(modelSrc, model => {
		const modelScene = model.scene;
		modelScene.children.forEach(child => {
			child.castShadow = true;
			child.children.forEach(nestChild => {
				nestChild.castShadow = true;
			});
		});
		modelScene.scale.copy(scale);
		modelScene.position.copy(position);
		if (rotation) modelScene.quaternion.setFromAxisAngle(rotation.vector, rotation.angle);
		container.add(modelScene);
		if (callback) callback(container, modelScene);
	});

	return container;
};

export const getUniquePosition = (minRadius: number, levelYOffset: number, positions: THREE.Vector3[]): THREE.Vector3 => {
	const angle = Math.random() * Math.PI * 2;
	const radius = minRadius + Math.random() * 15;
	const x = Math.sin(angle) * radius;
	const z = Math.cos(angle) * radius;
	const vector: THREE.Vector3 = new THREE.Vector3(x, levelYOffset, z);
	const findNear = positions.find(vec => vec.distanceTo(vector) < 4);
	if (findNear) return getUniquePosition(minRadius, levelYOffset, positions);
	return vector;
};
