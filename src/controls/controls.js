/**
 * YOURCRAFT - Input Controller
 * Pointer Lock API, mouse look, WASD movement keys, double-tap Space flying
 */

import { CONFIG } from '../utils/config.js';

export class InputController {
  constructor(camera) {
    this.camera = camera;
    this.keys = {};
    this.mouseSensitivity = CONFIG.DEFAULT_SENSITIVITY;
    this.pointerLocked = false;

    this.onLeftClick = null;
    this.onRightClick = null;
    this.onToggleInventory = null;
    this.onTogglePause = null;
    this.onToggleCreative = null;
    this.onSelectHotbar = null;
    this.onToggleFlying = null;

    this.lastSpacePress = 0;

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Hotbar selection 1-9
      if (e.code.startsWith('Digit') && e.code.length === 6) {
        const digit = parseInt(e.code.charAt(5));
        if (digit >= 1 && digit <= 9 && this.onSelectHotbar) {
          this.onSelectHotbar(digit - 1);
        }
      }

      // Creative Mode Toggle (Key C)
      if (e.code === 'KeyC' && !e.repeat) {
        if (this.onToggleCreative) this.onToggleCreative();
      }

      // Double tap Space for Creative Flying
      if (e.code === 'Space' && !e.repeat) {
        const now = performance.now();
        if (now - this.lastSpacePress < 300) {
          if (this.onToggleFlying) this.onToggleFlying();
        }
        this.lastSpacePress = now;
      }

      if (e.code === 'KeyE') {
        if (this.onToggleInventory) this.onToggleInventory();
      }

      if (e.code === 'Escape') {
        if (this.onTogglePause) this.onTogglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = (document.pointerLockElement === document.body);
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.pointerLocked) return;

      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;

      this.camera.yaw -= movementX * this.mouseSensitivity;
      this.camera.pitch -= movementY * this.mouseSensitivity;

      // Clamp pitch (-89 deg to +89 deg)
      const maxPitch = Math.PI / 2 - 0.01;
      this.camera.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.camera.pitch));
    });

    window.addEventListener('mousedown', (e) => {
      if (!this.pointerLocked) return;
      if (e.button === 0) {
        this.isLeftMouseDown = true;
        if (this.onLeftClick) this.onLeftClick();
      }
      if (e.button === 2) {
        this.isRightMouseDown = true;
        if (this.onRightClick) this.onRightClick();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.isLeftMouseDown = false;
      if (e.button === 2) this.isRightMouseDown = false;
    });

    window.addEventListener('wheel', (e) => {
      if (!this.pointerLocked) return;
      const delta = Math.sign(e.deltaY);
      if (this.onSelectHotbar) this.onSelectHotbar(delta, true);
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  requestPointerLock() {
    document.body.requestPointerLock();
  }

  exitPointerLock() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  isKeyPressed(code) {
    return !!this.keys[code];
  }
}
