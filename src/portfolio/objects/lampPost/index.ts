import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { Howl } from 'howler';
import { copyPositions, sleep } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';

// @ts-ignore
import lampPostModelGltf from './models/lampPost.gltf';
// @ts-ignore
import lampBrokenSong from './sounds/lampBroken.mp3';
import { DEFAULT_POSITION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

const recorderPlayer = new Howl({
	src: [lampBrokenSong],
	html5: true,
	volume: 0.5,
	loop: false,
});

export const lampPostObject: (props?: objectProps) => void = props => {
	const { position = DEFAULT_POSITION } = props || {};
	const { scene, physicWorld, gltfLoader } = MOST_IMPORTANT_DATA;

	const LAMP_POST_OPTIONS = {
		isAlreadyBroken: false,
	};

	const lampPostContainer: THREE.Group = new THREE.Group();
	let lampLight: THREE.Object3D = new THREE.Object3D();
	lampPostContainer.name = 'lampPost';
	// graphic
	// load models
	gltfLoader.load(lampPostModelGltf, model => {
		const lampPostModel = model.scene;
		lampPostModel.children.forEach(child => {
			child.castShadow = true;
			child.children.forEach(nestChild => {
				nestChild.castShadow = true;
			});
		});
		// lampPostModel.children.forEach(child => child.name === "lampPostLight" ? child.children[0].castShadow = true : undefined)
		lampPostModel.children.forEach(child => {
			if (child.name === 'lampPostLight') lampLight = child.children[0];
		});
		lampPostModel.scale.set(0.18, 0.18, 0.18);
		lampPostModel.position.set(0, -0.7, 0);
		lampPostContainer.add(lampPostModel);
	});

	// physic
	const lampPostShape = new CANNON.Box(new CANNON.Vec3(0.1, 0.7, 0.1));
	const lampPostBody = new CANNON.Body({
		mass: 0,
		shape: lampPostShape,
		material: dummyPhysicsMaterial,
	});

	lampPostBody.allowSleep = true;
	lampPostBody.position.set(position.x, position.y + 0.7, position.z);

	const brokeLamp: () => void = async () => {
		if (!lampLight.children[0]) return;
		if (!lampLight.children[0].parent) return;
		(lampLight.children[0].parent as THREE.SpotLight).intensity = 0;
		await sleep(300);
		(lampLight.children[0].parent as THREE.SpotLight).intensity = 0.5;
		await sleep(250);
		(lampLight.children[0].parent as THREE.SpotLight).intensity = 0;
		await sleep(200);
		(lampLight.children[0].parent as THREE.SpotLight).intensity = 0.5;
		await sleep(450);
		(lampLight.children[0].parent as THREE.SpotLight).intensity = 0;
	};

	lampPostBody.addEventListener('collide', (ev: any) => {
		if (ev.contact.getImpactVelocityAlongNormal() < 1.2 || LAMP_POST_OPTIONS.isAlreadyBroken) return;
		LAMP_POST_OPTIONS.isAlreadyBroken = true;
		recorderPlayer.play();
		brokeLamp();
	});

	copyPositions({
		body: lampPostBody,
		mesh: lampPostContainer,
	});
	physicWorld.addBody(lampPostBody);
	scene.add(lampPostContainer);
};
