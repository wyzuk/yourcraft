/**
 * YOURCRAFT - Player Controller
 * First-person movement, camera-relative WASD vectors, inertia/acceleration, and Creative flying mode
 */

import { soundSystem } from '../audio/audio.js';
import { Inventory } from '../inventory/inventory.js';
import { CONFIG } from '../utils/config.js';

export class Player {
  constructor(camera, physics) {
    this.camera = camera;
    this.physics = physics;

    this.position = new THREE.Vector3(0, 35, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);

    this.onGround = false;
    this.inWater = false;
    this.inLava = false;

    // DEFAULT TO CREATIVE & FLYING MODE
    this.isCreative = true;
    this.isFlying = true;

    this.health = 20;
    this.maxHealth = 20;

    this.headBobTimer = 0;
    this.selectedSlot = 0;
    this.inventory = new Inventory();
  }

  spawn(x, y, z) {
    this.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.camera.update(this.position, CONFIG.PLAYER_EYE_HEIGHT);
  }

  update(delta, input) {
    let targetSpeed = CONFIG.WALK_SPEED;

    const isSprinting = input.isKeyPressed('ControlLeft') || input.isKeyPressed('ControlRight');
    const isSneaking = input.isKeyPressed('ShiftLeft') || input.isKeyPressed('ShiftRight');

    if (isSprinting) targetSpeed = CONFIG.SPRINT_SPEED;
    if (isSneaking) targetSpeed = CONFIG.SNEAK_SPEED;
    if (this.isFlying) targetSpeed = CONFIG.FLY_SPEED;

    const forward = this.camera.getForwardVector();
    const right = this.camera.getRightVector();

    const moveDir = new THREE.Vector3(0, 0, 0);

    if (input.isKeyPressed('KeyW')) moveDir.add(forward);
    if (input.isKeyPressed('KeyS')) moveDir.sub(forward);
    if (input.isKeyPressed('KeyD')) moveDir.add(right);
    if (input.isKeyPressed('KeyA')) moveDir.sub(right);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
    }

    const targetVelX = moveDir.x * targetSpeed;
    const targetVelZ = moveDir.z * targetSpeed;

    const accel = this.onGround || this.isFlying ? CONFIG.ACCELERATION : CONFIG.ACCELERATION * CONFIG.AIR_CONTROL;

    this.velocity.x += (targetVelX - this.velocity.x) * Math.min(1, accel * delta);
    this.velocity.z += (targetVelZ - this.velocity.z) * Math.min(1, accel * delta);

    if (this.isFlying) {
      let flyY = 0;
      if (input.isKeyPressed('Space')) flyY += CONFIG.FLY_SPEED;
      if (input.isKeyPressed('ShiftLeft') || input.isKeyPressed('ShiftRight')) flyY -= CONFIG.FLY_SPEED;
      this.velocity.y += (flyY - this.velocity.y) * Math.min(1, accel * delta);
    } else {
      if (input.isKeyPressed('Space')) {
        if (this.onGround) {
          this.velocity.y = CONFIG.JUMP_FORCE;
          this.onGround = false;
          soundSystem.playJump();
        } else if (this.inWater) {
          this.velocity.y = 4.0;
        }
      }
    }

    const wasOnGround = this.onGround;
    this.physics.updatePlayer(this, delta);

    if (!wasOnGround && this.onGround) {
      soundSystem.playStep();
    }

    let bobY = 0;
    const isMoving = (moveDir.lengthSq() > 0) && this.onGround && !this.isFlying;

    if (isMoving) {
      this.headBobTimer += delta * (isSprinting ? 14 : 9);
      bobY = Math.sin(this.headBobTimer) * 0.07;
      if (Math.sin(this.headBobTimer) > 0.95) {
        soundSystem.playStep();
      }
    } else {
      this.headBobTimer = 0;
    }

    this.camera.update(this.position, CONFIG.PLAYER_EYE_HEIGHT + bobY);
  }
}
