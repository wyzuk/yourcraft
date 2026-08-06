/**
 * YOURCRAFT - UI Controller & HUD
 * Manages menus, HUD, hotbar slots, inventory modal, settings, and toast notifications
 */

import { soundSystem } from '../audio/audio.js';
import { BLOCK_DATA, ITEM_DATA } from '../utils/config.js';

export class UIController {
  constructor(game) {
    this.game = game;
    this.isInventoryOpen = false;
    this.isPauseOpen = false;
    this.isCraftingTableOpen = false;

    this.initDOM();
  }

  initDOM() {
    this.mainMenu = document.getElementById('main-menu');
    this.pauseMenu = document.getElementById('pause-menu');
    this.inventoryModal = document.getElementById('inventory-modal');
    this.settingsModal = document.getElementById('settings-modal');
    this.creditsModal = document.getElementById('credits-modal');
    this.hud = document.getElementById('hud');

    document.getElementById('btn-play').addEventListener('click', () => this.game.startPlay());
    document.getElementById('btn-settings').addEventListener('click', () => this.showSettings(true));
    document.getElementById('btn-credits').addEventListener('click', () => this.showCredits(true));
    
    document.getElementById('btn-resume').addEventListener('click', () => this.game.resumeGame());
    document.getElementById('btn-pause-settings').addEventListener('click', () => this.showSettings(true));
    document.getElementById('btn-new-world').addEventListener('click', () => this.game.generateNewWorld());
    document.getElementById('btn-main-menu').addEventListener('click', () => this.game.returnToMainMenu());

    document.getElementById('btn-close-settings').addEventListener('click', () => this.showSettings(false));
    document.getElementById('btn-close-credits').addEventListener('click', () => this.showCredits(false));

    document.getElementById('setting-sensitivity').addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.game.controls.mouseSensitivity = val;
    });

    document.getElementById('setting-render-dist').addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      this.game.world.renderDistance = val;
      document.getElementById('val-render-dist').innerText = val;
    });

    document.getElementById('setting-volume').addEventListener('input', (e) => {
      soundSystem.setVolume(parseFloat(e.target.value));
    });

    document.getElementById('btn-fullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

    this.buildHotbarDOM();
  }

  showToast(message) {
    let toast = document.getElementById('game-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'game-toast';
      toast.style.position = 'absolute';
      toast.style.top = '70px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.background = 'rgba(0, 0, 0, 0.75)';
      toast.style.color = '#ffeb3b';
      toast.style.padding = '8px 16px';
      toast.style.borderRadius = '20px';
      toast.style.fontFamily = 'monospace';
      toast.style.fontSize = '0.9rem';
      toast.style.zIndex = '100';
      toast.style.pointerEvents = 'none';
      document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.style.display = 'block';

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.style.display = 'none';
    }, 2000);
  }

  buildHotbarDOM() {
    const container = document.getElementById('hotbar-slots');
    container.innerHTML = '';

    for (let i = 0; i < 9; i++) {
      const slot = document.createElement('div');
      slot.className = `hotbar-slot ${i === 0 ? 'active' : ''}`;
      slot.dataset.index = i;
      slot.addEventListener('click', () => this.game.controls.onSelectHotbar(i));
      container.appendChild(slot);
    }
  }

  updateHotbar() {
    const slots = document.querySelectorAll('#hotbar-slots .hotbar-slot');
    const inv = this.game.player.inventory;

    slots.forEach((slotEl, idx) => {
      slotEl.classList.toggle('active', idx === this.game.player.selectedSlot);
      const item = inv.getSlot(idx);
      slotEl.innerHTML = '';
      if (item) this.renderItemIcon(slotEl, item);
    });
  }

  renderItemIcon(container, item) {
    const name = this.getItemName(item.id);
    container.innerHTML = `
      <div class="item-icon-box" title="${name}">
        <span class="item-name-short">${name.slice(0, 3)}</span>
        <span class="item-count">${item.count > 1 ? item.count : ''}</span>
      </div>
    `;
  }

  getItemName(id) {
    if (typeof id === 'number') {
      return BLOCK_DATA[id] ? BLOCK_DATA[id].name : "Block";
    } else {
      return ITEM_DATA[id] ? ITEM_DATA[id].name : "Item";
    }
  }

  updateHUD(fps, pos, biome, isCreative, isFlying) {
    this.updateHotbar();

    const healthContainer = document.getElementById('health-bar');
    if (healthContainer) {
      const hearts = Math.ceil(this.game.player.health / 2);
      healthContainer.innerHTML = '❤️'.repeat(hearts);
    }

    const debugEl = document.getElementById('debug-stats');
    if (debugEl) {
      debugEl.innerHTML = `
        FPS: ${fps}<br>
        XYZ: ${pos.x.toFixed(1)} / ${pos.y.toFixed(1)} / ${pos.z.toFixed(1)}<br>
        Biome: ${biome}<br>
        Mode: ${isCreative ? (isFlying ? "Creative (Flying)" : "Creative") : "Survival"}
      `;
    }
  }

  toggleInventory(isCraftingTable = false) {
    this.isCraftingTableOpen = isCraftingTable;
    this.isInventoryOpen = !this.isInventoryOpen;

    if (this.isInventoryOpen) {
      this.game.controls.exitPointerLock();
      this.inventoryModal.classList.remove('hidden');
      this.renderInventoryModal();
    } else {
      this.inventoryModal.classList.add('hidden');
      if (!this.isPauseOpen) this.game.controls.requestPointerLock();
    }
  }

  renderInventoryModal() {
    const gridContainer = document.getElementById('inv-main-grid');
    gridContainer.innerHTML = '';
    const inv = this.game.player.inventory;

    for (let i = 0; i < 36; i++) {
      const slotEl = document.createElement('div');
      slotEl.className = 'inv-slot';
      slotEl.dataset.index = i;
      const item = inv.getSlot(i);
      if (item) this.renderItemIcon(slotEl, item);
      gridContainer.appendChild(slotEl);
    }

    const craftContainer = document.getElementById('inv-craft-grid');
    craftContainer.innerHTML = '';
    const size = this.isCraftingTableOpen ? 3 : 2;
    craftContainer.style.gridTemplateColumns = `repeat(${size}, 48px)`;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const slotEl = document.createElement('div');
        slotEl.className = 'inv-slot craft-input-slot';
        craftContainer.appendChild(slotEl);
      }
    }
  }

  showPauseMenu(show) {
    this.isPauseOpen = show;
    if (show) {
      this.pauseMenu.classList.remove('hidden');
      this.hud.classList.add('hidden');
      this.game.controls.exitPointerLock();
    } else {
      this.pauseMenu.classList.add('hidden');
      this.hud.classList.remove('hidden');
    }
  }

  showSettings(show) {
    if (show) this.settingsModal.classList.remove('hidden');
    else this.settingsModal.classList.add('hidden');
    soundSystem.playUIClick();
  }

  showCredits(show) {
    if (show) this.creditsModal.classList.remove('hidden');
    else this.creditsModal.classList.add('hidden');
    soundSystem.playUIClick();
  }
}
