import * as CANNON            from 'cannon-es'
import * as THREE             from "three";
import {dummyPhysicsMaterial} from "../../physics";

// @ts-ignore
import windWheelModelGltf                                                   from "./models/windWheel.gltf";
// @ts-ignore
import windArrowModelGltf                                                   from "./models/windArrow.gltf";
// @ts-ignore
import windLegsModelGltf                                                   from "./models/windLegs.gltf";
import {calInTickProps, DEFAULT_POSITION, MOST_IMPORTANT_DATA, objectProps} from "../../index";

const getRandomWindOption = () => ({
  windSpeed: Math.random() / 10,
  windDirection: Math.random() < 0.5,
  windAngle: Math.random() * Math.PI,
})

const WIND_TOWER_OPTIONS = {
  windAngle: 3,
  windCurrentAngle: 0,
  windAngleStep: 0.025,
  windSpeed: 0.05,
  windDirection: true,
}

export const windTowerObject = (props?: objectProps) => {
  const {position = DEFAULT_POSITION} = props || {};
  const {scene, physicWorld, gltfLoader, addToCallInTickStack} = MOST_IMPORTANT_DATA;

  const windTowerContainer: THREE.Group = new THREE.Group();
  windTowerContainer.name = "windTower";

  const windTowerHeadContainer: THREE.Group = new THREE.Group();
  windTowerContainer.name = "windTowerHead";

  const windWheelContainer: THREE.Group = new THREE.Group();
  windTowerContainer.name = "windWheel";

  windTowerHeadContainer.add(windWheelContainer);
  windTowerContainer.add(windTowerHeadContainer);

  // load models
  gltfLoader.load(
    windWheelModelGltf,
    model => {
      const windWheelModel = model.scene;
      windWheelModel.children.forEach(child => child.castShadow = true);
      windWheelModel.scale.set(0.25, 0.25, 0.25);
      windWheelModel.position.set(0, 0, 0.3)
      windWheelContainer.add(windWheelModel);
    }
  )
  gltfLoader.load(
    windArrowModelGltf,
    model => {
      const windArrowModel = model.scene;
      windArrowModel.children.forEach(child => child.castShadow = true);
      windArrowModel.scale.set(0.3, 0.3, 0.3);
      windArrowModel.position.set(0, 0, -0.35)
      windTowerHeadContainer.add(windArrowModel);
    }
  )
  gltfLoader.load(
    windLegsModelGltf,
    model => {
      const windLegsModel = model.scene;
      windLegsModel.children.forEach(child => child.castShadow = true);
      windLegsModel.scale.set(0.3, 0.3, 0.3);
      windLegsModel.position.set(0.125, 1.7, -0.07)
      windTowerContainer.add(windLegsModel);
    }
  )

  windTowerHeadContainer.position.y = windTowerHeadContainer.position.y + 3.4
  windTowerContainer.position.set(position.x, position.y, position.z)

  // physic
  const windTowerShape = new CANNON.Box(new CANNON.Vec3(0.3, 1, 0.3));
  const windTowerBody = new CANNON.Body({
    mass: 0,
    material: dummyPhysicsMaterial
  })
  windTowerBody.addShape(windTowerShape);
  windTowerBody.position.set(position.x + 0.127, position.y + 1, position.z - 0.07)
  physicWorld.addBody(windTowerBody);

  setInterval(() => {
    const {windDirection, windSpeed, windAngle} = getRandomWindOption();
    WIND_TOWER_OPTIONS.windDirection = windDirection
    WIND_TOWER_OPTIONS.windSpeed = windSpeed
    WIND_TOWER_OPTIONS.windAngle = windAngle
  }, 15000)

  const callInTick: (props: calInTickProps) => void = () => {
    if (WIND_TOWER_OPTIONS.windCurrentAngle < WIND_TOWER_OPTIONS.windAngle) {
      WIND_TOWER_OPTIONS.windCurrentAngle = WIND_TOWER_OPTIONS.windCurrentAngle + WIND_TOWER_OPTIONS.windAngleStep;
    }
    if (WIND_TOWER_OPTIONS.windCurrentAngle > WIND_TOWER_OPTIONS.windAngle) {
      WIND_TOWER_OPTIONS.windCurrentAngle = WIND_TOWER_OPTIONS.windCurrentAngle - WIND_TOWER_OPTIONS.windAngleStep;
    }
    windWheelContainer.rotation.z = windWheelContainer.rotation.z + (WIND_TOWER_OPTIONS.windDirection ? -WIND_TOWER_OPTIONS.windSpeed : WIND_TOWER_OPTIONS.windSpeed);
    windTowerHeadContainer.rotation.y = WIND_TOWER_OPTIONS.windCurrentAngle;
  }

  addToCallInTickStack(callInTick)
  scene.add(windTowerContainer);
}