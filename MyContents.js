import * as THREE from "three";
import { MyGame } from "./game/MyGame.js";

/**
 *  This class contains the contents of out application
 */
class MyContents {
  /**
       constructs the object
       @param {MyApp} app The application object
    */
  constructor(app) {
    this.app = app;
    this.game = new MyGame(app);
    this.game.init();
  }

  /**
   * initializes the contents
   */
  init() {
    this.createLights();
    this.createSkybox();
  }

  createLights() {
    // add an ambient light
    const ambientLight = new THREE.AmbientLight(0x111111);
    this.app.scene.add(ambientLight);
  }

  /**
   * creates the skybox
   */
  createSkybox() {
    const geometry = new THREE.BoxGeometry(1000, 1000, 1000);
    let texture = new THREE.CubeTextureLoader().load([
        "./images/skybox.jpg",
        "./images/skybox.jpg",
        "./images/skybox.jpg",
        "./images/skybox.jpg",
        "./images/skybox.jpg",
        "./images/skybox.jpg"
    ]);
    let material = new THREE.MeshPhongMaterial({
        envMap: texture,
        emissive: 0xffffff,
        emissiveIntensity: 1,
        side: THREE.BackSide
    });
    this.skybox = new THREE.Mesh(geometry, material);
    this.app.scene.add(this.skybox);
  }

  /**
   * updates the contents
   * this method is called from the render method of the app
   */
  update() {
    this.game.update();
  }
}

export { MyContents };
