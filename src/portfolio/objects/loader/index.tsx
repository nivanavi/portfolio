import * as THREE from 'three';
// @ts-ignore
import { calInTickProps, DEFAULT_POSITION, MOST_IMPORTANT_DATA, objectProps } from '../../index';
import { loaderVertexShader } from './shaders/loaderVertexShader';
import { loaderFragmentsShader } from './shaders/loaderFragmentsShader';

export const loaderObject: (props?: objectProps) => THREE.Group = props => {
	const { position = DEFAULT_POSITION } = props || {};
	const { addToCallInTickStack } = MOST_IMPORTANT_DATA;
	const loaderContainer: THREE.Group = new THREE.Group();
	loaderContainer.name = 'loader';
	// loader shaders
	const loaderMaterial = new THREE.ShaderMaterial({
		uniforms: {
			uTime: { value: 0 },
			upperColor: { value: new THREE.Color('#4568dc') },
			depthColor: { value: new THREE.Color('#b06ab3') },
			elevationLevel: { value: 0.3 },
		},
		vertexShader: loaderVertexShader,
		fragmentShader: loaderFragmentsShader,
	});

	const loaderMesh = new THREE.Mesh();
	loaderMesh.geometry = new THREE.SphereBufferGeometry(3.5, 24, 24);
	loaderMesh.material = loaderMaterial;
	loaderContainer.add(loaderMesh);
	loaderContainer.position.copy(position);

	const callInTick: (propsCalInTick: calInTickProps) => void = ({ time }) => {
		loaderMaterial.uniforms.uTime.value = time * 3;
	};
	addToCallInTickStack(callInTick);

	return loaderContainer;
};
