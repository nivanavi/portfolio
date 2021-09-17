import * as THREE                   from "three";
import {CAR_OPTIONS, WHEEL_OPTIONS} from "../physicsObjects";
import {CAMERA_OPTIONS}             from "../cameras";

export const groundGraphicsObject = () => {
  const groundMaterial = new THREE.MeshStandardMaterial();
  const groundGeometry = new THREE.PlaneBufferGeometry(10, 10);
  const groundMesh = new THREE.Mesh(
    groundGeometry,
    groundMaterial
  )
  groundMesh.receiveShadow = true
  groundMesh.rotation.x = -Math.PI * 0.5

  return {
    groundMesh,
    groundGeometry,
    groundMaterial
  }
};

export const carGraphicsObject = () => {
  const chassisMaterial = new THREE.MeshStandardMaterial({
    color: "red",
    wireframe: true
  });
  const chassisGeometry = new THREE.BoxBufferGeometry(CAR_OPTIONS.chassisDepth, CAR_OPTIONS.chassisWidth, CAR_OPTIONS.chassisHeight);
  const chassisMesh = new THREE.Mesh(chassisGeometry, chassisMaterial);

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: "blue"
  });
  const wheelGeometry = new THREE.CylinderBufferGeometry(WHEEL_OPTIONS.radius, WHEEL_OPTIONS.radius, WHEEL_OPTIONS.height);

  return {
    chassisMesh,
    createWheelMesh: () => new THREE.Mesh(wheelGeometry, wheelMaterial)
  }
};

export const testSphereGraphicsObject = () => {
  const sphereMaterial = new THREE.MeshStandardMaterial();
  const sphereGeometry = new THREE.BoxBufferGeometry(1, 2, 1);
  const sphereMesh = new THREE.Mesh(
    sphereGeometry,
    sphereMaterial
  )

  return {
    sphereMesh,
    sphereGeometry,
    sphereMaterial
  }
};