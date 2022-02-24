import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Howl } from 'howler';
import { copyPositions, copyPositionType } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';
import { calInTickProps, DEFAULT_POSITION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

// @ts-ignore
import recorderSongUrl from './sounds/brickSound.mp3';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import brickModelGltf from './models/brick.gltf';

type createWallProps = {
	brickInRows: number;
	rows: number;
	isYDirection?: boolean;
};

type wallObjectProps = createWallProps & objectProps;

const brickPlayer = new Howl({
	src: [recorderSongUrl],
	volume: 0.5,
	html5: true,
});

export const BRICK_OPTION = {
	width: 0.3,
	height: 0.26,
	depth: 0.53,
	mass: 0.5,
	lastPlaySound: 0,
	soundDelta: 100,
};

export const wallObject: (props?: wallObjectProps) => void = props => {
	const { position = DEFAULT_POSITION, rows = 1, brickInRows = 1, isYDirection = false } = props || {};
	const { scene, physicWorld, addToCallInTickStack, gltfLoader } = MOST_IMPORTANT_DATA;

	const brickContainer: THREE.Group = new THREE.Group();
	brickContainer.name = 'brick';

	const brickShape = new CANNON.Box(new CANNON.Vec3(BRICK_OPTION.width * 0.5, BRICK_OPTION.height * 0.5, BRICK_OPTION.depth * 0.5));

	const bricks: copyPositionType[] = [];

	const createBrick: (brickPosition: CANNON.Vec3) => void = brickPosition => {
		const body = new CANNON.Body({
			mass: BRICK_OPTION.mass,
			material: dummyPhysicsMaterial,
		});
		body.addShape(brickShape);
		body.allowSleep = true;
		// body.sleepSpeedLimit = 0.01;
		body.position.copy(brickPosition);
		if (!isYDirection) body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, -1, 0), Math.PI * 0.5);
		const mesh = brickContainer.clone();

		physicWorld.addBody(body);
		scene.add(mesh);

		bricks.push({
			mesh,
			body,
		});

		body.addEventListener('collide', (ev: any) => {
			const force: number = ev.contact.getImpactVelocityAlongNormal();
			const currentTime = Date.now();
			if (currentTime < BRICK_OPTION.lastPlaySound + BRICK_OPTION.soundDelta || force < 0.7) return;
			BRICK_OPTION.lastPlaySound = currentTime;
			const volume = Math.min(Math.max((force - 0.7) * 0.75, 0.2), 0.85) ** 2;
			brickPlayer.volume(volume);
			brickPlayer.play();
		});
	};

	const createWall: () => void = () => {
		Array.from({ length: rows }).forEach((_, rowIndex) => {
			const isLastRow: boolean = rowIndex + 1 === rows;
			const isEven: boolean = rowIndex % 2 === 0;
			const rowPosition = new CANNON.Vec3();
			if (!isYDirection) rowPosition.set(isEven ? position.x : position.x + BRICK_OPTION.depth * 0.5, position.y + rowIndex * BRICK_OPTION.height + 0.2, position.z);
			if (isYDirection) rowPosition.set(position.x, position.y + rowIndex * BRICK_OPTION.height + 0.2, isEven ? position.z : position.z + BRICK_OPTION.depth * 0.5);
			Array.from({ length: brickInRows }).forEach((__, brickIndex) => {
				const isLastBrick: boolean = brickIndex + 1 === brickInRows;
				if (isLastBrick && isLastRow) return;
				const isEvenBrick: boolean = brickIndex % 2 === 0;
				const brickPosition = new CANNON.Vec3().copy(rowPosition);
				if (!isYDirection) brickPosition.x = rowPosition.x + brickIndex * BRICK_OPTION.depth + (isEvenBrick ? 0.02 : 0);
				if (isYDirection) brickPosition.z = rowPosition.z + brickIndex * BRICK_OPTION.depth + (isEvenBrick ? 0.02 : 0);
				createBrick(brickPosition);
			});
		});
	};

	// load models
	gltfLoader.load(brickModelGltf, model => {
		const brickModel = model.scene;
		brickModel.children.forEach(child => {
			child.castShadow = true;
			child.children.forEach(nestChild => {
				nestChild.castShadow = true;
			});
		});
		brickModel.scale.set(0.25, 0.25, 0.25);
		brickModel.position.set(0, 0, 0);
		brickContainer.add(brickModel);
		createWall();
		setTimeout(() => {
			bricks.forEach(({ body }) => {
				if (!body) return;
				body.sleepSpeedLimit = 0.01;
			});
		}, 2000);
	});

	const callInTick: (propsCalInTick: calInTickProps) => void = () => bricks.forEach(brick => copyPositions(brick));
	addToCallInTickStack(callInTick);
};
