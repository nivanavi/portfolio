import React from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SceneIgniterContextProvider, useSceneIgniterContext } from '../lessons/lessonIgniter';
import { setupRenderer } from './renderer';
import { setupCameras } from './cameras';
import { setupPhysics } from './physics';
import { groundObject } from './objects/ground';
import { setupLights } from './lights';
import { carObject } from './objects/car';
import { getUniquePosition, windowResizeUtil } from './utils';
import CannonDebugRenderer from '../libs/cannonDebug';
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
import { ballObject } from './objects/ball';
import { wallObject } from './objects/wall';
import { fenceObject } from './objects/fence';
import { rampObject } from './objects/ramp';
import { gateObject } from './objects/gate';
import { textObject } from './objects/text';
import { setupFog } from './fog';
import { loaderObject } from './objects/loader';
import { unmuteHowler } from './sounds';

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
	loadingScene: THREE.Scene;
	physicWorld: CANNON.World;
	windowSizes: windowSizesType;
	clock: THREE.Clock;
	addToCallInTickStack: (callInTick: callInTickType) => void;
	addToCallInPostStepStack: (callInTick: callInPostStepType) => void;
	gltfLoader: GLTFLoader;
};

export const DEFAULT_POSITION: THREE.Vector3 = new THREE.Vector3();
export const DEFAULT_QUATERNION: quaternionType = {
	vector: new CANNON.Vec3(),
	angle: 0,
};
export const IS_DEVELOP = false;
let NEED_CREATE_WORLD = true;
let IS_LOADING = true;
const TEXT: string | undefined = window.location.hash.startsWith('#') ? window.location.hash.replace('#', '') : 'nivanavi_dev';
const LEVEL_1_Y_OFFSET: number = 0;
const LEVEL_2_Y_OFFSET: number = 120;
const LEVEL_3_Y_OFFSET: number = 240;

const loadingManager = new THREE.LoadingManager();
const gltfLoader = new GLTFLoader(loadingManager);
const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath('/draco/');
gltfLoader.setDRACOLoader(dracoLoader);

// todo chech callintick after reload
const callInTickStack: callInTickType[] = [];
const callInPostStepStack: callInPostStepType[] = [];
export const MOST_IMPORTANT_DATA: mostImportantData = {
	scene: new THREE.Scene(),
	loadingScene: new THREE.Scene(),
	physicWorld: setupPhysics().physicWorld,
	windowSizes: {
		width: window.innerWidth,
		height: window.innerHeight,
	},
	clock: new THREE.Clock(),
	addToCallInTickStack: (callInTick: callInTickType) => callInTickStack.push(callInTick),
	addToCallInPostStepStack: (callInPostStep: callInPostStepType) => callInPostStepStack.push(callInPostStep),
	gltfLoader,
};

const { scene, windowSizes, physicWorld, clock, loadingScene } = MOST_IMPORTANT_DATA;
const CANNON_DEBUG_RENDERER = new CannonDebugRenderer(scene, physicWorld);

const clearWorld = (): void => {
	physicWorld.bodies = [];
	scene.clear();
};
const createWorld = (): void => {
	const { setLightsFor1Level, setLightsFor2Level, setLightsFor3Level } = setupLights();
	const { setFogFor1Level, setFogFor2Level, setFogFor3Level } = setupFog();
	// car
	carObject({
		position: new THREE.Vector3(5, LEVEL_1_Y_OFFSET, -3),
		respawnCallBack: () => {
			clearWorld();
			NEED_CREATE_WORLD = true;
		},
	});
	setLightsFor1Level(LEVEL_1_Y_OFFSET + 15);
	setFogFor1Level();
	// level 1
	groundObject();
	poolObject({ position: new THREE.Vector3(0, LEVEL_1_Y_OFFSET, 0) });
	benchObject({ position: new THREE.Vector3(0.8, LEVEL_1_Y_OFFSET, 6), quaternion: { vector: new CANNON.Vec3(0, -1, 0), angle: Math.PI } });
	lampPostObject({ position: new THREE.Vector3(0, LEVEL_1_Y_OFFSET, 6) });

	benchObject({ position: new THREE.Vector3(0.8, LEVEL_1_Y_OFFSET, -6) });
	lampPostObject({ position: new THREE.Vector3(0, LEVEL_1_Y_OFFSET, -6) });

	benchObject({ position: new THREE.Vector3(-6, LEVEL_1_Y_OFFSET, 0.8), quaternion: { vector: new CANNON.Vec3(0, 1, 0), angle: Math.PI * 0.5 } });
	lampPostObject({ position: new THREE.Vector3(-6, LEVEL_1_Y_OFFSET, 0) });

	benchObject({ position: new THREE.Vector3(6, LEVEL_1_Y_OFFSET, 0.8), quaternion: { vector: new CANNON.Vec3(0, -1, 0), angle: Math.PI * 0.5 } });
	lampPostObject({ position: new THREE.Vector3(6, LEVEL_1_Y_OFFSET, 0) });

	logBenchObject({ position: new THREE.Vector3(16, LEVEL_1_Y_OFFSET, 4), quaternion: { vector: new CANNON.Vec3(0, 1, 0), angle: Math.PI / 5 } });
	recorderObject({ position: new THREE.Vector3(15.8, LEVEL_1_Y_OFFSET + 0.2, 3.7), quaternion: { vector: new CANNON.Vec3(0, 1, 0), angle: Math.PI * 0.5 } });

	const level1TeleportEnter = new THREE.Vector3(2, LEVEL_1_Y_OFFSET, -22);
	const level1TeleportExit = new THREE.Vector3(0, LEVEL_2_Y_OFFSET, 23);
	teleportObject({
		exit: {
			position: level1TeleportExit,
			callback: () => {
				setFogFor2Level();
				setLightsFor2Level(LEVEL_2_Y_OFFSET + 15);
			},
		},
		enter: {
			position: level1TeleportEnter,
			callback: () => {
				setFogFor1Level();
				setLightsFor1Level(LEVEL_1_Y_OFFSET + 15);
			},
		},
	});
	const positions1level: THREE.Vector3[] = [level1TeleportEnter];
	Array.from({ length: 50 }).forEach(() => {
		const { tree, quaternion } = getRandomTreeAndRotate();
		const position = getUniquePosition(9, LEVEL_1_Y_OFFSET, positions1level);
		positions1level.push(position);
		treeObject({ position, quaternion, type: tree });
	});

	// level 2
	groundObject({ position: new THREE.Vector3(0, LEVEL_2_Y_OFFSET, 0), color: '#D58B1C' });
	railsObject({ position: new THREE.Vector3(0, LEVEL_2_Y_OFFSET, 0) });
	railBlockObject({ position: new THREE.Vector3(-12, LEVEL_2_Y_OFFSET, 0) });
	saloonObject({
		position: new THREE.Vector3(0, LEVEL_2_Y_OFFSET, -8),
		quaternion: {
			vector: new CANNON.Vec3(0, -1, 0),
			angle: Math.PI / 2,
		},
	});
	barrelObject({ position: new THREE.Vector3(2.5, LEVEL_2_Y_OFFSET, -8) });
	barrelObject({ position: new THREE.Vector3(2.5, LEVEL_2_Y_OFFSET, -8.5) });
	barrelObject({ position: new THREE.Vector3(2.7, LEVEL_2_Y_OFFSET, -9) });
	barrelObject({ position: new THREE.Vector3(2.5, LEVEL_2_Y_OFFSET + 0.7, -8.25) });

	barrelObject({ position: new THREE.Vector3(0, LEVEL_2_Y_OFFSET, 9) });
	barrelObject({ position: new THREE.Vector3(0.5, LEVEL_2_Y_OFFSET, 9) });
	barrelObject({ position: new THREE.Vector3(1, LEVEL_2_Y_OFFSET, 9) });
	barrelObject({ position: new THREE.Vector3(0.25, LEVEL_2_Y_OFFSET + 0.7, 9) });
	barrelObject({ position: new THREE.Vector3(0.75, LEVEL_2_Y_OFFSET + 0.7, 9) });
	barrelObject({ position: new THREE.Vector3(0.5, LEVEL_2_Y_OFFSET + 1.4, 9) });

	heyObject({ position: new THREE.Vector3(4, LEVEL_2_Y_OFFSET, 6) });
	heyObject({ position: new THREE.Vector3(4, LEVEL_2_Y_OFFSET, 6.5) });
	heyObject({ position: new THREE.Vector3(4, LEVEL_2_Y_OFFSET + 1, 6) });
	heyObject({ position: new THREE.Vector3(4, LEVEL_2_Y_OFFSET + 1, 6.5) });
	heyObject({
		position: new THREE.Vector3(4, LEVEL_2_Y_OFFSET, 7.1),
		quaternion: {
			vector: new CANNON.Vec3(0, -1, 0),
			angle: Math.PI / 5,
		},
	});

	waterTowerObject({ position: new THREE.Vector3(8, LEVEL_2_Y_OFFSET, -7) });
	windTowerObject({ position: new THREE.Vector3(-5, LEVEL_2_Y_OFFSET, 5) });
	lampPostWestObject({ position: new THREE.Vector3(-10, LEVEL_2_Y_OFFSET, 1.5) });
	lampPostWestObject({ position: new THREE.Vector3(0, LEVEL_2_Y_OFFSET, 1.5) });
	lampPostWestObject({ position: new THREE.Vector3(10, LEVEL_2_Y_OFFSET, 1.5) });
	lampPostWestObject({
		position: new THREE.Vector3(-5, LEVEL_2_Y_OFFSET, -1.5),
		quaternion: {
			vector: new CANNON.Vec3(0, -1, 0),
			angle: Math.PI,
		},
	});
	lampPostWestObject({
		position: new THREE.Vector3(5, LEVEL_2_Y_OFFSET, -1.5),
		quaternion: {
			vector: new CANNON.Vec3(0, -1, 0),
			angle: Math.PI,
		},
	});
	ladderObject({
		position: new THREE.Vector3(3.2, LEVEL_2_Y_OFFSET, 6),
		quaternion: {
			vector: new CANNON.Vec3(0, 0, -1),
			angle: Math.PI / 10,
		},
	});
	ladderObject({
		position: new THREE.Vector3(-3, LEVEL_2_Y_OFFSET, 9.5),
		quaternion: {
			vector: new CANNON.Vec3(0, 1, -1),
			angle: Math.PI / 2,
		},
	});
	const level2TeleportEnter = new THREE.Vector3(-4, LEVEL_2_Y_OFFSET, -25);
	const level2TeleportExit = new THREE.Vector3(18, LEVEL_3_Y_OFFSET, -25);
	teleportObject({
		exit: {
			position: level2TeleportExit,
			callback: () => {
				setFogFor3Level();
				setLightsFor3Level(LEVEL_3_Y_OFFSET + 15);
			},
		},
		enter: {
			position: level2TeleportEnter,
			callback: () => {
				setFogFor2Level();
				setLightsFor2Level(LEVEL_2_Y_OFFSET + 15);
			},
		},
	});
	const positions2level: THREE.Vector3[] = [level2TeleportEnter, level1TeleportExit];
	Array.from({ length: 50 }).forEach(() => {
		const { cactus, quaternion } = getRandomCactusAndRotate();
		const position = getUniquePosition(12.5, LEVEL_2_Y_OFFSET, positions2level);
		positions2level.push(position);
		cactusObject({ position, quaternion, type: cactus });
	});

	// level 3
	groundObject({ position: new THREE.Vector3(0, LEVEL_3_Y_OFFSET, 0), color: '#7C7C7C' });

	// bowling area
	fenceObject({
		position: new THREE.Vector3(-1.5, LEVEL_3_Y_OFFSET, -2.5),
	});
	fenceObject({
		position: new THREE.Vector3(-1.5, LEVEL_3_Y_OFFSET, 2.5),
		quaternion: {
			vector: new CANNON.Vec3(0, -1, 0),
			angle: Math.PI,
		},
	});
	ballObject({ position: new THREE.Vector3(3.5, LEVEL_3_Y_OFFSET, 0) });
	pinObject({ position: new THREE.Vector3(-4, LEVEL_3_Y_OFFSET, 0) });

	pinObject({ position: new THREE.Vector3(-4.6, LEVEL_3_Y_OFFSET, -0.4) });
	pinObject({ position: new THREE.Vector3(-4.6, LEVEL_3_Y_OFFSET, 0.4) });

	pinObject({ position: new THREE.Vector3(-5.2, LEVEL_3_Y_OFFSET, -0.8) });
	pinObject({ position: new THREE.Vector3(-5.2, LEVEL_3_Y_OFFSET, 0) });
	pinObject({ position: new THREE.Vector3(-5.2, LEVEL_3_Y_OFFSET, 0.8) });

	pinObject({ position: new THREE.Vector3(-5.8, LEVEL_3_Y_OFFSET, -1.2) });
	pinObject({ position: new THREE.Vector3(-5.8, LEVEL_3_Y_OFFSET, -0.4) });
	pinObject({ position: new THREE.Vector3(-5.8, LEVEL_3_Y_OFFSET, 0.4) });
	pinObject({ position: new THREE.Vector3(-5.8, LEVEL_3_Y_OFFSET, 1.2) });

	// ramp area
	wallObject({ position: new THREE.Vector3(6.7, LEVEL_3_Y_OFFSET, 18), rows: 4, brickInRows: 5, isYDirection: false });
	rampObject({ position: new THREE.Vector3(8, LEVEL_3_Y_OFFSET, 12) });
	// ramp area
	wallObject({ position: new THREE.Vector3(24, LEVEL_3_Y_OFFSET, 0), rows: 20, brickInRows: 2, isYDirection: true });
	rampObject({
		position: new THREE.Vector3(20, LEVEL_3_Y_OFFSET, 0),
		quaternion: {
			vector: new CANNON.Vec3(0, -1, 0),
			angle: Math.PI * 1.5,
		},
	});

	// house area
	wallObject({ position: new THREE.Vector3(7.4, LEVEL_3_Y_OFFSET, -18), rows: 6, brickInRows: 6, isYDirection: true });
	wallObject({ position: new THREE.Vector3(8, LEVEL_3_Y_OFFSET, -18), rows: 6, brickInRows: 6, isYDirection: false });

	// gate area
	gateObject({ position: new THREE.Vector3(-1, LEVEL_3_Y_OFFSET, 15) });
	gateObject({
		position: new THREE.Vector3(1.8, LEVEL_3_Y_OFFSET, 15),
		isRevers: true,
	});
	wallObject({ position: new THREE.Vector3(-0.4, LEVEL_3_Y_OFFSET, 15.8), rows: 4, brickInRows: 4, isYDirection: false });

	// text area
	textObject({ position: new THREE.Vector3(18, LEVEL_3_Y_OFFSET, 14), text: TEXT });
};

// loader area
loadingManager.onProgress = (src, loaded, total): void => {
	const loadingTextEl = document.getElementById('loadingText');
	const loadingBarEl = document.getElementById('loadingBar');
	if (!loadingTextEl || !loadingBarEl) return;
	const percent: number = Math.floor((loaded * 100) / total);
	loadingTextEl.textContent = `Loading: ${percent}%`;
	loadingBarEl.style.width = `${percent}%`;
};
loadingManager.onLoad = (): void => {
	const letsGoButtonEl = document.getElementById('letsGoButton');
	if (!letsGoButtonEl) return;
	letsGoButtonEl.className = letsGoButtonEl.className.replace('letsGoButtonHide', 'letsGoButtonShow');
};
const hideLoading = (): void => {
	const loadingAreaEl = document.getElementById('loadingArea');
	if (!loadingAreaEl) return;
	loadingAreaEl.style.display = 'none';
	IS_LOADING = false;
	unmuteHowler();
	// ENGINE_PLAYER.play();
};

export const Portfolio: React.FC = () => {
	const canvas = useSceneIgniterContext().canvas!;
	const { renderer } = setupRenderer({ canvas });
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	const { camera, loadingCamera } = setupCameras();

	// loadingScene
	const loaderModel = loaderObject();
	loadingCamera.lookAt(loaderModel.position);
	loadingScene.add(loaderModel);

	// not important stuff
	const orbitControl = new OrbitControls(camera, canvas);

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
		if (IS_DEVELOP) {
			CANNON_DEBUG_RENDERER.update();
			orbitControl.update();
		}
		if (NEED_CREATE_WORLD) {
			createWorld();
			NEED_CREATE_WORLD = false;
		}

		if (IS_LOADING) renderer.render(loadingScene, loadingCamera);
		if (!IS_LOADING) renderer.render(scene, camera);

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
				loadingCamera.aspect = windowSizes.width / windowSizes.height;
				loadingCamera.updateProjectionMatrix();
			},
		});
	}, [renderer, camera, loadingCamera]);

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
		<div className='loadingAreaWrapper' id='loadingArea'>
			<div className='instruction'>
				<ul>
					<li>Move: W,A,S,D</li>
					<li>Boost: L.Shift</li>
					<li>Respawn: R (only when car upside down)</li>
					<li>W + (Space/S): burnout</li>
				</ul>
			</div>
			<div className='loadingContentWrapper'>
				<div className='loadingBarWrapper'>
					<p className='loadingText' id='loadingText'>
						Loading: 0%
					</p>
					<div className='loadingBar' id='loadingBar' />
				</div>
				<button className='letsGoButton letsGoButtonHide' id='letsGoButton' type='button' onClick={hideLoading}>
					Letsss go
				</button>
			</div>
			<div className='rights'>
				<ul>
					<li>All rights protected by nivanavi</li>
					<li>
						All matches with the real world <br /> or Bruno Simon are not my problem
					</li>
				</ul>
			</div>
		</div>
	</SceneIgniterContextProvider>
);
