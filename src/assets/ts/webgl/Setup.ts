import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PARAMS } from "./constants";
import GUI from "lil-gui";

export class Setup {
  renderer: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  ambientLight: THREE.AmbientLight | null;
  directionalLight: THREE.DirectionalLight | null;
  loader: THREE.TextureLoader;
  guiValue: any;
  controls: OrbitControls | null;

  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.ambientLight = null;
    this.directionalLight = null;
    this.controls = null;
    this.guiValue = null;
    this.loader = new THREE.TextureLoader();

    this.init();
  }

  init() {
    this.setRenderer();
    this.setScene();
    this.setCamera();
    this.setAmbientLight();
    this.setDirectionalLight();
    this.setGui();
    this.setHelper();
  }

  setRenderer() {
    const element = document.querySelector(".webgl");
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(PARAMS.WINDOW.W, PARAMS.WINDOW.H);
    element?.appendChild(this.renderer.domElement);
  }

  updateRenderer() {
    this.renderer?.setSize(window.innerWidth, window.innerHeight);
    this.renderer?.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  setScene() {
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    const cubeCamera = new THREE.CubeCamera(0.1, 500, cubeRenderTarget);
    this.scene = new THREE.Scene();

    const generateCubeUrls = (prefix: string, postfix: string) => {
      return [
        `${prefix}dark-s_px${postfix}`,
        `${prefix}dark-s_nx${postfix}`,
        `${prefix}dark-s_py${postfix}`,
        `${prefix}dark-s_ny${postfix}`,
        `${prefix}dark-s_pz${postfix}`,
        `${prefix}dark-s_nz${postfix}`,
      ];
    };
    const cubeTextureUrls = generateCubeUrls("/cubeMap/", ".jpg");

    const loadTexture = async () => {
      if(!this.scene || !this.renderer) return

      try {
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        const cubeTexture = await cubeTextureLoader.loadAsync(cubeTextureUrls);
        this.scene.background = cubeTexture;
        this.scene.environment = cubeTexture;
        cubeCamera.update(this.renderer, this.scene);
      } catch (e) {
        console.log(e);
      }
    };
    loadTexture();
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      PARAMS.CAMERA.FOV,
      PARAMS.CAMERA.ASPECT,
      PARAMS.CAMERA.NEAR,
      PARAMS.CAMERA.FAR
    );
    this.camera.position.set(0, 0, 40);
  }

  updateCamera() {
    if (!this.camera) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera?.updateProjectionMatrix();
    this.camera.position.set(0, 0, 40);
  }

  setDirectionalLight() {
    this.directionalLight = new THREE.DirectionalLight(0xfff0dd, 5);
    this.directionalLight.position.set(0, 10, 10);
    this.scene?.add(this.directionalLight);
  }

  setAmbientLight() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 10);
    this.scene?.add(this.ambientLight);
  }

  setGui() {
    const gui = new GUI();
    this.guiValue = {
      progress: 0,
      frequency: 0.1,
      amplitude: 100,
      wireframe: false,
    };
    gui.add(this.guiValue, "progress", -100, 100, 0.01);
    gui.add(this.guiValue, "frequency", 0, 0.1, 0.01);
    gui.add(this.guiValue, "amplitude", 0, 100, 0.01);
    gui.add(this.guiValue, "wireframe");
  }

  setHelper() {
    if (!this.camera) return;
    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer?.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.2;

    // AxesHelper
    const axesHelper = new THREE.AxesHelper(2000);
    this.scene?.add(axesHelper);
  }

  resize() {
    this.updateRenderer();
    this.updateCamera();
  }
}
