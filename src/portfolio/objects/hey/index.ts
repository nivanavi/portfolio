import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions, createModelContainer } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';

// @ts-ignore
import heyModelGltf from './models/hey.gltf';
import { callInTickProps, DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps } from '../../index';
import { playSound } from '../../sounds';

export const heyObject: (props?: objectProps) => void = props => {
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION } = props || {};
	const { scene, physicWorld, addToCallInTickStack, gltfLoader } = MOST_IMPORTANT_DATA;

	// load models
	const heyContainer = createModelContainer({
		gltfLoader,
		containerName: 'hey',
		modelSrc: heyModelGltf,
		scale: new THREE.Vector3(0.17, 0.17, 0.17),
	});

	// physic
	const heyShape = new CANNON.Box(new CANNON.Vec3(0.45, 0.25, 0.25));
	const heyBody = new CANNON.Body({
		mass: 2,
		material: dummyPhysicsMaterial,
	});
	heyBody.allowSleep = true;
	heyBody.sleepSpeedLimit = 0.01;
	heyBody.addShape(heyShape);
	heyBody.position.set(position.x, position.y + 0.28, position.z);
	heyBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);

	copyPositions({
		mesh: heyContainer,
		body: heyBody,
	});

	heyBody.addEventListener('collide', (ev: any) => {
		const relativeVelocity = ev.contact.getImpactVelocityAlongNormal();
		playSound('hey', relativeVelocity);
	});

	physicWorld.addBody(heyBody);
	scene.add(heyContainer);

	const callInTick: (propsCalInTick: callInTickProps) => void = () => {
		copyPositions({
			mesh: heyContainer,
			body: heyBody,
		});
	};
	addToCallInTickStack(callInTick);
};
