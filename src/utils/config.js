/**
 * YOURCRAFT - Game Configuration & Constants
 * Developer: Wyzuk (https://github.com/wyzuk)
 */

export const CONFIG = {
  TITLE: "YOURCRAFT",
  SUBTITLE: "A Procedural Voxel Sandbox",
  DEVELOPER: "Wyzuk",
  GITHUB: "https://github.com/wyzuk",

  // World dimensions
  CHUNK_SIZE: 16,
  CHUNK_HEIGHT: 64,
  WATER_LEVEL: 20,
  BEDROCK_LEVEL: 1,

  // Settings
  DEFAULT_RENDER_DISTANCE: 4, // Chunks radius (9x9 chunks active)
  DEFAULT_SENSITIVITY: 0.002,
  DEFAULT_VOLUME: 0.7,
  GRAVITY: -24.0,
  JUMP_FORCE: 8.5,
  WALK_SPEED: 5.0,
  SPRINT_SPEED: 8.5,
  SNEAK_SPEED: 2.2,
  FLY_SPEED: 14.0,

  // Acceleration & Friction
  ACCELERATION: 45.0,
  FRICTION: 12.0,
  AIR_CONTROL: 0.4,
  STEP_HEIGHT: 1.05, // Auto step up 1 block

  // Player box
  PLAYER_WIDTH: 0.6,
  PLAYER_HEIGHT: 1.8,
  PLAYER_EYE_HEIGHT: 1.62,
  REACH_DISTANCE: 5.5,

  // Day / Night cycle (5 minutes)
  DAY_DURATION_SECONDS: 300,
};

export const BLOCKS = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  COBBLESTONE: 4,
  SAND: 5,
  GRAVEL: 6,
  OAK_LOG: 7,
  LEAVES: 8,
  WOOD_PLANKS: 9,
  COAL_ORE: 10,
  IRON_ORE: 11,
  GOLD_ORE: 12,
  DIAMOND_ORE: 13,
  BEDROCK: 14,
  WATER: 15,
  LAVA: 16,
  GLASS: 17,
  BRICKS: 18,
  CRAFTING_TABLE: 19,
  FURNACE: 20,
  TORCH: 21,
  FLOWER_RED: 22,
  FLOWER_YELLOW: 23,
  TALL_GRASS: 24,
  SNOW_GRASS: 25,
  CACTUS: 26,
};

export const BLOCK_DATA = {
  [BLOCKS.AIR]: { name: "Air", transparent: true, solid: false, hardness: 0 },
  [BLOCKS.GRASS]: { name: "Grass Block", hardness: 0.6, tool: "shovel", drop: BLOCKS.DIRT, solid: true },
  [BLOCKS.DIRT]: { name: "Dirt", hardness: 0.5, tool: "shovel", drop: BLOCKS.DIRT, solid: true },
  [BLOCKS.STONE]: { name: "Stone", hardness: 1.5, tool: "pickaxe", drop: BLOCKS.COBBLESTONE, reqTier: 1, solid: true },
  [BLOCKS.COBBLESTONE]: { name: "Cobblestone", hardness: 2.0, tool: "pickaxe", drop: BLOCKS.COBBLESTONE, reqTier: 1, solid: true },
  [BLOCKS.SAND]: { name: "Sand", hardness: 0.5, tool: "shovel", drop: BLOCKS.SAND, solid: true },
  [BLOCKS.GRAVEL]: { name: "Gravel", hardness: 0.6, tool: "shovel", drop: BLOCKS.GRAVEL, solid: true },
  [BLOCKS.OAK_LOG]: { name: "Oak Log", hardness: 2.0, tool: "axe", drop: BLOCKS.OAK_LOG, solid: true },
  [BLOCKS.LEAVES]: { name: "Oak Leaves", hardness: 0.2, transparent: true, solid: true, tool: "shear", drop: BLOCKS.AIR },
  [BLOCKS.WOOD_PLANKS]: { name: "Oak Planks", hardness: 2.0, tool: "axe", drop: BLOCKS.WOOD_PLANKS, solid: true },
  [BLOCKS.COAL_ORE]: { name: "Coal Ore", hardness: 3.0, tool: "pickaxe", drop: BLOCKS.COAL_ORE, reqTier: 1, solid: true },
  [BLOCKS.IRON_ORE]: { name: "Iron Ore", hardness: 3.0, tool: "pickaxe", drop: BLOCKS.IRON_ORE, reqTier: 2, solid: true },
  [BLOCKS.GOLD_ORE]: { name: "Gold Ore", hardness: 3.0, tool: "pickaxe", drop: BLOCKS.GOLD_ORE, reqTier: 3, solid: true },
  [BLOCKS.DIAMOND_ORE]: { name: "Diamond Ore", hardness: 3.5, tool: "pickaxe", drop: BLOCKS.DIAMOND_ORE, reqTier: 3, solid: true },
  [BLOCKS.BEDROCK]: { name: "Bedrock", hardness: -1, solid: true, drop: null },
  [BLOCKS.WATER]: { name: "Water", transparent: true, solid: false, liquid: true, hardness: 0 },
  [BLOCKS.LAVA]: { name: "Lava", transparent: true, solid: false, liquid: true, light: 15, hardness: 0 },
  [BLOCKS.GLASS]: { name: "Glass", transparent: true, solid: true, hardness: 0.3, drop: BLOCKS.AIR },
  [BLOCKS.BRICKS]: { name: "Bricks", hardness: 2.0, tool: "pickaxe", drop: BLOCKS.BRICKS, solid: true },
  [BLOCKS.CRAFTING_TABLE]: { name: "Crafting Table", hardness: 2.5, tool: "axe", drop: BLOCKS.CRAFTING_TABLE, solid: true },
  [BLOCKS.FURNACE]: { name: "Furnace", hardness: 3.5, tool: "pickaxe", drop: BLOCKS.FURNACE, solid: true },
  [BLOCKS.TORCH]: { name: "Torch", transparent: true, solid: false, light: 14, hardness: 0, drop: BLOCKS.TORCH },
  [BLOCKS.FLOWER_RED]: { name: "Red Rose", transparent: true, solid: false, plant: true, hardness: 0, drop: BLOCKS.FLOWER_RED },
  [BLOCKS.FLOWER_YELLOW]: { name: "Yellow Flower", transparent: true, solid: false, plant: true, hardness: 0, drop: BLOCKS.FLOWER_YELLOW },
  [BLOCKS.TALL_GRASS]: { name: "Tall Grass", transparent: true, solid: false, plant: true, hardness: 0, drop: BLOCKS.AIR },
  [BLOCKS.SNOW_GRASS]: { name: "Snowy Grass", hardness: 0.6, tool: "shovel", drop: BLOCKS.DIRT, solid: true },
  [BLOCKS.CACTUS]: { name: "Cactus", hardness: 0.4, solid: true, drop: BLOCKS.CACTUS },
};

export const ITEMS = {
  WOOD_PICKAXE: "wood_pickaxe",
  STONE_PICKAXE: "stone_pickaxe",
  IRON_PICKAXE: "iron_pickaxe",
  GOLD_PICKAXE: "gold_pickaxe",
  DIAMOND_PICKAXE: "diamond_pickaxe",

  WOOD_AXE: "wood_axe",
  STONE_AXE: "stone_axe",
  IRON_AXE: "iron_axe",

  STICK: "stick",
  COAL: "coal",
  IRON_INGOT: "iron_ingot",
  DIAMOND: "diamond",
};

export const ITEM_DATA = {
  [ITEMS.WOOD_PICKAXE]: { name: "Wooden Pickaxe", type: "tool", toolType: "pickaxe", tier: 1, speed: 2, maxDurability: 60 },
  [ITEMS.STONE_PICKAXE]: { name: "Stone Pickaxe", type: "tool", toolType: "pickaxe", tier: 2, speed: 4, maxDurability: 132 },
  [ITEMS.IRON_PICKAXE]: { name: "Iron Pickaxe", type: "tool", toolType: "pickaxe", tier: 3, speed: 6, maxDurability: 250 },
  [ITEMS.DIAMOND_PICKAXE]: { name: "Diamond Pickaxe", type: "tool", toolType: "pickaxe", tier: 5, speed: 8, maxDurability: 1561 },

  [ITEMS.WOOD_AXE]: { name: "Wooden Axe", type: "tool", toolType: "axe", tier: 1, speed: 2, maxDurability: 60 },
  [ITEMS.STONE_AXE]: { name: "Stone Axe", type: "tool", toolType: "axe", tier: 2, speed: 4, maxDurability: 132 },
  [ITEMS.IRON_AXE]: { name: "Iron Axe", type: "tool", toolType: "axe", tier: 3, speed: 6, maxDurability: 250 },

  [ITEMS.STICK]: { name: "Stick", type: "item" },
  [ITEMS.COAL]: { name: "Coal", type: "item" },
  [ITEMS.IRON_INGOT]: { name: "Iron Ingot", type: "item" },
  [ITEMS.DIAMOND]: { name: "Diamond", type: "item" },
};
