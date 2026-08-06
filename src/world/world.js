/**
 * YOURCRAFT - World Manager & Procedural Terrain
 * Terrain heightmaps, biome layering, trees, underground caves, ores, priority chunk loader & surface spawn finder
 */

import { Chunk } from '../chunks/chunk.js';
import { BiomeManager } from '../terrain/biomes.js';
import { TerrainNoise } from '../terrain/noise.js';
import { BLOCK_DATA, BLOCKS, CONFIG } from '../utils/config.js';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.chunks = new Map();
    this.noise = new TerrainNoise();
    this.biomeManager = new BiomeManager();

    this.renderDistance = CONFIG.DEFAULT_RENDER_DISTANCE;
    this.loadedPlayerChunk = { cx: null, cz: null };
  }

  getChunkKey(cx, cz) {
    return `${cx},${cz}`;
  }

  getBlock(x, y, z) {
    if (y < 0 || y >= CONFIG.CHUNK_HEIGHT) return BLOCKS.AIR;

    const cx = Math.floor(x / CONFIG.CHUNK_SIZE);
    const cz = Math.floor(z / CONFIG.CHUNK_SIZE);
    const chunk = this.chunks.get(this.getChunkKey(cx, cz));
    if (!chunk) return BLOCKS.AIR;

    const lx = ((x % CONFIG.CHUNK_SIZE) + CONFIG.CHUNK_SIZE) % CONFIG.CHUNK_SIZE;
    const lz = ((z % CONFIG.CHUNK_SIZE) + CONFIG.CHUNK_SIZE) % CONFIG.CHUNK_SIZE;

    return chunk.getBlock(lx, y, lz);
  }

  setBlock(x, y, z, blockId) {
    if (y < 0 || y >= CONFIG.CHUNK_HEIGHT) return;

    const cx = Math.floor(x / CONFIG.CHUNK_SIZE);
    const cz = Math.floor(z / CONFIG.CHUNK_SIZE);
    const key = this.getChunkKey(cx, cz);

    let chunk = this.chunks.get(key);
    if (!chunk) {
      chunk = this.generateChunk(cx, cz);
      this.chunks.set(key, chunk);
      this.scene.add(chunk.meshGroup);
    }

    const lx = ((x % CONFIG.CHUNK_SIZE) + CONFIG.CHUNK_SIZE) % CONFIG.CHUNK_SIZE;
    const lz = ((z % CONFIG.CHUNK_SIZE) + CONFIG.CHUNK_SIZE) % CONFIG.CHUNK_SIZE;

    chunk.setBlock(lx, y, lz, blockId);
    chunk.buildMesh();

    // Rebuild adjacent boundary neighbor ONLY if on edge
    if (lx === 0) this.dirtyChunk(cx - 1, cz);
    if (lx === CONFIG.CHUNK_SIZE - 1) this.dirtyChunk(cx + 1, cz);
    if (lz === 0) this.dirtyChunk(cx, cz - 1);
    if (lz === CONFIG.CHUNK_SIZE - 1) this.dirtyChunk(cx, cz + 1);
  }

  dirtyChunk(cx, cz) {
    const chunk = this.chunks.get(this.getChunkKey(cx, cz));
    if (chunk) chunk.buildMesh();
  }

  // Preload immediate chunks around player position
  preloadSpawnArea(playerPos) {
    const playerCx = Math.floor(playerPos.x / CONFIG.CHUNK_SIZE);
    const playerCz = Math.floor(playerPos.z / CONFIG.CHUNK_SIZE);

    for (let r = 0; r <= this.renderDistance; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          if (Math.abs(dx) !== r && Math.abs(dz) !== r) continue;
          const cx = playerCx + dx;
          const cz = playerCz + dz;
          const key = this.getChunkKey(cx, cz);

          if (!this.chunks.has(key)) {
            const chunk = this.generateChunk(cx, cz);
            chunk.buildMesh();
            this.chunks.set(key, chunk);
            this.scene.add(chunk.meshGroup);
          }
        }
      }
    }
  }

  // Priority Radial Chunk Loader (concentric rings from center outward)
  update(playerPos) {
    const playerCx = Math.floor(playerPos.x / CONFIG.CHUNK_SIZE);
    const playerCz = Math.floor(playerPos.z / CONFIG.CHUNK_SIZE);

    const activeKeys = new Set();
    const chunksToGenerate = [];

    // Collect active chunk keys sorted by radial distance
    for (let r = 0; r <= this.renderDistance; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          if (dx * dx + dz * dz > this.renderDistance * this.renderDistance + 1) continue;

          const cx = playerCx + dx;
          const cz = playerCz + dz;
          const key = this.getChunkKey(cx, cz);
          activeKeys.add(key);

          if (!this.chunks.has(key)) {
            chunksToGenerate.push({ cx, cz, key, distSq: dx * dx + dz * dz });
          }
        }
      }
    }

    // Sort closest chunks first
    chunksToGenerate.sort((a, b) => a.distSq - b.distSq);

    // Limit to max 2 chunk generations per frame to avoid lag spikes
    const processCount = Math.min(chunksToGenerate.length, 2);
    for (let i = 0; i < processCount; i++) {
      const item = chunksToGenerate[i];
      const chunk = this.generateChunk(item.cx, item.cz);
      chunk.buildMesh();
      this.chunks.set(item.key, chunk);
      this.scene.add(chunk.meshGroup);
    }

    // Unload distant chunks
    for (const [key, chunk] of this.chunks.entries()) {
      if (!activeKeys.has(key)) {
        this.scene.remove(chunk.meshGroup);
        chunk.dispose();
        this.chunks.delete(key);
      }
    }

    this.loadedPlayerChunk.cx = playerCx;
    this.loadedPlayerChunk.cz = playerCz;
  }

  generateChunk(cx, cz) {
    const chunk = new Chunk(cx, cz, this);

    for (let lx = 0; lx < CONFIG.CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CONFIG.CHUNK_SIZE; lz++) {
        const wx = cx * CONFIG.CHUNK_SIZE + lx;
        const wz = cz * CONFIG.CHUNK_SIZE + lz;

        const eNoise = this.noise.getElevation(wx, wz);
        const bNoise = this.noise.getBiomeNoise(wx, wz);

        const biome = this.biomeManager.getBiome(bNoise, eNoise);
        const height = this.biomeManager.calculateHeight(biome, eNoise);

        for (let y = 0; y < CONFIG.CHUNK_HEIGHT; y++) {
          if (y === 0) {
            chunk.setBlock(lx, y, lz, BLOCKS.BEDROCK);
            continue;
          }

          // 3D Cave Noise (deep underground below height-3)
          const isCave = (y < height - 3 && y > 3 && this.noise.getCaveNoise(wx, y, wz) > 0.58);
          if (isCave) {
            if (y <= 5) chunk.setBlock(lx, y, lz, BLOCKS.LAVA);
            else chunk.setBlock(lx, y, lz, BLOCKS.AIR);
            continue;
          }

          if (y < height - 3) {
            let block = BLOCKS.STONE;
            const nOre = Math.random();
            if (y < 12 && nOre < 0.01) block = BLOCKS.DIAMOND_ORE;
            else if (y < 20 && nOre < 0.015) block = BLOCKS.GOLD_ORE;
            else if (y < 30 && nOre < 0.025) block = BLOCKS.IRON_ORE;
            else if (y < 45 && nOre < 0.04) block = BLOCKS.COAL_ORE;

            chunk.setBlock(lx, y, lz, block);
          } else if (y < height) {
            if (biome.isDesert || height <= CONFIG.WATER_LEVEL + 1) {
              chunk.setBlock(lx, y, lz, BLOCKS.SAND);
            } else {
              chunk.setBlock(lx, y, lz, BLOCKS.DIRT);
            }
          } else if (y === height) {
            if (height < CONFIG.WATER_LEVEL - 1) {
              chunk.setBlock(lx, y, lz, BLOCKS.GRAVEL);
            } else if (biome.isDesert || height <= CONFIG.WATER_LEVEL + 1) {
              chunk.setBlock(lx, y, lz, BLOCKS.SAND);
            } else {
              chunk.setBlock(lx, y, lz, BLOCKS.GRASS);

              if (biome.treeChance && Math.random() < biome.treeChance && height > CONFIG.WATER_LEVEL + 2) {
                this.plantTree(chunk, lx, y + 1, lz);
              } else if (biome.flowerChance && Math.random() < biome.flowerChance) {
                const flower = Math.random() < 0.5 ? BLOCKS.FLOWER_RED : BLOCKS.FLOWER_YELLOW;
                chunk.setBlock(lx, y + 1, lz, flower);
              }
            }
          } else if (y <= CONFIG.WATER_LEVEL) {
            chunk.setBlock(lx, y, lz, BLOCKS.WATER);
          }
        }
      }
    }

    return chunk;
  }

  plantTree(chunk, lx, startY, lz) {
    const trunkHeight = 4 + Math.floor(Math.random() * 3);
    for (let y = 0; y < trunkHeight; y++) {
      chunk.setBlock(lx, startY + y, lz, BLOCKS.OAK_LOG);
    }
    const leafStart = startY + trunkHeight - 2;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        for (let dy = 0; dy <= 2; dy++) {
          if (Math.abs(dx) === 2 && Math.abs(dz) === 2 && Math.random() < 0.4) continue;
          const tx = lx + dx;
          const tz = lz + dz;
          const ty = leafStart + dy;
          if (tx >= 0 && tx < CONFIG.CHUNK_SIZE && tz >= 0 && tz < CONFIG.CHUNK_SIZE && ty < CONFIG.CHUNK_HEIGHT) {
            if (chunk.getBlock(tx, ty, tz) === BLOCKS.AIR) {
              chunk.setBlock(tx, ty, tz, BLOCKS.LEAVES);
            }
          }
        }
      }
    }
  }

  findSafeSpawn() {
    for (let r = 0; r < 120; r += 4) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        const x = Math.floor(Math.cos(angle) * r);
        const z = Math.floor(Math.sin(angle) * r);

        const cx = Math.floor(x / CONFIG.CHUNK_SIZE);
        const cz = Math.floor(z / CONFIG.CHUNK_SIZE);
        const key = this.getChunkKey(cx, cz);

        if (!this.chunks.has(key)) {
          const chunk = this.generateChunk(cx, cz);
          this.chunks.set(key, chunk);
          this.scene.add(chunk.meshGroup);
        }

        for (let y = CONFIG.CHUNK_HEIGHT - 2; y > CONFIG.WATER_LEVEL + 1; y--) {
          const ground = this.getBlock(x, y, z);
          const above1 = this.getBlock(x, y + 1, z);
          const above2 = this.getBlock(x, y + 2, z);

          const gData = BLOCK_DATA[ground];
          if (gData && gData.solid && !gData.liquid && ground !== BLOCKS.LEAVES) {
            if (above1 === BLOCKS.AIR && above2 === BLOCKS.AIR) {
              return { x: x + 0.5, y: y + 1, z: z + 0.5 };
            }
          }
        }
      }
    }
    return { x: 0.5, y: CONFIG.WATER_LEVEL + 8, z: 0.5 };
  }
}
