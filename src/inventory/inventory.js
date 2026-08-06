/**
 * YOURCRAFT - Inventory Management
 * 36 slot player inventory with stacking up to 64
 */

import { BLOCKS } from '../utils/config.js';

export class Inventory {
  constructor() {
    this.slots = new Array(36).fill(null);
    this.initDefaultItems();
  }

  initDefaultItems() {
    this.slots[0] = { id: BLOCKS.GRASS, count: 64 };
    this.slots[1] = { id: BLOCKS.DIRT, count: 64 };
    this.slots[2] = { id: BLOCKS.STONE, count: 64 };
    this.slots[3] = { id: BLOCKS.WOOD_PLANKS, count: 32 };
    this.slots[4] = { id: BLOCKS.CRAFTING_TABLE, count: 1 };
    this.slots[5] = { id: BLOCKS.TORCH, count: 16 };
  }

  addItem(itemId, count = 1) {
    if (!itemId) return 0;
    for (let i = 0; i < 36; i++) {
      const slot = this.slots[i];
      if (slot && slot.id === itemId && slot.count < 64) {
        const addable = Math.min(count, 64 - slot.count);
        slot.count += addable;
        count -= addable;
        if (count <= 0) return 0;
      }
    }
    for (let i = 0; i < 36; i++) {
      if (!this.slots[i]) {
        const addable = Math.min(count, 64);
        this.slots[i] = { id: itemId, count: addable };
        count -= addable;
        if (count <= 0) return 0;
      }
    }
    return count;
  }

  removeItem(slotIndex, count = 1) {
    const slot = this.slots[slotIndex];
    if (!slot) return false;
    slot.count -= count;
    if (slot.count <= 0) {
      this.slots[slotIndex] = null;
    }
    return true;
  }

  getSlot(slotIndex) {
    return this.slots[slotIndex] || null;
  }
}
