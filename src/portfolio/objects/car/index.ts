import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Howl } from 'howler';
import { dummyPhysicsMaterial, wheelPhysicsMaterial } from '../../physics';
import { copyPositions, createModelContainer } from '../../utils';
// models
// @ts-ignore
import delorianModel from './models/delorian.gltf';
// @ts-ignore
import wheelModel from './models/wheel.gltf';
import { callInTickProps, DEFAULT_POSITION, DEFAULT_QUATERNION, MOST_IMPORTANT_DATA, objectProps } from '../../index';
import { playSound } from '../../sounds';
// @ts-ignore
import engineSound from '../../sounds/engine/engine2.mp3';

type carObjectType = { respawnCallBack?: () => void } & objectProps;

const DELORIAN_SETTINGS = {
	chassisWidth: 1.02,
	chassisHeight: 0.58,
	chassisDepth: 2.03,
	chassisMass: 20,
	chassisOffset: new CANNON.Vec3(0.15, 0.16, 0),
	wheelMass: 5,
	wheelFrontOffsetDepth: 0.735,
	wheelBackOffsetDepth: -0.5,
	wheelOffsetWidth: 0.425,
};

export const CAR_EXPORT_DATA = {
	chassisMesh: new THREE.Mesh(),
	chassisBody: new CANNON.Body(),
	position: new CANNON.Vec3(),
};

const RESPAWN_OPTIONS = {
	lastRespawn: 0,
	respawnDelta: 2000,
	isCanRespawn: false,
};

// sounds
const ENGINE_SOUND_OPTIONS = {
	progress: 0,
	progressEasingUp: 0.3,
	progressEasingDown: 0.15,
	speedMultiplier: 2.5,
	accelerationMultiplier: 0.5,
	rateMin: 0.4,
	rateMax: 1.4,
	volumeMin: 0.2,
	volumeMax: 0.5,
};

export const ENGINE_PLAYER = new Howl({
	src: [engineSound],
	volume: 0,
	loop: true,
});
ENGINE_PLAYER.play();

const setVolumeBySpeed: (speed: number) => void = speed => {
	let progress = Math.abs(speed) * ENGINE_SOUND_OPTIONS.speedMultiplier + Math.max(0.5, 0) * ENGINE_SOUND_OPTIONS.accelerationMultiplier;
	progress = Math.min(Math.max(progress, 0), 1);

	ENGINE_SOUND_OPTIONS.progress +=
		(progress - ENGINE_SOUND_OPTIONS.progress) * (progress > ENGINE_SOUND_OPTIONS.progress ? ENGINE_SOUND_OPTIONS.progressEasingUp : ENGINE_SOUND_OPTIONS.progressEasingDown);

	// Rate
	const rateAmplitude = ENGINE_SOUND_OPTIONS.rateMax - ENGINE_SOUND_OPTIONS.rateMin;
	ENGINE_PLAYER.rate(ENGINE_SOUND_OPTIONS.rateMin + rateAmplitude * ENGINE_SOUND_OPTIONS.progress);

	// Volume
	const volumeAmplitude = ENGINE_SOUND_OPTIONS.volumeMax - ENGINE_SOUND_OPTIONS.volumeMin;
	ENGINE_PLAYER.volume((ENGINE_SOUND_OPTIONS.volumeMin + volumeAmplitude * ENGINE_SOUND_OPTIONS.progress) * 0.7);
};

export const carObject: (props?: carObjectType) => void = props => {
	const { position = DEFAULT_POSITION, quaternion = DEFAULT_QUATERNION, respawnCallBack } = props || {};
	const { scene, physicWorld, addToCallInTickStack, addToCallInPostStepStack, gltfLoader } = MOST_IMPORTANT_DATA;

	const CAR_OPTIONS = {
		...DELORIAN_SETTINGS,
		maxSteeringForce: Math.PI * 0.17,
		steeringSpeed: 0.005,
		accelerationMaxSpeed: 0.055,
		boostAccelerationMaxSpeed: 0.1,
		acceleratingSpeed: 2,
		brakeForce: 0.45,
	};

	const WHEEL_OPTIONS = {
		radius: 0.17,
		height: 0.1,
		suspensionStiffness: 25,
		suspensionRestLength: 0.1,
		frictionSlip: 5,
		dampingRelaxation: 1.8,
		dampingCompression: 1.5,
		maxSuspensionForce: 100000,
		rollInfluence: 0.01,
		maxSuspensionTravel: 0.3,
		customSlidingRotationalSpeed: -30,
		useCustomSlidingRotationalSpeed: true,
		directionLocal: new CANNON.Vec3(0, -1, 0),
		axleLocal: new CANNON.Vec3(0, 0, 1),
		frontLeft: 0,
		frontRight: 1,
		backLeft: 2,
		backRight: 3,
		chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0), // Will be changed for each wheel
	};

	const CAR_DYNAMIC_OPTIONS = {
		steering: 0,
		accelerating: 0,
		speed: 0,
		worldForward: new CANNON.Vec3(),
		forwardSpeed: 0,
		oldPosition: new CANNON.Vec3(),
		goingForward: true,
		lastStopBurnOut: 0,
		stopBurnOutDelta: 300,
		up: false,
		down: false,
		left: false,
		right: false,
		brake: false,
		boost: false,
		isBurnOut: false,
	};

	const wheelsGraphic: THREE.Group[] = [];
	const wheelsPhysic: CANNON.Body[] = [];

	// load models
	const chassisContainer = createModelContainer({
		gltfLoader,
		containerName: 'car',
		modelSrc: delorianModel,
		scale: new THREE.Vector3(0.675, 0.675, 0.675),
		position: new THREE.Vector3(0, 0, 0.005),
	});

	// load models
	createModelContainer({
		gltfLoader,
		containerName: 'wheel',
		modelSrc: wheelModel,
		scale: new THREE.Vector3(0.1, 0.1, 0.1),
		callback: container => {
			Array.from({ length: 4 }).forEach(() => {
				const wheelMesh = container.clone();
				wheelMesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, -1, 0), Math.PI * 0.5);
				scene.add(wheelMesh);
				wheelsGraphic.push(wheelMesh);
			});
		},
	});

	const chassisMeshMaterial = new THREE.MeshStandardMaterial();
	chassisMeshMaterial.visible = false;
	const chassisMeshGeometry = new THREE.BoxBufferGeometry(CAR_OPTIONS.chassisDepth, CAR_OPTIONS.chassisHeight, CAR_OPTIONS.chassisWidth);
	const chassisMesh = new THREE.Mesh(chassisMeshGeometry, chassisMeshMaterial);
	chassisMesh.position.set(CAR_OPTIONS.chassisOffset.x, CAR_OPTIONS.chassisOffset.y, CAR_OPTIONS.chassisOffset.z);

	const chassisShape = new CANNON.Box(new CANNON.Vec3(CAR_OPTIONS.chassisDepth * 0.5, CAR_OPTIONS.chassisHeight * 0.5, CAR_OPTIONS.chassisWidth * 0.5));
	const chassisBody = new CANNON.Body({ mass: CAR_OPTIONS.chassisMass });
	chassisBody.allowSleep = false;
	chassisBody.position.set(position.x, position.y + 0.5, position.z);
	chassisBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);
	chassisBody.addShape(chassisShape, CAR_OPTIONS.chassisOffset);

	const vehicle = new CANNON.RaycastVehicle({
		chassisBody,
	});

	// Front left
	vehicle.addWheel({
		...WHEEL_OPTIONS,
		chassisConnectionPointLocal: new CANNON.Vec3(CAR_OPTIONS.wheelFrontOffsetDepth, 0, CAR_OPTIONS.wheelOffsetWidth),
	});

	// Front right
	vehicle.addWheel({
		...WHEEL_OPTIONS,
		chassisConnectionPointLocal: new CANNON.Vec3(CAR_OPTIONS.wheelFrontOffsetDepth, 0, -CAR_OPTIONS.wheelOffsetWidth),
	});

	// Back left
	vehicle.addWheel({
		...WHEEL_OPTIONS,
		chassisConnectionPointLocal: new CANNON.Vec3(CAR_OPTIONS.wheelBackOffsetDepth, 0, CAR_OPTIONS.wheelOffsetWidth),
	});

	// Back right
	vehicle.addWheel({
		...WHEEL_OPTIONS,
		chassisConnectionPointLocal: new CANNON.Vec3(CAR_OPTIONS.wheelBackOffsetDepth, 0, -CAR_OPTIONS.wheelOffsetWidth),
	});

	vehicle.addToWorld(physicWorld);
	chassisContainer.add(chassisMesh);
	scene.add(chassisContainer);
	CAR_EXPORT_DATA.chassisMesh = chassisMesh;
	CAR_EXPORT_DATA.chassisBody = chassisBody;

	vehicle.wheelInfos.forEach(wheel => {
		const shape = new CANNON.Cylinder(wheel.radius || 0, wheel.radius || 0, WHEEL_OPTIONS.height, 20);
		const body = new CANNON.Body({ mass: CAR_OPTIONS.wheelMass, material: wheelPhysicsMaterial });
		const wheelQuaternion = new CANNON.Quaternion();
		wheelQuaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI * 0.5);
		body.addShape(shape, new CANNON.Vec3(), wheelQuaternion);
		wheelsPhysic.push(body);
	});

	const respawn = (): void => {
		if (!RESPAWN_OPTIONS.isCanRespawn) return;
		const currentTime = Date.now();
		if (currentTime < RESPAWN_OPTIONS.lastRespawn + RESPAWN_OPTIONS.respawnDelta) return;
		RESPAWN_OPTIONS.lastRespawn = currentTime;
		if (respawnCallBack) respawnCallBack();
		chassisBody.position.set(position.x, position.y + 0.5, position.z);
		chassisBody.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);
	};

	const brake: (force: number) => void = force => {
		vehicle.setBrake(force, 0);
		vehicle.setBrake(force, 1);
		vehicle.setBrake(force, 2);
		vehicle.setBrake(force, 3);
	};

	const callInPostStep: () => void = () => {
		// Update speed
		let positionDelta = new CANNON.Vec3().copy(chassisBody.position);
		positionDelta = positionDelta.vsub(CAR_DYNAMIC_OPTIONS.oldPosition);
		CAR_DYNAMIC_OPTIONS.oldPosition.copy(chassisBody.position);
		CAR_EXPORT_DATA.position.copy(chassisBody.position);
		CAR_DYNAMIC_OPTIONS.speed = positionDelta.length();

		// Update forward
		const localForward = new CANNON.Vec3(1, 0, 0);
		chassisBody.vectorToWorldFrame(localForward, CAR_DYNAMIC_OPTIONS.worldForward);
		CAR_DYNAMIC_OPTIONS.forwardSpeed = CAR_DYNAMIC_OPTIONS.worldForward.dot(positionDelta);
		CAR_DYNAMIC_OPTIONS.goingForward = CAR_DYNAMIC_OPTIONS.forwardSpeed > 0;

		// slow stop
		if (!CAR_DYNAMIC_OPTIONS.up && !CAR_DYNAMIC_OPTIONS.down) brake(0.15);

		// TODO upside down
		const localUp = new CANNON.Vec3(0, 1, 0);
		const worldUp = new CANNON.Vec3();
		chassisBody.vectorToWorldFrame(localUp, worldUp);
		if (worldUp.dot(localUp) < 0.05) {
			if (!chassisBody.material) chassisBody.material = dummyPhysicsMaterial;
			if (!RESPAWN_OPTIONS.isCanRespawn) RESPAWN_OPTIONS.isCanRespawn = true;
		} else {
			if (chassisBody.material) chassisBody.material = null;
			if (RESPAWN_OPTIONS.isCanRespawn) RESPAWN_OPTIONS.isCanRespawn = false;
		}

		// update wheels
		vehicle.wheelInfos.forEach((wheel, index) => {
			vehicle.updateWheelTransform(index);
			const transform = vehicle.wheelInfos[index].worldTransform;
			wheelsPhysic[index].position.copy(transform.position);
			wheelsPhysic[index].quaternion.copy(transform.quaternion);
		});
	};
	addToCallInPostStepStack(callInPostStep);

	let rotation = 0;
	const callInTick: (propsCalInTick: callInTickProps) => void = ({ physicDelta }) => {
		// update
		copyPositions({ mesh: chassisContainer, body: chassisBody });

		wheelsPhysic.forEach((wheel, index) => {
			copyPositions({ mesh: wheelsGraphic[index], body: wheel });
			if (!CAR_DYNAMIC_OPTIONS.isBurnOut) return;
			if (![WHEEL_OPTIONS.backLeft, WHEEL_OPTIONS.backRight].includes(index)) return;
			rotation += 8;
			wheelsGraphic[index].rotateOnAxis(new THREE.Vector3(0, 0, 1), rotation);
		});

		// TODO STEERING
		const steerForce = physicDelta * CAR_OPTIONS.steeringSpeed;
		// Steer right and left
		if (CAR_DYNAMIC_OPTIONS.right && CAR_DYNAMIC_OPTIONS.left) {
			if (Math.abs(CAR_DYNAMIC_OPTIONS.steering) > steerForce) CAR_DYNAMIC_OPTIONS.steering -= steerForce * Math.sign(CAR_DYNAMIC_OPTIONS.steering);
			else CAR_DYNAMIC_OPTIONS.steering = 0;
		}
		// steer right
		else if (CAR_DYNAMIC_OPTIONS.right) CAR_DYNAMIC_OPTIONS.steering -= steerForce;
		// steer left
		else if (CAR_DYNAMIC_OPTIONS.left) CAR_DYNAMIC_OPTIONS.steering += steerForce;
		// Steer center
		else if (Math.abs(CAR_DYNAMIC_OPTIONS.steering) > steerForce) CAR_DYNAMIC_OPTIONS.steering -= steerForce * Math.sign(CAR_DYNAMIC_OPTIONS.steering);
		else CAR_DYNAMIC_OPTIONS.steering = 0;

		// check if current steering is greatest than max steering and if its true set max steering
		if (Math.abs(CAR_DYNAMIC_OPTIONS.steering) > CAR_OPTIONS.maxSteeringForce)
			CAR_DYNAMIC_OPTIONS.steering = Math.sign(CAR_DYNAMIC_OPTIONS.steering) * CAR_OPTIONS.maxSteeringForce;

		// Update wheels steering

		vehicle.setSteeringValue(CAR_DYNAMIC_OPTIONS.steering, WHEEL_OPTIONS.frontLeft);
		vehicle.setSteeringValue(CAR_DYNAMIC_OPTIONS.steering, WHEEL_OPTIONS.frontRight);

		// TODO ACCELERATE
		const accelerateForce = physicDelta * CAR_OPTIONS.acceleratingSpeed;
		const currentMaxSpeed: number = CAR_DYNAMIC_OPTIONS.boost ? CAR_OPTIONS.boostAccelerationMaxSpeed : CAR_OPTIONS.accelerationMaxSpeed;
		// Accelerate up

		if (CAR_DYNAMIC_OPTIONS.up && (CAR_DYNAMIC_OPTIONS.down || CAR_DYNAMIC_OPTIONS.brake)) {
			CAR_DYNAMIC_OPTIONS.isBurnOut = true;
			CAR_DYNAMIC_OPTIONS.accelerating = 0;
			vehicle.setBrake(0.2, WHEEL_OPTIONS.frontLeft);
			vehicle.setBrake(0.2, WHEEL_OPTIONS.frontRight);
			vehicle.setBrake(1, WHEEL_OPTIONS.backLeft);
			vehicle.setBrake(1, WHEEL_OPTIONS.backRight);
			setVolumeBySpeed(1);
			return;
		}
		if (CAR_DYNAMIC_OPTIONS.up) {
			if (CAR_DYNAMIC_OPTIONS.speed < currentMaxSpeed || !CAR_DYNAMIC_OPTIONS.goingForward) CAR_DYNAMIC_OPTIONS.accelerating = accelerateForce;
			else CAR_DYNAMIC_OPTIONS.accelerating = 0;
		} else if (CAR_DYNAMIC_OPTIONS.down) {
			if (CAR_DYNAMIC_OPTIONS.speed < currentMaxSpeed || CAR_DYNAMIC_OPTIONS.goingForward) CAR_DYNAMIC_OPTIONS.accelerating = -accelerateForce;
			else CAR_DYNAMIC_OPTIONS.accelerating = 0;
		} else {
			CAR_DYNAMIC_OPTIONS.accelerating = 0;
		}
		const currentTime = Date.now();
		if (CAR_DYNAMIC_OPTIONS.isBurnOut) CAR_DYNAMIC_OPTIONS.lastStopBurnOut = currentTime;
		if (CAR_DYNAMIC_OPTIONS.isBurnOut) CAR_DYNAMIC_OPTIONS.isBurnOut = false;

		if (currentTime < CAR_DYNAMIC_OPTIONS.lastStopBurnOut + CAR_DYNAMIC_OPTIONS.stopBurnOutDelta) CAR_DYNAMIC_OPTIONS.accelerating *= 2;
		vehicle.applyEngineForce(CAR_DYNAMIC_OPTIONS.accelerating, WHEEL_OPTIONS.backLeft);
		vehicle.applyEngineForce(CAR_DYNAMIC_OPTIONS.accelerating, WHEEL_OPTIONS.backRight);

		// uncomment it for 4x4
		// vehicle.applyEngineForce(CAR_DYNAMIC_OPTIONS.accelerating, WHEEL_OPTIONS.frontLeft)
		// vehicle.applyEngineForce(CAR_DYNAMIC_OPTIONS.accelerating, WHEEL_OPTIONS.frontRight)

		if (CAR_DYNAMIC_OPTIONS.brake) {
			brake(CAR_OPTIONS.brakeForce);
		} else {
			brake(0);
		}

		// engine sound volume
		setVolumeBySpeed(CAR_DYNAMIC_OPTIONS.speed);
	};
	addToCallInTickStack(callInTick);

	chassisBody.addEventListener('collide', (ev: any) => {
		if (ev.body.mass !== 0) return;
		const relativeVelocity = ev.contact.getImpactVelocityAlongNormal();
		playSound('carHit', relativeVelocity);
	});

	const keyPressHandler: (ev: KeyboardEvent, isPressed: boolean) => void = (ev, isPressed) => {
		switch (ev.code) {
			case 'KeyW':
				CAR_DYNAMIC_OPTIONS.up = isPressed;
				break;
			case 'KeyA':
				CAR_DYNAMIC_OPTIONS.left = isPressed;
				break;
			case 'KeyS':
				CAR_DYNAMIC_OPTIONS.down = isPressed;
				break;
			case 'KeyD':
				CAR_DYNAMIC_OPTIONS.right = isPressed;
				break;
			case 'Space':
				CAR_DYNAMIC_OPTIONS.brake = isPressed;
				break;
			case 'ShiftLeft':
				CAR_DYNAMIC_OPTIONS.boost = isPressed;
				break;
			case 'KeyR':
				respawn();
				break;
			default:
				break;
		}
	};

	const windowBlurHandler = (): void => {
		CAR_DYNAMIC_OPTIONS.up = false;
		CAR_DYNAMIC_OPTIONS.left = false;
		CAR_DYNAMIC_OPTIONS.down = false;
		CAR_DYNAMIC_OPTIONS.right = false;
		CAR_DYNAMIC_OPTIONS.brake = false;
		CAR_DYNAMIC_OPTIONS.boost = false;
	};

	window.addEventListener('keydown', ev => keyPressHandler(ev, true));
	window.addEventListener('keyup', ev => keyPressHandler(ev, false));
	window.addEventListener('blur', windowBlurHandler);

	return {
		chassisBody,
		chassisMesh,
	};
};
