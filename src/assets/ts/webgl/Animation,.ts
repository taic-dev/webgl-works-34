import * as THREE from "three";
import { gsap } from "gsap";
import { FaceModel } from "./FaceModel";
import { Setup } from "./Setup";
import { EASING } from "../utils/constant";

export class Animation {
  setup: Setup;
  faceModel: FaceModel;

  constructor(setup: Setup, faceModel: FaceModel) {
    this.setup = setup;
    this.faceModel = faceModel;
  }

  init() {
    this.cameraPosition();
    this.repeatPosition();
    this.repeatScale();
  }

  cameraPosition() {
    if(!this.setup.camera) return
    gsap.fromTo(this.setup.camera.position, {
      x: -40,
      y: -40,
      z: -40,
    },
    {
      x: 0,
      y: 0,
      z: 45,
      duration: 3,
      ease: EASING.TRANSFORM,
      onUpdate: () => {
        this.setup.camera?.lookAt(new THREE.Vector3(0, 0, 0));
      }
    });
  }

  repeatPosition() {
    gsap.to(this.faceModel.modelGroup.position, {
      y: 2,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
  }

  repeatScale() {
    gsap.to(this.faceModel.modelGroup.scale, {
      x: 1.05,
      y: 1.05,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
  }
}