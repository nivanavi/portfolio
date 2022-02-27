import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions, createModelContainer } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';

// @ts-ignore
import logBenchModelGltf from './models/logBench.gltf';
import { calInTickProps, DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

export const logBenchObject: (props?: objectProps) => void = props => {
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION } = props || {};
	const { scene, physicWorld, addToCallInTickStack, gltfLoader } = MOST_IMPORTANT_DATA;

	// load models
	const logBenchContainer = createModelContainer({
		gltfLoader,
		containerName: 'logBench',
		modelSrc: logBenchModelGltf,
		scale: new THREE.Vector3(0.15, 0.15, 0.15),
	});

	// physic
	const logBenchShape = new CANNON.Box(new CANNON.Vec3(0.2, 0.12, 0.9));
	const logBenchBody = new CANNON.Body({
		mass: 5,
		material: dummyPhysicsMaterial,
	});
	logBenchBody.allowSleep = true;
	logBenchBody.sleepSpeedLimit = 0.01;
	logBenchBody.addShape(logBenchShape);
	logBenchBody.position.set(position.x, position.y + 0.28, position.z);
	logBenchBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);

	copyPositions({
		mesh: logBenchContainer,
		body: logBenchBody,
	});

	physicWorld.addBody(logBenchBody);
	scene.add(logBenchContainer);

	const callInTick: (propsCalInTick: calInTickProps) => void = () => {
		copyPositions({
			mesh: logBenchContainer,
			body: logBenchBody,
		});
	};
	addToCallInTickStack(callInTick);
};
