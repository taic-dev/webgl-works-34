import { gsap } from "gsap"
import { App } from "./webgl/App";

const webgl = new App();
webgl.init();
gsap.ticker.add(() => {
  webgl.render()
  webgl.update()

});

window.addEventListener('resize', () => {
  webgl.resize()
})