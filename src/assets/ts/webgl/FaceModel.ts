import * as THREE from "three";
import { Setup } from "./Setup";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  getImagePositionAndSize,
  ImagePositionAndSize,
} from "../utils/getElementSize";
import snoise from "../../shader/noise/snoise.glsl";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export class FaceModel {
  element: HTMLImageElement | null;
  setup: Setup;
  light: THREE.PointLight | null;
  material: THREE.MeshPhysicalMaterial | null;
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
      uFreq: { value: 0.05 },
      uAmp: { value: 100 },
      ...commonUniforms,
    };
  }

  setMaterial(info: ImagePositionAndSize) {
    this.material = new THREE.MeshPhysicalMaterial({
      side: THREE.DoubleSide,
      metalness: 1.0,
      roughness: 0.0,
    });

    this.setShader(info);
  }

  setShader(info: ImagePositionAndSize) {
    if(!this.material) return
    const uniforms = this.setUniforms(info);
    this.material.onBeforeCompile = (shader) => {
      shader.uniforms.uResolution = uniforms.uResolution;
      shader.uniforms.uMouse = uniforms.uMouse;
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uPlaneSize = uniforms.uPlaneSize;
      shader.uniforms.uProgress = uniforms.uProgress;
      shader.uniforms.uFreq = uniforms.uFreq;
      shader.uniforms.uAmp = uniforms.uAmp;

      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `#include <common>
        varying vec3 vPosition;`
      );
  
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vPosition = position;`
      );
  
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform float uTime;
  
        uniform float uProgress;
        uniform float uFreq;
        uniform float uAmp;
  
        uniform vec2 uPlaneSize;
  
        varying vec2 vUv;
        varying vec3 vPosition;
  
        ${snoise}
      `);
  
      shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', `#include <dithering_fragment>
        float noise = snoise(vPosition * uFreq) * uAmp;
  
        if(noise < uProgress) discard;
  
        float edgeWidth = uProgress + 3.;
        if(noise > uProgress && noise < edgeWidth) {
          gl_FragColor = vec4(vec3(0.0, 0.898, 1.0), noise);  
        }
  
        gl_FragColor = vec4(gl_FragColor.xyz, 1.0);
      `);

      Object.assign(this.material?.userData, { uniforms });
    };
  }

  setModel() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      `${import.meta.env.BASE_URL}/model/face-draco.gltf`,
      (gltf) => {
        const faceModel = gltf.scene;
        const faceModelMesh = faceModel.children[0].children[0].children[0];
        (faceModelMesh as any).material = this.material;

        const box = new THREE.Box3().setFromObject(faceModel);
        const center = new THREE.Vector3();
        box.getCenter(center);
        faceModel.position.sub(center);

        this.modelGroup.add(faceModel);
        this.modelGroup.rotation.set(0, Math.PI * 4 + -Math.PI / 8, 0);
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
    const uniforms = this.material.userData.uniforms;
    if (!uniforms) return;
    uniforms.uTime.value += 1;
    uniforms.uProgress.value = this.setup.guiValue.progress;
    uniforms.uFreq.value = this.setup.guiValue.frequency;
    uniforms.uAmp.value = this.setup.guiValue.amplitude;
  }
}
