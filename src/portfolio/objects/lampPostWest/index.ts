import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions, createModelContainer } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';

// @ts-ignore
import lampPostWestModelGltf from './models/lampPostWest.gltf';
import { DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

export const lampPostWestObject: (props?: objectProps) => void = props => {
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION } = props || {};
	const { scene, physicWorld, gltfLoader } = MOST_IMPORTANT_DATA;

	// load models
	const lampPostWestContainer = createModelContainer({
		gltfLoader,
		containerName: 'lampPostWestWest',
		modelSrc: lampPostWestModelGltf,
		scale: new THREE.Vector3(0.7, 0.7, 0.7),
		position: new THREE.Vector3(0, 0.4, 0),
	});

	// physic
	const lampPostWestShape = new CANNON.Box(new CANNON.Vec3(0.1, 0.7, 0.1));
	const lampPostWestBody = new CANNON.Body({
		mass: 0,
		shape: lampPostWestShape,
		material: dummyPhysicsMaterial,
	});
	lampPostWestBody.allowSleep = true;
	lampPostWestBody.position.set(position.x, position.y + 0.7, position.z);
	lampPostWestBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);

	copyPositions({
		body: lampPostWestBody,
		mesh: lampPostWestContainer,
	});
	physicWorld.addBody(lampPostWestBody);
	scene.add(lampPostWestContainer);
};
