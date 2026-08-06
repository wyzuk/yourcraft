/**
 * YOURCRAFT - Sky & Atmosphere
 * Sun/Moon orbit, sky color transitions, clouds, and fog
 */

import { CONFIG } from '../utils/config.js';

export class SkySystem {
  constructor(scene) {
    this.scene = scene;
    this.dayTime = 0;

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.1);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.scene.add(this.sunLight);

    this.fog = new THREE.FogExp2('#87ceeb', 0.015);
    this.scene.fog = this.fog;
    this.scene.background = new THREE.Color('#87ceeb');
  }

  update(delta) {
    this.dayTime += delta / CONFIG.DAY_DURATION_SECONDS;
    if (this.dayTime > 1) this.dayTime -= 1;

    const angle = this.dayTime * Math.PI * 2;
    const distance = 200;

    this.sunLight.position.x = Math.cos(angle) * distance;
    this.sunLight.position.y = Math.sin(angle) * distance;
    this.sunLight.position.z = 40;

    const sunHeight = Math.sin(angle);
    const skyColor = new THREE.Color('#87ceeb');

    if (sunHeight < -0.1) {
      skyColor.set('#060714');
      this.ambientLight.intensity = 0.15;
      this.sunLight.intensity = 0.1;
    } else if (sunHeight < 0.2) {
      skyColor.set('#ff7744');
      this.ambientLight.intensity = 0.4;
      this.sunLight.intensity = 0.6;
    } else {
      this.ambientLight.intensity = 0.5;
      this.sunLight.intensity = 1.1;
    }

    this.scene.background = skyColor;
    this.fog.color = skyColor;
  }
}
