import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions, createModelContainer } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';

// @ts-ignore
import benchModelGltf from './models/bench.gltf';
import { calInTickProps, DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

export const benchObject: (props?: objectProps) => void = props => {
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION } = props || {};
	const { scene, physicWorld, addToCallInTickStack, gltfLoader } = MOST_IMPORTANT_DATA;

	// load models
	const benchContainer = createModelContainer({
		gltfLoader,
		containerName: 'bench',
		modelSrc: benchModelGltf,
		scale: new THREE.Vector3(0.27, 0.27, 0.27),
	});

	// physic
	const benchShape = new CANNON.Box(new CANNON.Vec3(0.46, 0.28, 0.3));
	const benchBody = new CANNON.Body({
		mass: 5,
		material: dummyPhysicsMaterial,
	});
	benchBody.allowSleep = true;
	benchBody.sleepSpeedLimit = 0.01;
	benchBody.addShape(benchShape);
	benchBody.position.set(position.x, position.y + 0.28, position.z);
	benchBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);

	copyPositions({
		mesh: benchContainer,
		body: benchBody,
	});

	physicWorld.addBody(benchBody);
	scene.add(benchContainer);

	// benchBody.addEventListener("collide", (ev: any) => {
	//   if (ev.contact.getImpactVelocityAlongNormal() < 1.2 || bench_OPTIONS.isAlreadyAnimated || !dolphinAnimation) return;
	//   bench_OPTIONS.isAlreadyAnimated = true;
	//   dolphinAnimation.paused = false;
	//   setTimeout(() => {
	//     dolphinAnimation!.paused = true
	//     bench_OPTIONS.isAlreadyAnimated = false;
	//   }, 683)
	// })

	const callInTick: (propsCalInTick: calInTickProps) => void = () => {
		copyPositions({
			mesh: benchContainer,
			body: benchBody,
		});
	};
	addToCallInTickStack(callInTick);
};
