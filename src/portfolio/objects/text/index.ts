import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { copyPositions, copyPositionType, createModelContainer } from '../../utils';
import { dummyPhysicsMaterial } from '../../physics';

// @ts-ignore
import textModelGltf from './models/font.gltf';
import { calInTickProps, DEFAULT_POSITION, MOST_IMPORTANT_DATA, objectProps } from '../../index';
import { playSound } from '../../sounds';

type textObjectType = { text: string } & objectProps;

export const textObject: (props: textObjectType) => void = props => {
	const { position = DEFAULT_POSITION, text } = props || {};
	const { scene, physicWorld, addToCallInTickStack, gltfLoader } = MOST_IMPORTANT_DATA;

	// physic
	const textShape = new CANNON.Box(new CANNON.Vec3(0.22, 0.34, 0.1));
	const letters: copyPositionType[] = [];

	// load models
	createModelContainer({
		gltfLoader,
		containerName: 'text',
		modelSrc: textModelGltf,
		callback: (_, modelScene) => {
			const createLetter: (letterPosition: CANNON.Vec3, letter: string) => void = (letterPosition, letter) => {
				const body = new CANNON.Body({
					mass: 1,
					material: dummyPhysicsMaterial,
				});
				body.addShape(textShape);
				body.allowSleep = true;
				body.sleepSpeedLimit = 0.01;
				body.position.copy(letterPosition);
				body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI * 0.5);
				const letterContainer: THREE.Group = new THREE.Group();
				const mesh: THREE.Object3D | undefined = modelScene.children.find(({ name }) => name.toLowerCase() === letter.toLowerCase())?.clone();
				if (!mesh) return;
				mesh.scale.set(1.2, 1.2, 1.2);
				mesh.position.set(-0.27, -0.33, 0);
				letterContainer.add(mesh);
				physicWorld.addBody(body);
				scene.add(letterContainer);

				letters.push({
					mesh: letterContainer,
					body,
				});

				body.addEventListener('collide', (ev: any) => {
					const relativeVelocity = ev.contact.getImpactVelocityAlongNormal();
					playSound('brick', relativeVelocity);
				});
			};
			const createText: () => void = () => {
				const textArray: string[] = text.split('');
				const currentLetterPosition = new CANNON.Vec3(position.x, position.y + 0.3, position.z);
				textArray.forEach(letter => {
					const isSpace: boolean = letter === '_';
					if (isSpace) {
						currentLetterPosition.z -= 0.4;
					}
					if (!isSpace) {
						createLetter(currentLetterPosition, letter);
						currentLetterPosition.z -= 0.55;
					}
				});
			};
			createText();
		},
	});

	const callInTick: (propsCalInTick: calInTickProps) => void = () => letters.forEach(letter => copyPositions(letter));
	addToCallInTickStack(callInTick);
};
