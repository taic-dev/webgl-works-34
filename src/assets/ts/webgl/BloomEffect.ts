import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { Setup } from "./Setup";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import fragmentShader from "../../shader/effect/fragmentShader.glsl";
import vertexShader from "../../shader/effect/vertexShader.glsl";

export class BloomEffect {
  setup: Setup;
  renderPass: RenderPass | null;
  unrealBloomPass: UnrealBloomPass | null
  outPass: OutputPass;
  shaderPass: ShaderPass | null;
  effectComposer1: EffectComposer | null;
  effectComposer2: EffectComposer | null;

  constructor(setup: Setup) {
    this.setup = setup;
    this.renderPass = null;
    this.unrealBloomPass = null;
    this.outPass = new OutputPass();
    this.shaderPass = null;
    this.effectComposer1 = null;
    this.effectComposer2 = null;
  }

  init() {
    if (!this.setup.renderer || !this.setup.scene || !this.setup.camera) return;

    const scale = 1;
    const radius = 0.1;

    this.renderPass = new RenderPass(this.setup.scene, this.setup.camera);
    this.unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerHeight * scale, window.innerWidth * scale), 0.5, radius, 0.2);
    this.effectComposer1 = new EffectComposer(this.setup.renderer);
    this.effectComposer2 = new EffectComposer(this.setup.renderer);
    this.shaderPass = new ShaderPass(new THREE.ShaderMaterial(this.setMaterial()));

    this.effectComposer1.addPass(this.renderPass);
    this.effectComposer1.addPass(this.unrealBloomPass);
    this.effectComposer1.renderToScreen = false;

    this.effectComposer2.addPass(this.renderPass);
    this.effectComposer2.addPass(this.shaderPass);
    this.effectComposer2.addPass(this.outPass);
  }

  setMaterial() {
    return {
      uniforms: this.setUniforms(),
      fragmentShader,
      vertexShader,
    };
  }

  setUniforms() {
    return {
      tDiffuse: { value: null },
      uStrength: { value: 1 },
      uBloomTexture: { value: this.effectComposer1?.renderTarget2.texture },
    };
  }

  update() {
    this.effectComposer1?.setSize(window.innerWidth, window.innerHeight);
    this.effectComposer2?.setSize(window.innerWidth, window.innerHeight);
  }

  raf() {
    this.effectComposer1?.render();
    this.effectComposer2?.render();
  }
}
