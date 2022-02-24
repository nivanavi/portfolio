import React from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { TextureLoader } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SceneIgniterContextProvider, useSceneIgniterContext } from '../lessons/lessonIgniter';
import { setupRenderer } from './renderer';
import { setupCameras } from './cameras';
import { setupPhysics } from './physics';
import { groundObject } from './objects/ground';
import { setupLights } from './lights';
import { carObject } from './objects/car';
import { windowResizeUtil } from './utils';
import { poolObject } from './objects/waterpool';
import { benchObject } from './objects/bench';
import { teleportObject } from './objects/teleport';
import { lampPostObject } from './objects/lampPost';
import { recorderObject } from './objects/recorder';
import { logBenchObject } from './objects/logBench';
import { getRandomTreeAndRotate, treeObject } from './objects/tree';
import { railsObject } from './objects/rails';
import { railBlockObject } from './objects/railBlock';
import { waterTowerObject } from './objects/waterTower';
import { windTowerObject } from './objects/windTower';
import { lampPostWestObject } from './objects/lampPostWest';
import { heyObject } from './objects/hey';
import { saloonObject } from './objects/saloon';
import { barrelObject } from './objects/barrel';
import { ladderObject } from './objects/ladder';
import { cactusObject, getRandomCactusAndRotate } from './objects/cactuses';
import { pinObject } from './objects/pin';
import CannonDebugRenderer from '../libs/cannonDebug';
import { ballObject } from './objects/ball';
import { wallObject } from './objects/wall';
import { fenceObject } from './objects/fence';
import { rampObject } from './objects/ramp';
import { gateObject } from './objects/gate';

export type quaternionType = {
	vector: CANNON.Vec3;
	angle: number;
};

export type objectProps = {
	position?: THREE.Vector3;
	quaternion?: quaternionType;
};

export type windowSizesType = {
	width: number;
	height: number;
};

export type calInTickProps = {
	physicDelta: number;
	graphicDelta: number;
	time: number;
};
type callInTickType = (props: calInTickProps) => void;
type callInPostStepType = () => void;

type mostImportantData = {
	scene: THREE.Scene;
	physicWorld: CANNON.World;
	gui: dat.GUI;
	windowSizes: windowSizesType;
	clock: THREE.Clock;
	addToCallInTickStack: (callInTick: callInTickType) => void;
	addToCallInPostStepStack: (callInTick: callInPostStepType) => void;
	gltfLoader: GLTFLoader;
	textureLoader: TextureLoader;
};

export const DEFAULT_POSITION: THREE.Vector3 = new THREE.Vector3();
export const DEFAULT_QUATERNION: quaternionType = {
	vector: new CANNON.Vec3(),
	angle: 0,
};

const textureLoader = new THREE.TextureLoader();

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
gltfLoader.setDRACOLoader(dracoLoader);

const callInTickStack: callInTickType[] = [];
const callInPostStepStack: callInPostStepType[] = [];
export const MOST_IMPORTANT_DATA: mostImportantData = {
	scene: new THREE.Scene(),
	physicWorld: setupPhysics().physicWorld,
	gui: new dat.GUI(),
	windowSizes: {
		width: window.innerWidth,
		height: window.innerHeight,
	},
	clock: new THREE.Clock(),
	addToCallInTickStack: (callInTick: callInTickType) => callInTickStack.push(callInTick),
	addToCallInPostStepStack: (callInPostStep: callInPostStepType) => callInPostStepStack.push(callInPostStep),
	gltfLoader,
	textureLoader,
};

const { scene, windowSizes, physicWorld, clock } = MOST_IMPORTANT_DATA;

const getUniquePosition = (minRadius: number, levelYOffset: number, positions: THREE.Vector3[]): THREE.Vector3 => {
	const angle = Math.random() * Math.PI * 2;
	const radius = minRadius + Math.random() * 15;
	const x = Math.sin(angle) * radius;
	const z = Math.cos(angle) * radius;
	const vector: THREE.Vector3 = new THREE.Vector3(x, levelYOffset, z);
	const findNear = positions.find(vec => vec.distanceTo(vector) < 4);
	if (findNear) return getUniquePosition(minRadius, levelYOffset, positions);
	return vector;
};

// const level1YOffset: number = 0;
// const level2YOffset: number = 120;
// const level3YOffset: number = 240;

const level1YOffset: number = 0;
const level2YOffset: number = 16;
const level3YOffset: number = 32;

export const Portfolio: React.FC = () => {
	const canvas = useSceneIgniterContext().canvas!;
	const { renderer } = setupRenderer({ canvas });
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	const { camera } = setupCameras();
	const { setLightsFor1Level, setLightsFor2Level, setLightsFor3Level } = setupLights();

	// not important stuff
	const orbitControl = new OrbitControls(camera, canvas);
	const cannonDebugRenderer = new CannonDebugRenderer(scene, physicWorld);

	// car
	carObject({ position: new THREE.Vector3(5, 0, -3) });
	setLightsFor1Level(level1YOffset + 15);
	// level 1
	groundObject();
	poolObject({ position: new THREE.Vector3(0, level1YOffset, 0) });
	benchObject({ position: new THREE.Vector3(0.8, level1YOffset, 6), quaternion: { vector: new CANNON.Vec3(0, -1, 0), angle: Math.PI } });
	lampPostObject({ position: new THREE.Vector3(0, level1YOffset, 6) });

	benchObject({ position: new THREE.Vector3(0.8, level1YOffset, -6) });
	lampPostObject({ position: new THREE.Vector3(0, level1YOffset, -6) });

	benchObject({ position: new THREE.Vector3(-6, level1YOffset, 0.8), quaternion: { vector: new CANNON.Vec3(0, 1, 0), angle: Math.PI * 0.5 } });
	lampPostObject({ position: new THREE.Vector3(-6, level1YOffset, 0) });

	benchObject({ position: new THREE.Vector3(6, level1YOffset, 0.8), quaternion: { vector: new CANNON.Vec3(0, -1, 0), angle: Math.PI * 0.5 } });
	lampPostObject({ position: new THREE.Vector3(6, level1YOffset, 0) });

	logBenchObject({ position: new THREE.Vector3(16, level1YOffset, 4), quaternion: { vector: new CANNON.Vec3(0, 1, 0), angle: Math.PI / 5 } });
	recorderObject({ position: new THREE.Vector3(15.8, level1YOffset + 0.2, 3.7), quaternion: { vector: new CANNON.Vec3(0, 1, 0), angle: Math.PI * 0.5 } });

	const level1TeleportEnter = new THREE.Vector3(2, level1YOffset, -22);
	const level1TeleportExit = new THREE.Vector3(0, level2YOffset, 23);
	teleportObject({
		exit: { position: level1TeleportExit, callback: () => setLightsFor2Level(level2YOffset + 15) },
		enter: { position: level1TeleportEnter, callback: () => setLightsFor1Level(level1YOffset + 15) },
	});
	const positions1level: THREE.Vector3[] = [level1TeleportEnter];
	Array.from({ length: 50 }).forEach(() => {
		const { tree, quaternion } = getRandomTreeAndRotate();
		const position = getUniquePosition(9, level1YOffset, positions1level);
		positions1level.push(position);
		treeObject({ position, quaternion, type: tree });
	});

	// level 2
	groundObject({ position: new THREE.Vector3(0, level2YOffset, 0), color: '#D58B1C' });
	railsObject({ position: new THREE.Vector3(0, level2YOffset, 0) });
	railBlockObject({ position: new THREE.Vector3(-12, level2YOffset, 0) });
	saloonObject({
		position: new THREE.Vector3(0, level2YOffset, -8),
		quaternion: {
			vector: new CANNON.Vec3(0, -1, 0),
			angle: Math.PI / 2,
		},
	});
	barrelObject({ position: new THREE.Vector3(-2.5, level2YOffset, -8) });
	barrelObject({ position: new THREE.Vector3(-2.5, level2YOffset, -8.5) });
	barrelObject({ position: new THREE.Vector3(-2.7, level2YOffset, -9) });
	barrelObject({ position: new THREE.Vector3(-2.5, level2YOffset + 0.7, -8.25) });

	barrelObject({ position: new THREE.Vector3(0, level2YOffset, 9) });
	barrelObject({ position: new THREE.Vector3(0.5, level2YOffset, 9) });
	barrelObject({ position: new THREE.Vector3(1, level2YOffset, 9) });
	barrelObject({ position: new THREE.Vector3(0.25, level2YOffset + 0.7, 9) });
	barrelObject({ position: new THREE.Vector3(0.75, level2YOffset + 0.7, 9) });
	barrelObject({ position: new THREE.Vector3(0.5, level2YOffset + 1.4, 9) });

	heyObject({ position: new THREE.Vector3(4, level2YOffset, 6) });
	heyObject({ position: new THREE.Vector3(4, level2YOffset, 6.5) });
	heyObject({ position: new THREE.Vector3(4, level2YOffset + 1, 6) });
	heyObject({ position: new THREE.Vector3(4, level2YOffset + 1, 6.5) });
	heyObject({
		position: new THREE.Vector3(4, level2YOffset, 7.1),
		quaternion: {
			vector: new CANNON.Vec3(0, -1, 0),
			angle: Math.PI / 5,
		},
	});

	waterTowerObject({ position: new THREE.Vector3(8, level2YOffset, -7) });
	windTowerObject({ position: new THREE.Vector3(-5, level2YOffset, 5) });
	lampPostWestObject({ position: new THREE.Vector3(-10, level2YOffset, 1.5) });
	lampPostWestObject({ position: new THREE.Vector3(0, level2YOffset, 1.5) });
	lampPostWestObject({ position: new THREE.Vector3(10, level2YOffset, 1.5) });
	lampPostWestObject({
		position: new THREE.Vector3(-5, level2YOffset, -1.5),
		quaternion: {
			vector: new CANNON.Vec3(0, -1, 0),
			angle: Math.PI,
		},
	});
	lampPostWestObject({
		position: new THREE.Vector3(5, level2YOffset, -1.5),
		quaternion: {
			vector: new CANNON.Vec3(0, -1, 0),
			angle: Math.PI,
		},
	});
	ladderObject({
		position: new THREE.Vector3(3.2, level2YOffset, 6),
		quaternion: {
			vector: new CANNON.Vec3(0, 0, -1),
			angle: Math.PI / 10,
		},
	});
	ladderObject({
		position: new THREE.Vector3(-3, level2YOffset, 9.5),
		quaternion: {
			vector: new CANNON.Vec3(0, 1, -1),
			angle: Math.PI / 2,
		},
	});
	const level2TeleportEnter = new THREE.Vector3(-4, level2YOffset, -25);
	const level2TeleportExit = new THREE.Vector3(18, level3YOffset, -25);
	teleportObject({
		exit: { position: level2TeleportExit, callback: () => setLightsFor3Level(level3YOffset + 15) },
		enter: { position: level2TeleportEnter, callback: () => setLightsFor2Level(level2YOffset + 15) },
	});
	const positions2level: THREE.Vector3[] = [level2TeleportEnter, level1TeleportExit];
	Array.from({ length: 50 }).forEach(() => {
		const { cactus, quaternion } = getRandomCactusAndRotate();
		const position = getUniquePosition(12.5, level2YOffset, positions2level);
		positions2level.push(position);
		cactusObject({ position, quaternion, type: cactus });
	});

	// level 3
	groundObject({ position: new THREE.Vector3(0, level3YOffset, 0), color: '#7C7C7C' });

	// bowling area
	fenceObject({
		position: new THREE.Vector3(-1.5, level3YOffset, -2.5),
	});
	fenceObject({
		position: new THREE.Vector3(-1.5, level3YOffset, 2.5),
		quaternion: {
			vector: new CANNON.Vec3(0, -1, 0),
			angle: Math.PI,
		},
	});
	ballObject({ position: new THREE.Vector3(3.5, level3YOffset, 0) });
	pinObject({ position: new THREE.Vector3(-4, level3YOffset, 0) });

	pinObject({ position: new THREE.Vector3(-4.6, level3YOffset, -0.4) });
	pinObject({ position: new THREE.Vector3(-4.6, level3YOffset, 0.4) });

	pinObject({ position: new THREE.Vector3(-5.2, level3YOffset, -0.8) });
	pinObject({ position: new THREE.Vector3(-5.2, level3YOffset, 0) });
	pinObject({ position: new THREE.Vector3(-5.2, level3YOffset, 0.8) });

	pinObject({ position: new THREE.Vector3(-5.8, level3YOffset, -1.2) });
	pinObject({ position: new THREE.Vector3(-5.8, level3YOffset, -0.4) });
	pinObject({ position: new THREE.Vector3(-5.8, level3YOffset, 0.4) });
	pinObject({ position: new THREE.Vector3(-5.8, level3YOffset, 1.2) });

	// ramp area
	wallObject({ position: new THREE.Vector3(6.7, level3YOffset, 18), rows: 4, brickInRows: 5, isYDirection: false });
	rampObject({ position: new THREE.Vector3(8, level3YOffset, 12) });
	// ramp area
	wallObject({ position: new THREE.Vector3(24, level3YOffset, 0), rows: 20, brickInRows: 2, isYDirection: true });
	rampObject({
		position: new THREE.Vector3(20, level3YOffset, 0),
		quaternion: {
			vector: new CANNON.Vec3(0, -1, 0),
			angle: Math.PI * 1.5,
		},
	});

	// house area
	wallObject({ position: new THREE.Vector3(7.4, level3YOffset, -18), rows: 6, brickInRows: 6, isYDirection: true });
	wallObject({ position: new THREE.Vector3(8, level3YOffset, -18), rows: 6, brickInRows: 6, isYDirection: false });

	// gate area
	gateObject({ position: new THREE.Vector3(-1, level3YOffset, 15) });
	gateObject({
		position: new THREE.Vector3(1.8, level3YOffset, 15),
		isRevers: true,
	});

	physicWorld.addEventListener('postStep', () => callInPostStepStack.forEach(call => call()));

	let oldElapsedTime: number;
	const minDelta: number = 1000 / 70;
	const timeStep = 1 / 60;
	const tick = (): void | number => {
		const elapsedTime = clock.getElapsedTime();
		const physicDelta = Math.round((elapsedTime - oldElapsedTime) * 1000);
		const graphicDelta = elapsedTime - oldElapsedTime;
		if (physicDelta < minDelta) return window.requestAnimationFrame(tick);

		// update call in tick stack
		callInTickStack.forEach(call => call({ physicDelta, graphicDelta, time: elapsedTime }));

		// update physic step
		if (!oldElapsedTime) physicWorld.step(timeStep);
		else physicWorld.step(timeStep, physicDelta, 3);

		// update other stuff
		cannonDebugRenderer.update();
		orbitControl.update();
		renderer.render(scene, camera);

		// update old elapsed time
		oldElapsedTime = elapsedTime;

		window.requestAnimationFrame(tick);
	};
	tick();

	const windowResizeHandler = React.useCallback(() => {
		windowResizeUtil({
			windowSizes,
			renderer,
			callback: () => {
				camera.aspect = windowSizes.width / windowSizes.height;
				camera.updateProjectionMatrix();
			},
		});
	}, [renderer, camera]);

	React.useEffect(() => {
		window.addEventListener('resize', windowResizeHandler);
		return () => {
			window.removeEventListener('resize', windowResizeHandler);
		};
	}, [windowResizeHandler]);

	return null;
};

export const PortfolioIgniter: React.FC = () => (
	<SceneIgniterContextProvider>
		<Portfolio />
	</SceneIgniterContextProvider>
);
