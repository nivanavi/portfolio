import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';

// @ts-ignore
import poolModelGltf from './models/fontain.gltf';
import { calInTickProps, DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps } from '../../index';
import { waterVertexShader } from './shaders/waterVertexShader';
import { waterFragmentsShader } from './shaders/waterFragmentsShader';

export const poolObject: (props?: objectProps) => void = props => {
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION } = props || {};
	const { scene, physicWorld, addToCallInTickStack, gltfLoader } = MOST_IMPORTANT_DATA;

	const POOL_OPTIONS = {
		isAlreadyAnimated: false,
	};

	const poolContainer: THREE.Group = new THREE.Group();
	poolContainer.name = 'pool';

	// water shaders
	const waterMaterial = new THREE.ShaderMaterial({
		uniforms: {
			uTime: { value: 0 },
			upperColor: { value: new THREE.Color('#125e44') },
			depthColor: { value: new THREE.Color('#09d2c8') },
			elevationLevel: { value: 0.07 },
		},
		vertexShader: waterVertexShader,
		fragmentShader: waterFragmentsShader,
	});

	const waterMesh = new THREE.Mesh();
	waterMesh.material = waterMaterial;
	waterMesh.scale.set(0.347, 0.347, 0.347);

	let mixer: null | THREE.AnimationMixer = null;
	let dolphinAnimation: null | THREE.AnimationAction = null;
	// graphic
	// load models
	gltfLoader.load(poolModelGltf, model => {
		const poolModel = model.scene;
		poolModel.children.forEach(child => {
			child.castShadow = true;
		});
		waterMesh.geometry = (poolModel.children.find(({ name }) => name === 'water') as any).geometry;
		poolModel.children = poolModel.children.filter(({ name }) => name !== 'water');
		poolContainer.add(waterMesh);

		mixer = new THREE.AnimationMixer(poolModel);
		dolphinAnimation = mixer.clipAction(model.animations[0]);
		dolphinAnimation.paused = true;
		dolphinAnimation.repetitions = 1;
		dolphinAnimation.play();
		poolModel.scale.set(0.347, 0.347, 0.347);
		poolModel.position.set(0, -0.15, 0);
		poolContainer.add(poolModel);
	});

	// physic
	const poolShape = new CANNON.Cylinder(2.2, 2.2, 0.3, 32);
	const poolBody = new CANNON.Body({
		mass: 0,
		shape: poolShape,
		material: dummyPhysicsMaterial,
	});
	poolBody.allowSleep = true;
	poolBody.position.set(position.x, position.y + 0.15, position.z);
	poolBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);

	poolBody.addEventListener('collide', (ev: any) => {
		if (ev.contact.getImpactVelocityAlongNormal() < 1.2 || POOL_OPTIONS.isAlreadyAnimated || !dolphinAnimation) return;
		POOL_OPTIONS.isAlreadyAnimated = true;
		dolphinAnimation.reset();
		setTimeout(() => {
			POOL_OPTIONS.isAlreadyAnimated = false;
		}, 1000);
	});

	copyPositions({
		body: poolBody,
		mesh: poolContainer,
	});
	physicWorld.addBody(poolBody);
	scene.add(poolContainer);

	const callInTick: (propsCalInTick: calInTickProps) => void = ({ graphicDelta, time }) => {
		waterMaterial.uniforms.uTime.value = time * 3;

		if (mixer) mixer.update(graphicDelta * 15);
	};
	addToCallInTickStack(callInTick);
};
