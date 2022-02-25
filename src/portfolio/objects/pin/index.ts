import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions, createModelContainer, updateCOM } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';

// @ts-ignore
import pinModelGltf from './models/pin.gltf';
import { calInTickProps, DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

export const pinObject: (props: objectProps) => void = props => {
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION } = props || {};
	const { scene, physicWorld, addToCallInTickStack, gltfLoader } = MOST_IMPORTANT_DATA;

	// load models
	const pinContainer = createModelContainer({
		gltfLoader,
		containerName: 'pin',
		modelSrc: pinModelGltf,
		scale: new THREE.Vector3(0.2, 0.2, 0.2),
		position: new THREE.Vector3(0, 0.1, 0),
	});

	// physic
	const pinBottomShape = new CANNON.Cylinder(0.18, 0.18, 0.2, 16);
	const pinBodyShape = new CANNON.Cylinder(0.25, 0.25, 0.4, 16);
	const pinNeckShape = new CANNON.Cylinder(0.15, 0.15, 0.4, 16);
	const pinHeadShape = new CANNON.Cylinder(0.17, 0.17, 0.4, 16);
	const pinBody = new CANNON.Body({
		mass: 0.1,
		material: dummyPhysicsMaterial,
	});

	pinBody.allowSleep = true;
	pinBody.sleepSpeedLimit = 0.01;
	pinBody.addShape(pinBottomShape, new CANNON.Vec3(0, 0, 0));
	pinBody.addShape(pinBodyShape, new CANNON.Vec3(0, 0.3, 0));
	pinBody.addShape(pinNeckShape, new CANNON.Vec3(0, 0.7, 0));
	pinBody.addShape(pinHeadShape, new CANNON.Vec3(0, 1.1, 0));
	pinBody.position.set(position.x, position.y + 0.3, position.z);
	pinBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);

	updateCOM(pinBody);

	copyPositions({
		mesh: pinContainer,
		body: pinBody,
	});

	physicWorld.addBody(pinBody);
	scene.add(pinContainer);

	const callInTick: (propsCalInTick: calInTickProps) => void = () => {
		copyPositions({
			mesh: pinContainer,
			body: pinBody,
		});
	};
	addToCallInTickStack(callInTick);
};
