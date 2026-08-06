/**
 * YOURCRAFT - Physics & Collision Engine
 * AABB collision detection, gravity, step-assist up 1-block steps, and swimming
 */

import { BLOCK_DATA, BLOCKS, CONFIG } from '../utils/config.js';

export class Physics {
  constructor(world) {
    this.world = world;
  }

  updatePlayer(player, delta) {
    if (!player.isFlying && !player.inWater) {
      player.velocity.y += CONFIG.GRAVITY * delta;
      player.velocity.y = Math.max(player.velocity.y, -35);
    } else if (player.inWater && !player.isFlying) {
      player.velocity.y = Math.max(player.velocity.y, -3.5);
    }

    // 1. Move X with Step-Up support
    let dx = player.velocity.x * delta;
    player.position.x += dx;
    if (this.checkCollision(player)) {
      // Try step-up by 1 block height
      player.position.y += CONFIG.STEP_HEIGHT;
      if (this.checkCollision(player)) {
        // Step failed, undo
        player.position.y -= CONFIG.STEP_HEIGHT;
        player.position.x -= dx;
        player.velocity.x = 0;
      }
    }

    // 2. Move Z with Step-Up support
    let dz = player.velocity.z * delta;
    player.position.z += dz;
    if (this.checkCollision(player)) {
      // Try step-up by 1 block height
      player.position.y += CONFIG.STEP_HEIGHT;
      if (this.checkCollision(player)) {
        player.position.y -= CONFIG.STEP_HEIGHT;
        player.position.z -= dz;
        player.velocity.z = 0;
      }
    }

    // 3. Move Y (Vertical)
    let dy = player.velocity.y * delta;
    player.position.y += dy;
    player.onGround = false;

    if (this.checkCollision(player)) {
      player.position.y -= dy;
      if (player.velocity.y < 0) {
        player.onGround = true;
      }
      player.velocity.y = 0;
    }

    // Water & Lava detection
    const headBlock = this.world.getBlock(
      Math.floor(player.position.x),
      Math.floor(player.position.y + CONFIG.PLAYER_EYE_HEIGHT),
      Math.floor(player.position.z)
    );
    const feetBlock = this.world.getBlock(
      Math.floor(player.position.x),
      Math.floor(player.position.y),
      Math.floor(player.position.z)
    );

    player.inWater = (headBlock === BLOCKS.WATER || feetBlock === BLOCKS.WATER);
    player.inLava = (headBlock === BLOCKS.LAVA || feetBlock === BLOCKS.LAVA);
  }

  checkCollision(player) {
    const halfW = CONFIG.PLAYER_WIDTH / 2;
    const minX = Math.floor(player.position.x - halfW);
    const maxX = Math.floor(player.position.x + halfW);
    const minY = Math.floor(player.position.y);
    const maxY = Math.floor(player.position.y + CONFIG.PLAYER_HEIGHT);
    const minZ = Math.floor(player.position.z - halfW);
    const maxZ = Math.floor(player.position.z + halfW);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const blockId = this.world.getBlock(x, y, z);
          const data = BLOCK_DATA[blockId];

          if (data && data.solid) {
            const pMinX = player.position.x - halfW;
            const pMaxX = player.position.x + halfW;
            const pMinY = player.position.y;
            const pMaxY = player.position.y + CONFIG.PLAYER_HEIGHT;
            const pMinZ = player.position.z - halfW;
            const pMaxZ = player.position.z + halfW;

            if (pMaxX > x && pMinX < x + 1 &&
                pMaxY > y && pMinY < y + 1 &&
                pMaxZ > z && pMinZ < z + 1) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
}
