import * as THREE from 'three';
import { callInTickProps, MOST_IMPORTANT_DATA } from '../index';
import { CAR_EXPORT_DATA } from '../objects/car';

export const CAMERA_OPTIONS = {
	position: new THREE.Vector3(0, 10, -5),
	rotation: new THREE.Quaternion(1, 0, 0, 1),
	angleOfView: new THREE.Vector3(3, 2, 2),

	positionTarget: new THREE.Vector3(0, 0, 0),
	positionEased: new THREE.Vector3(0, 0, 0),
	easing: 0.15,

	zoomValue: 0.3,
	zoomTargetValue: 0.3,
	zoomEasing: 0.1,
	zoomMinDistance: 5,
	zoomAmplitude: 15,
	zoomDistance: 5 + 15 * 0.3,
};

export const setupCameras: () => { camera: THREE.PerspectiveCamera; loadingCamera: THREE.PerspectiveCamera; callInTickCamera: (props: callInTickProps) => void } = () => {
	const { windowSizes } = MOST_IMPORTANT_DATA;

	const camera = new THREE.PerspectiveCamera(50, windowSizes.width / windowSizes.height, 1, 80);
	camera.up.set(0, 1, 0);
	camera.position.copy(CAMERA_OPTIONS.angleOfView);

	const loadingCamera = new THREE.PerspectiveCamera(50, windowSizes.width / windowSizes.height, 1, 80);
	loadingCamera.up.set(0, 1, 0);
	loadingCamera.position.copy(CAMERA_OPTIONS.angleOfView);

	const callInTickCamera: (props: callInTickProps) => void = () => {
		// update position for zoom
		CAMERA_OPTIONS.positionEased.x += (CAMERA_OPTIONS.positionTarget.x - CAMERA_OPTIONS.positionEased.x) * CAMERA_OPTIONS.easing;
		CAMERA_OPTIONS.positionEased.y += (CAMERA_OPTIONS.positionTarget.y - CAMERA_OPTIONS.positionEased.y) * CAMERA_OPTIONS.easing;
		CAMERA_OPTIONS.positionEased.z += (CAMERA_OPTIONS.positionTarget.z - CAMERA_OPTIONS.positionEased.z) * CAMERA_OPTIONS.easing;
		// Apply zoom
		camera.position.copy(CAMERA_OPTIONS.positionEased).add(CAMERA_OPTIONS.angleOfView.clone().normalize().multiplyScalar(CAMERA_OPTIONS.zoomDistance));
		loadingCamera.position.copy(CAMERA_OPTIONS.positionEased).add(CAMERA_OPTIONS.angleOfView.clone().normalize().multiplyScalar(CAMERA_OPTIONS.zoomDistance));
		CAMERA_OPTIONS.zoomValue += (CAMERA_OPTIONS.zoomTargetValue - CAMERA_OPTIONS.zoomValue) * CAMERA_OPTIONS.zoomEasing;
		CAMERA_OPTIONS.zoomDistance = CAMERA_OPTIONS.zoomMinDistance + CAMERA_OPTIONS.zoomAmplitude * CAMERA_OPTIONS.zoomValue;

		// update camera pan
		camera.position.x += CAR_EXPORT_DATA.position.x;
		camera.position.z += CAR_EXPORT_DATA.position.z;
		camera.position.y += CAR_EXPORT_DATA.position.y;

		const currentWatchPosition = new THREE.Vector3(CAR_EXPORT_DATA.position.x, CAR_EXPORT_DATA.position.y, CAR_EXPORT_DATA.position.z);
		camera.lookAt(currentWatchPosition);
	};

	const wheelEventHandler: (ev: WheelEvent) => void = ev => {
		CAMERA_OPTIONS.zoomTargetValue += ev.deltaY * 0.001;
		CAMERA_OPTIONS.zoomTargetValue = Math.min(Math.max(CAMERA_OPTIONS.zoomTargetValue, 0), 1);
	};

	window.addEventListener('wheel', wheelEventHandler);

	return {
		camera,
		loadingCamera,
		callInTickCamera,
	};
};
