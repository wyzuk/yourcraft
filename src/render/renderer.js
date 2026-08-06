/**
 * YOURCRAFT - WebGL Renderer
 * Handles Three.js WebGLRenderer, particle systems, selection outline, and render pipeline
 */

import { textureGenerator } from './textures.js';

export class WorldRenderer {
  constructor(canvas, camera) {
    this.canvas = canvas;
    this.camera = camera;
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Selection box outline for target block
    const selGeo = new THREE.BoxGeometry(1.002, 1.002, 1.002);
    const selMat = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
    this.selectionBox = new THREE.Mesh(selGeo, selMat);
    this.selectionBox.visible = false;
    this.scene.add(this.selectionBox);

    this.particles = [];

    window.addEventListener('resize', () => this.onResize());
  }

  spawnBlockBreakParticles(x, y, z, blockId) {
    const mat = textureGenerator.getMaterial(blockId);
    const count = 10;

    for (let i = 0; i < count; i++) {
      const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const mesh = new THREE.Mesh(geo, Array.isArray(mat) ? mat[0] : mat);

      mesh.position.set(
        x + 0.5 + (Math.random() - 0.5) * 0.4,
        y + 0.5 + (Math.random() - 0.5) * 0.4,
        z + 0.5 + (Math.random() - 0.5) * 0.4
      );

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 3
      );

      this.scene.add(mesh);
      this.particles.push({ mesh, velocity, life: 0.5 });
    }
  }

  updateParticles(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;
      p.position.addScaledVector(p.velocity, delta);
      p.velocity.y -= 14 * delta;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        this.particles.splice(i, 1);
      }
    }
  }

  setTargetBlock(blockPos) {
    if (blockPos) {
      this.selectionBox.position.set(blockPos.x + 0.5, blockPos.y + 0.5, blockPos.z + 0.5);
      this.selectionBox.visible = true;
    } else {
      this.selectionBox.visible = false;
    }
  }

  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera.threeCamera);
  }
}
