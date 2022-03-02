import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { copyPositions, copyPositionType, createModelContainer } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';
import { callInTickProps, DEFAULT_POSITION, MOST_IMPORTANT_DATA, objectProps } from '../../index';

// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import brickModelGltf from './models/brick.gltf';
import { playSound } from '../../sounds';

type createWallProps = {
	brickInRows: number;
	rows: number;
	isYDirection?: boolean;
};

type wallObjectProps = createWallProps & objectProps;

export const BRICK_OPTION = {
	width: 0.3,
	height: 0.26,
	depth: 0.53,
	mass: 0.5,
};

export const wallObject: (props?: wallObjectProps) => void = props => {
	const { position = DEFAULT_POSITION, rows = 1, brickInRows = 1, isYDirection = false } = props || {};
	const { scene, physicWorld, addToCallInTickStack, gltfLoader } = MOST_IMPORTANT_DATA;

	const brickShape = new CANNON.Box(new CANNON.Vec3(BRICK_OPTION.width * 0.5, BRICK_OPTION.height * 0.5, BRICK_OPTION.depth * 0.5));

	const bricks: copyPositionType[] = [];

	// load models
	const brickContainer = createModelContainer({
		gltfLoader,
		containerName: 'brick',
		modelSrc: brickModelGltf,
		scale: new THREE.Vector3(0.25, 0.25, 0.25),
		callback: () => {
			const createBrick: (brickPosition: CANNON.Vec3) => void = brickPosition => {
				const body = new CANNON.Body({
					mass: BRICK_OPTION.mass,
					material: dummyPhysicsMaterial,
				});
				body.addShape(brickShape);
				body.allowSleep = true;
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
					const relativeVelocity = ev.contact.getImpactVelocityAlongNormal();
					playSound('brick', relativeVelocity);
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
			createWall();
			setTimeout(() => {
				bricks.forEach(({ body }) => {
					if (!body) return;
					body.sleepSpeedLimit = 0.05;
				});
			}, 2000);
		},
	});

	const callInTick: (propsCalInTick: callInTickProps) => void = () => bricks.forEach(brick => copyPositions(brick));
	addToCallInTickStack(callInTick);
};
