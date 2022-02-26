import { Howl } from 'howler';

// @ts-ignore
import brick1Sound from './brick/brick-1.mp3';
// @ts-ignore
import brick2Sound from './brick/brick-2.mp3';
// @ts-ignore
import brick3Sound from './brick/brick-3.mp3';
// @ts-ignore
import brick4Sound from './brick/brick-4.mp3';
// @ts-ignore
import brick5Sound from './brick/brick-5.mp3';
// @ts-ignore
import brick6Sound from './brick/brick-6.mp3';
// @ts-ignore
import brick7Sound from './brick/brick-7.mp3';
// @ts-ignore
import bowlingPinSound from './pin/pin-1.mp3';
// @ts-ignore
import carHit1Sound from './car/car-hit-1.mp3';
// @ts-ignore
import carHit2Sound from './car/car-hit-2.mp3';
// @ts-ignore
import carHit3Sound from './car/car-hit-3.mp3';
// @ts-ignore
import carHit4Sound from './car/car-hit-4.mp3';
// @ts-ignore
import teleportSound from './teleport/teleport.mp3';
// @ts-ignore
import lampBrokenSound from './lampPost/lampBroken.mp3';
// @ts-ignore
import heySound from './hey/hey.mp3';
// @ts-ignore
import barrelSound from './barrel/barrelSound.mp3';

type soundTypes = 'brick' | 'pin' | 'ball' | 'carHit' | 'teleport' | 'lampBroken' | 'hey' | 'barrel';

type sounds = {
	name: soundTypes;
	sounds: any[];
	minDelta: number;
	velocityMin: number;
	velocityMultiplier: number;
	volumeMin: number;
	volumeMax: number;
	rateMin: number;
	rateMax: number;
	lastTime: number;
};

const sounds: sounds[] = [
	{
		name: 'brick',
		sounds: [brick1Sound, brick2Sound, brick3Sound, brick4Sound, brick5Sound, brick6Sound, brick7Sound],
		minDelta: 150,
		velocityMin: 1,
		velocityMultiplier: 0.75,
		volumeMin: 0.2,
		volumeMax: 0.5,
		rateMin: 0.5,
		rateMax: 0.75,
		lastTime: 0,
	},
	{
		name: 'hey',
		sounds: [heySound],
		minDelta: 100,
		velocityMin: 1.2,
		velocityMultiplier: 0.75,
		volumeMin: 0.1,
		volumeMax: 0.4,
		rateMin: 0.8,
		rateMax: 1,
		lastTime: 0,
	},
	{
		name: 'barrel',
		sounds: [barrelSound],
		minDelta: 200,
		velocityMin: 1.5,
		velocityMultiplier: 0.75,
		volumeMin: 0.1,
		volumeMax: 0.4,
		rateMin: 0.8,
		rateMax: 1,
		lastTime: 0,
	},
	{
		name: 'pin',
		sounds: [bowlingPinSound],
		minDelta: 100,
		velocityMin: 1,
		velocityMultiplier: 0.5,
		volumeMin: 0.35,
		volumeMax: 0.6,
		rateMin: 0.1,
		rateMax: 0.85,
		lastTime: 0,
	},
	{
		name: 'ball',
		sounds: [bowlingPinSound],
		minDelta: 0,
		velocityMin: 1,
		velocityMultiplier: 0.5,
		volumeMin: 0.35,
		volumeMax: 0.6,
		rateMin: 0.1,
		rateMax: 0.2,
		lastTime: 0,
	},
	{
		name: 'teleport',
		sounds: [teleportSound],
		minDelta: 0,
		velocityMin: 0,
		velocityMultiplier: 1,
		volumeMin: 0.5,
		volumeMax: 0.7,
		rateMin: 0.7,
		rateMax: 1,
		lastTime: 0,
	},
	{
		name: 'carHit',
		sounds: [carHit1Sound, carHit2Sound, carHit3Sound, carHit4Sound],
		minDelta: 100,
		velocityMin: 2,
		velocityMultiplier: 1,
		volumeMin: 0.3,
		volumeMax: 0.5,
		rateMin: 0.9,
		rateMax: 1,
		lastTime: 0,
	},
	{
		name: 'lampBroken',
		sounds: [lampBrokenSound],
		minDelta: 100,
		velocityMin: 0,
		velocityMultiplier: 0,
		volumeMin: 0.7,
		volumeMax: 1,
		rateMin: 1,
		rateMax: 1,
		lastTime: 0,
	},
];

const soundsWithHowl = sounds.map(sound => ({
	...sound,
	sounds: sound.sounds.map(src => new Howl({ src: [src] })),
}));

export const playSound: (soundName: soundTypes, velocity: number) => void = (soundName, velocity) => {
	const soundItem = soundsWithHowl.find(sound => sound.name === soundName);
	const currentTime = Date.now();

	if (soundItem && currentTime > soundItem.lastTime + soundItem.minDelta && (soundItem.velocityMin === 0 || velocity > soundItem.velocityMin)) {
		// Find random sound
		const randomSound = soundItem.sounds[Math.floor(Math.random() * soundItem.sounds.length)];

		// Update volume
		let volume = Math.min(Math.max((velocity - soundItem.velocityMin) * soundItem.velocityMultiplier, soundItem.volumeMin), soundItem.volumeMax);
		volume **= 2;
		randomSound.volume(volume);

		// Update rate
		const rateAmplitude = soundItem.rateMax - soundItem.rateMin;
		randomSound.rate(soundItem.rateMin + Math.random() * rateAmplitude);

		// Play
		randomSound.play();

		// Save last play time
		soundItem.lastTime = currentTime;
	}
};
