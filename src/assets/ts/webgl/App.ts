import { Animation } from "./Animation,";
import { BloomEffect } from "./BloomEffect";
import { FaceModel } from "./FaceModel";
import { Setup } from "./Setup";

export class App {
  setup: Setup
  faceModel: FaceModel
  bloomEffect: BloomEffect
  animation: Animation

  constructor() {
    this.setup = new Setup();
    this.faceModel = new FaceModel(this.setup);
    this.bloomEffect = new BloomEffect(this.setup);
    this.animation = new Animation(this.setup, this.faceModel);
  }

  init() {
    this.faceModel.init();
    this.bloomEffect.init();
    this.animation.init()
  }

  render() {
    if(!this.setup.scene || !this.setup.camera) return
    this.setup.renderer?.render(this.setup.scene, this.setup.camera)
    this.faceModel.raf()
    this.bloomEffect.raf()
  }

  update() {

  }

  resize() {
    this.setup.resize();
  }
}