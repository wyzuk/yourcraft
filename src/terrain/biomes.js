/**
 * YOURCRAFT - Biome Generator
 * Handles biome selection, height calculation, and block layering
 */

import { BLOCKS, CONFIG } from '../utils/config.js';

export const BIOMES = {
  PLAINS: { name: "Plains", heightMult: 6, baseHeight: 24, treeChance: 0.008, flowerChance: 0.08 },
  FOREST: { name: "Forest", heightMult: 8, baseHeight: 25, treeChance: 0.045, flowerChance: 0.05 },
  MOUNTAINS: { name: "Mountains", heightMult: 22, baseHeight: 32, treeChance: 0.003 },
  DESERT: { name: "Desert", heightMult: 5, baseHeight: 23, isDesert: true },
  BEACH: { name: "Beach", heightMult: 2, baseHeight: 21, isSand: true },
  OCEAN: { name: "Ocean", heightMult: 4, baseHeight: 14, isOcean: true },
};

export class BiomeManager {
  getBiome(bNoise, eNoise) {
    if (eNoise < -0.3) return BIOMES.OCEAN;
    if (eNoise < -0.15) return BIOMES.BEACH;
    if (bNoise > 0.4) return BIOMES.DESERT;
    if (eNoise > 0.35) return BIOMES.MOUNTAINS;
    if (bNoise < -0.1) return BIOMES.FOREST;
    return BIOMES.PLAINS;
  }

  calculateHeight(biome, eNoise) {
    let h = Math.floor(biome.baseHeight + eNoise * biome.heightMult);
    return Math.max(CONFIG.BEDROCK_LEVEL + 4, Math.min(CONFIG.CHUNK_HEIGHT - 4, h));
  }
}
