import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions, createModelContainer } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';

// @ts-ignore
import ladderModelGltf from './models/ladder.gltf';
import { calInTickProps, DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

export const ladderObject: (props?: objectProps) => void = props => {
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION } = props || {};
	const { scene, physicWorld, addToCallInTickStack, gltfLoader } = MOST_IMPORTANT_DATA;

	// load models
	const ladderContainer = createModelContainer({
		gltfLoader,
		containerName: 'ladder',
		modelSrc: ladderModelGltf,
		scale: new THREE.Vector3(0.27, 0.27, 0.27),
	});

	// physic
	const ladderShape = new CANNON.Box(new CANNON.Vec3(0.04, 0.77, 0.2));
	const ladderBody = new CANNON.Body({
		mass: 5,
		material: dummyPhysicsMaterial,
	});
	ladderBody.allowSleep = true;
	ladderBody.sleepSpeedLimit = 0.01;
	ladderBody.addShape(ladderShape);
	ladderBody.position.set(position.x, position.y + 1, position.z);
	ladderBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);

	copyPositions({
		mesh: ladderContainer,
		body: ladderBody,
	});

	physicWorld.addBody(ladderBody);
	scene.add(ladderContainer);

	const callInTick: (propsCalInTick: calInTickProps) => void = () => {
		copyPositions({
			mesh: ladderContainer,
			body: ladderBody,
		});
	};
	addToCallInTickStack(callInTick);
};
