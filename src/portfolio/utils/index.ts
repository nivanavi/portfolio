import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { windowSizesType } from '../index';

export type copyPositionType = {
	body: CANNON.Body | null | undefined;
	mesh: THREE.Mesh | THREE.Group | null | undefined;
	isCopyRotation?: boolean;
	positionOffset?: THREE.Vector3 | CANNON.Vec3;
};

export const copyPositions: (props: copyPositionType) => void = ({ body, mesh, isCopyRotation = true, positionOffset }) => {
	if (!body || !mesh) return console.log('U try copy position of null');

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
