/**
 * YOURCRAFT - Main Application Coordinator (ES6 Entry Point)
 * Developer: Wyzuk (https://github.com/wyzuk)
 */

import { soundSystem } from './audio/audio.js';
import { GameCamera } from './camera/camera.js';
import { InputController } from './controls/controls.js';
import { Physics } from './physics/physics.js';
import { Player } from './player/player.js';
import { WorldRenderer } from './render/renderer.js';
import { SkySystem } from './render/sky.js';
import { textureGenerator } from './render/textures.js';
import { UIController } from './ui/ui.js';
import { BLOCK_DATA, BLOCKS, CONFIG } from './utils/config.js';
import { World } from './world/world.js';

class Game {
  constructor() {
    this.state = 'MENU';

    this.canvas = document.getElementById('render-canvas');
    this.camera = new GameCamera();
    this.renderer = new WorldRenderer(this.canvas, this.camera);
    this.sky = new SkySystem(this.renderer.scene);
    this.world = new World(this.renderer.scene);
    this.physics = new Physics(this.world);
    this.controls = new InputController(this.camera);
    this.player = new Player(this.camera, this.physics);
    this.ui = new UIController(this);

    this.lastTime = performance.now();
    this.fps = 60;
    this.frameCount = 0;
    this.fpsTimer = 0;

    this.targetBlock = null;
    this.targetFaceNormal = null;

    // Rate limiter for mining/placing while holding mouse buttons
    this.lastMineTime = 0;
    this.lastPlaceTime = 0;
    this.actionCooldownMs = 220; // 220ms delay between consecutive actions

    this.setupCallbacks();
    this.initGame();
  }

  initGame() {
    textureGenerator.generateAll();

    // Guaranteed Surface Spawn
    const spawn = this.world.findSafeSpawn();
    this.player.spawn(spawn.x, spawn.y, spawn.z);

    // Preload spawn area (9x9 chunks) before giving control
    this.world.preloadSpawnArea(this.player.position);

    requestAnimationFrame((t) => this.loop(t));
  }

  setupCallbacks() {
    this.controls.onLeftClick = () => {
      if (this.state === 'PLAYING' && !this.ui.isInventoryOpen) {
        this.mineTargetBlock();
      }
    };

    this.controls.onRightClick = () => {
      if (this.state === 'PLAYING' && !this.ui.isInventoryOpen) {
        this.placeSelectedBlock();
      }
    };

    this.controls.onSelectHotbar = (slot, isRelative = false) => {
      if (isRelative) {
        let newSlot = (this.player.selectedSlot + slot) % 9;
        if (newSlot < 0) newSlot += 9;
        this.player.selectedSlot = newSlot;
      } else {
        this.player.selectedSlot = slot;
      }
      this.ui.updateHotbar();
    };

    this.controls.onToggleInventory = () => {
      if (this.state === 'PLAYING') {
        this.ui.toggleInventory();
      }
    };

    this.controls.onTogglePause = () => {
      if (this.state === 'PLAYING') {
        if (this.ui.isInventoryOpen) {
          this.ui.toggleInventory();
        } else {
          this.state = 'PAUSED';
          this.ui.showPauseMenu(true);
        }
      } else if (this.state === 'PAUSED') {
        this.resumeGame();
      }
    };

    this.controls.onToggleCreative = () => {
      if (this.state === 'PLAYING') {
        this.player.isCreative = !this.player.isCreative;
        if (!this.player.isCreative) this.player.isFlying = false;
        const msg = this.player.isCreative ? "Creative Mode Enabled [Flying Allowed]" : "Survival Mode Enabled";
        this.ui.showToast(msg);
      }
    };

    this.controls.onToggleFlying = () => {
      if (this.state === 'PLAYING' && this.player.isCreative) {
        this.player.isFlying = !this.player.isFlying;
        this.ui.showToast(this.player.isFlying ? "Flying Enabled" : "Flying Disabled");
      }
    };
  }

  startPlay() {
    soundSystem.init();
    this.state = 'PLAYING';
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    this.controls.requestPointerLock();
  }

  resumeGame() {
    this.state = 'PLAYING';
    this.ui.showPauseMenu(false);
    this.controls.requestPointerLock();
  }

  generateNewWorld() {
    for (const [key, chunk] of this.world.chunks.entries()) {
      this.renderer.scene.remove(chunk.meshGroup);
      chunk.dispose();
    }
    this.world.chunks.clear();
    this.world.noise.reseed();

    const spawn = this.world.findSafeSpawn();
    this.player.spawn(spawn.x, spawn.y, spawn.z);
    this.world.preloadSpawnArea(this.player.position);
    this.world.loadedPlayerChunk = { cx: null, cz: null };

    this.resumeGame();
  }

  returnToMainMenu() {
    this.state = 'MENU';
    this.ui.showPauseMenu(false);
    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('hud').classList.add('hidden');
    this.controls.exitPointerLock();
  }

  loop(currentTime) {
    const delta = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.frameCount++;
    this.fpsTimer += delta;
    if (this.fpsTimer >= 1.0) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    if (this.state === 'MENU') {
      const time = currentTime * 0.0003;
      this.camera.threeCamera.position.set(Math.cos(time) * 40, 35, Math.sin(time) * 40);
      this.camera.threeCamera.lookAt(0, 25, 0);
      this.sky.update(delta);
    } else if (this.state === 'PLAYING') {
      if (!this.ui.isInventoryOpen) {
        this.player.update(delta, this.controls);
        this.world.update(this.player.position);
        this.raycastTargetBlock();

        // Handle continuous mining/placing while mouse button held
        if (this.controls.isLeftMouseDown) {
          this.mineTargetBlock();
        }
        if (this.controls.isRightMouseDown) {
          this.placeSelectedBlock();
        }
      }
      this.sky.update(delta);
      this.renderer.updateParticles(delta);

      const playerY = Math.floor(this.player.position.y);
      let biomeName = "Plains";
      if (playerY > 45) biomeName = "Mountains";
      else if (playerY < 18) biomeName = "Underground Cave";

      this.ui.updateHUD(this.fps, this.player.position, biomeName, this.player.isCreative, this.player.isFlying);
    }

    this.renderer.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  raycastTargetBlock() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera.threeCamera);
    raycaster.far = CONFIG.REACH_DISTANCE;

    const origin = raycaster.ray.origin;
    const dir = raycaster.ray.direction;

    let currX = Math.floor(origin.x);
    let currY = Math.floor(origin.y);
    let currZ = Math.floor(origin.z);

    const stepX = dir.x >= 0 ? 1 : -1;
    const stepY = dir.y >= 0 ? 1 : -1;
    const stepZ = dir.z >= 0 ? 1 : -1;

    let tMaxX = (currX + (stepX > 0 ? 1 : 0) - origin.x) / dir.x;
    let tMaxY = (currY + (stepY > 0 ? 1 : 0) - origin.y) / dir.y;
    let tMaxZ = (currZ + (stepZ > 0 ? 1 : 0) - origin.z) / dir.z;

    const tDeltaX = Math.abs(1 / dir.x);
    const tDeltaY = Math.abs(1 / dir.y);
    const tDeltaZ = Math.abs(1 / dir.z);

    let distance = 0;
    let faceNormal = new THREE.Vector3();

    while (distance < CONFIG.REACH_DISTANCE) {
      const blockId = this.world.getBlock(currX, currY, currZ);
      const data = BLOCK_DATA[blockId];

      if (data && data.solid) {
        this.targetBlock = new THREE.Vector3(currX, currY, currZ);
        this.targetFaceNormal = faceNormal;
        this.renderer.setTargetBlock(this.targetBlock);
        return;
      }

      if (tMaxX < tMaxY) {
        if (tMaxX < tMaxZ) {
          currX += stepX;
          distance = tMaxX;
          tMaxX += tDeltaX;
          faceNormal.set(-stepX, 0, 0);
        } else {
          currZ += stepZ;
          distance = tMaxZ;
          tMaxZ += tDeltaZ;
          faceNormal.set(0, 0, -stepZ);
        }
      } else {
        if (tMaxY < tMaxZ) {
          currY += stepY;
          distance = tMaxY;
          tMaxY += tDeltaY;
          faceNormal.set(0, -stepY, 0);
        } else {
          currZ += stepZ;
          distance = tMaxZ;
          tMaxZ += tDeltaZ;
          faceNormal.set(0, 0, -stepZ);
        }
      }
    }

    this.targetBlock = null;
    this.targetFaceNormal = null;
    this.renderer.setTargetBlock(null);
  }

  mineTargetBlock() {
    if (!this.targetBlock) return;
    const now = performance.now();
    if (now - this.lastMineTime < this.actionCooldownMs) return;
    this.lastMineTime = now;

    const x = this.targetBlock.x;
    const y = this.targetBlock.y;
    const z = this.targetBlock.z;

    const blockId = this.world.getBlock(x, y, z);
    const data = BLOCK_DATA[blockId];

    if (!data || (data.hardness < 0 && !this.player.isCreative)) return;

    this.renderer.spawnBlockBreakParticles(x, y, z, blockId);
    soundSystem.playMine(blockId);

    this.world.setBlock(x, y, z, BLOCKS.AIR);

    if (!this.player.isCreative && data.drop !== BLOCKS.AIR && data.drop !== null) {
      this.player.inventory.addItem(data.drop, 1);
      this.ui.updateHotbar();
    }
  }

  placeSelectedBlock() {
    if (!this.targetBlock || !this.targetFaceNormal) return;
    const now = performance.now();
    if (now - this.lastPlaceTime < this.actionCooldownMs) return;
    this.lastPlaceTime = now;

    const activeSlot = this.player.inventory.getSlot(this.player.selectedSlot);
    if (!activeSlot || typeof activeSlot.id !== 'number') return;

    const placeX = this.targetBlock.x + this.targetFaceNormal.x;
    const placeY = this.targetBlock.y + this.targetFaceNormal.y;
    const placeZ = this.targetBlock.z + this.targetFaceNormal.z;

    const halfW = CONFIG.PLAYER_WIDTH / 2;
    const playerMinX = this.player.position.x - halfW;
    const playerMaxX = this.player.position.x + halfW;
    const playerMinY = this.player.position.y;
    const playerMaxY = this.player.position.y + CONFIG.PLAYER_HEIGHT;
    const playerMinZ = this.player.position.z - halfW;
    const playerMaxZ = this.player.position.z + halfW;

    if (playerMaxX > placeX && playerMinX < placeX + 1 &&
        playerMaxY > placeY && playerMinY < placeY + 1 &&
        playerMaxZ > placeZ && playerMinZ < placeZ + 1) {
      return;
    }

    this.world.setBlock(placeX, placeY, placeZ, activeSlot.id);
    soundSystem.playPlace();

    if (!this.player.isCreative) {
      this.player.inventory.removeItem(this.player.selectedSlot, 1);
      this.ui.updateHotbar();
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
