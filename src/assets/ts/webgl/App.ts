import { BloomEffect } from "./BloomEffect";
import { FaceModel } from "./FaceModel";
import { Setup } from "./Setup";

export class App {
  setup: Setup
  faceModel: FaceModel
  bloomEffect: BloomEffect

  constructor() {
    this.setup = new Setup();
    this.faceModel = new FaceModel(this.setup);
    this.bloomEffect = new BloomEffect(this.setup);
    
  }

  init() {
    this.faceModel.init();
    this.bloomEffect.init();
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