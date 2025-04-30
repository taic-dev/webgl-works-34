import * as THREE from "three";
import { Setup } from "./Setup";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  getImagePositionAndSize,
  ImagePositionAndSize,
} from "../utils/getElementSize";
import fragmentShader from "../../shader/face/fragmentShader.glsl";
import vertexShader from "../../shader/face/vertexShader.glsl";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export class FaceModel {
  element: HTMLImageElement | null;
  setup: Setup;
  light: THREE.PointLight | null;
  material: THREE.ShaderMaterial | null;
  modelGroup: THREE.Group;

  constructor(setup: Setup) {
    this.element = document.querySelector<HTMLImageElement>(".js-face-texture");
    this.setup = setup;
    this.light = null;
    this.material = null;
    this.modelGroup = new THREE.Group();
  }

  init() {
    if (!this.element) return;
    const info = getImagePositionAndSize(this.element);
    this.setMaterial(info);
    this.setModel();
  }

  setUniforms(info: ImagePositionAndSize) {
    const commonUniforms = {
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0.0 },
    };

    return {
      uPlaneSize: { value: new THREE.Vector2(info.dom.width, info.dom.height) },
      uProgress: { value: 0 },
      uFreq: { value: 0.1 },
      uAmp: { value: 100 },
      ...commonUniforms,
    };
  }

  setMaterial(info: ImagePositionAndSize) {
    const uniforms = this.setUniforms(info);
    this.material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      side: THREE.DoubleSide,
      wireframe: this.setup.guiValue.wireframe,
    });
  }

  setModel() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      `/model/face-draco.gltf`,
      (gltf) => {
        const faceModel = gltf.scene;
        const faceModelMesh = faceModel.children[0].children[0].children[0];
        (faceModelMesh as any).material = this.material;

        const box = new THREE.Box3().setFromObject(faceModel);
        const center = new THREE.Vector3();
        box.getCenter(center);
        faceModel.position.sub(center);

        this.modelGroup.add(faceModel);
        this.modelGroup.rotation.set(0, (Math.PI * 4 + (-Math.PI / 8)), 0);
        this.setup.scene?.add(this.modelGroup);
      },
      undefined,
      (error) => {
        console.log(error);
      }
    );
  }

  raf() {
    if (!this.material) return;
    (this.material as any).uniforms.uTime.value += 1;
    this.material.wireframe = this.setup.guiValue.wireframe;
    this.material.uniforms.uProgress.value = this.setup.guiValue.progress;
    this.material.uniforms.uFreq.value = this.setup.guiValue.frequency;
    this.material.uniforms.uAmp.value = this.setup.guiValue.amplitude;
  }
}
