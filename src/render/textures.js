/**
 * YOURCRAFT - Texture Generator
 * Generates crisp 16x16 pixel textures procedurally using HTML5 Canvas
 */

import { BLOCKS } from '../utils/config.js';

export class TextureGenerator {
  constructor() {
    this.textures = {};
    this.materials = {};
    this.canvasSize = 16;
  }

  createCanvasTexture(drawFn) {
    const canvas = document.createElement('canvas');
    canvas.width = this.canvasSize;
    canvas.height = this.canvasSize;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    drawFn(ctx, this.canvasSize);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
  }

  addNoise(ctx, baseColor, noiseAmount = 15) {
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 16, 16);

    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if (Math.random() < 0.6) {
          const shift = (Math.random() - 0.5) * noiseAmount;
          ctx.fillStyle = this.adjustColor(baseColor, shift);
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  adjustColor(colorHex, amount) {
    let col = colorHex.replace('#', '');
    if (col.length === 3) col = col.split('').map(c => c + c).join('');
    let num = parseInt(col, 16);
    let r = Math.max(0, Math.min(255, (num >> 16) + amount));
    let g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    let b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  generateAll() {
    const dirtTex = this.createCanvasTexture(ctx => this.addNoise(ctx, '#795548', 25));
    const grassTopTex = this.createCanvasTexture(ctx => this.addNoise(ctx, '#4caf50', 30));
    
    const grassSideTex = this.createCanvasTexture(ctx => {
      this.addNoise(ctx, '#795548', 25);
      ctx.fillStyle = '#4caf50';
      for (let x = 0; x < 16; x++) {
        const depth = 3 + Math.floor(Math.sin(x * 1.5) * 1.5);
        for (let y = 0; y < depth; y++) ctx.fillRect(x, y, 1, 1);
      }
    });

    const stoneTex = this.createCanvasTexture(ctx => this.addNoise(ctx, '#808080', 20));
    const cobbleTex = this.createCanvasTexture(ctx => {
      this.addNoise(ctx, '#666666', 35);
      ctx.fillStyle = '#333333';
      for (let i = 0; i < 16; i += 4) {
        ctx.fillRect(i, 0, 1, 16);
        ctx.fillRect(0, i, 16, 1);
      }
    });

    const sandTex = this.createCanvasTexture(ctx => this.addNoise(ctx, '#d7ccc8', 18));
    const gravelTex = this.createCanvasTexture(ctx => this.addNoise(ctx, '#546e7a', 35));

    const logSideTex = this.createCanvasTexture(ctx => {
      this.addNoise(ctx, '#4e342e', 15);
      ctx.fillStyle = '#3e2723';
      for (let x = 0; x < 16; x += 3) ctx.fillRect(x, 0, 1, 16);
    });

    const logTopTex = this.createCanvasTexture(ctx => {
      this.addNoise(ctx, '#a1887f', 15);
      ctx.fillStyle = '#4e342e';
      ctx.strokeRect(2, 2, 12, 12);
      ctx.strokeRect(5, 5, 6, 6);
    });

    const leavesTex = this.createCanvasTexture(ctx => {
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(0, 0, 16, 16);
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          if (Math.random() < 0.2) ctx.clearRect(x, y, 1, 1);
          else if (Math.random() < 0.4) { ctx.fillStyle = '#1b5e20'; ctx.fillRect(x, y, 1, 1); }
          else if (Math.random() < 0.4) { ctx.fillStyle = '#4caf50'; ctx.fillRect(x, y, 1, 1); }
        }
      }
    });

    const planksTex = this.createCanvasTexture(ctx => {
      this.addNoise(ctx, '#8d6e63', 20);
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(0, 4, 16, 1);
      ctx.fillRect(0, 8, 16, 1);
      ctx.fillRect(0, 12, 16, 1);
    });

    const coalOreTex = this.createCanvasTexture(ctx => {
      this.addNoise(ctx, '#808080', 20);
      ctx.fillStyle = '#212121';
      for (let i = 0; i < 6; i++) ctx.fillRect(Math.floor(Math.random()*14), Math.floor(Math.random()*14), 2, 2);
    });

    const ironOreTex = this.createCanvasTexture(ctx => {
      this.addNoise(ctx, '#808080', 20);
      ctx.fillStyle = '#d7ccc8';
      for (let i = 0; i < 6; i++) ctx.fillRect(Math.floor(Math.random()*14), Math.floor(Math.random()*14), 2, 2);
    });

    const goldOreTex = this.createCanvasTexture(ctx => {
      this.addNoise(ctx, '#808080', 20);
      ctx.fillStyle = '#ffd54f';
      for (let i = 0; i < 6; i++) ctx.fillRect(Math.floor(Math.random()*14), Math.floor(Math.random()*14), 2, 2);
    });

    const diamondOreTex = this.createCanvasTexture(ctx => {
      this.addNoise(ctx, '#808080', 20);
      ctx.fillStyle = '#00bcd4';
      for (let i = 0; i < 6; i++) ctx.fillRect(Math.floor(Math.random()*14), Math.floor(Math.random()*14), 2, 2);
    });

    const bedrockTex = this.createCanvasTexture(ctx => this.addNoise(ctx, '#212121', 50));
    const waterTex = this.createCanvasTexture(ctx => this.addNoise(ctx, '#1e88e5', 25));
    const lavaTex = this.createCanvasTexture(ctx => {
      this.addNoise(ctx, '#d84315', 30);
      ctx.fillStyle = '#ffab00';
      for (let i = 0; i < 8; i++) ctx.fillRect(Math.floor(Math.random()*15), Math.floor(Math.random()*15), 2, 1);
    });

    const glassTex = this.createCanvasTexture(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#e0f7fa';
      ctx.globalAlpha = 0.3;
      ctx.fillRect(0, 0, 16, 16);
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(0, 0, 16, 16);
    });

    const brickTex = this.createCanvasTexture(ctx => {
      this.addNoise(ctx, '#a14d3a', 20);
      ctx.fillStyle = '#d7ccc8';
      ctx.fillRect(0, 4, 16, 1);
      ctx.fillRect(0, 9, 16, 1);
      ctx.fillRect(0, 14, 16, 1);
    });

    const craftTopTex = this.createCanvasTexture(ctx => {
      this.addNoise(ctx, '#8d6e63', 15);
      ctx.fillStyle = '#3e2723';
      ctx.strokeRect(1, 1, 14, 14);
      ctx.fillRect(4, 4, 8, 8);
    });

    const torchTex = this.createCanvasTexture(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#ff9800';
      ctx.fillRect(7, 2, 2, 3);
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(7, 5, 2, 10);
    });

    const makeMat = (tex, extra = {}) => new THREE.MeshLambertMaterial({ map: tex, ...extra });

    this.materials[BLOCKS.DIRT] = makeMat(dirtTex);
    this.materials[BLOCKS.STONE] = makeMat(stoneTex);
    this.materials[BLOCKS.COBBLESTONE] = makeMat(cobbleTex);
    this.materials[BLOCKS.SAND] = makeMat(sandTex);
    this.materials[BLOCKS.GRAVEL] = makeMat(gravelTex);
    this.materials[BLOCKS.WOOD_PLANKS] = makeMat(planksTex);
    this.materials[BLOCKS.COAL_ORE] = makeMat(coalOreTex);
    this.materials[BLOCKS.IRON_ORE] = makeMat(ironOreTex);
    this.materials[BLOCKS.GOLD_ORE] = makeMat(goldOreTex);
    this.materials[BLOCKS.DIAMOND_ORE] = makeMat(diamondOreTex);
    this.materials[BLOCKS.BEDROCK] = makeMat(bedrockTex);
    this.materials[BLOCKS.BRICKS] = makeMat(brickTex);
    this.materials[BLOCKS.LEAVES] = makeMat(leavesTex, { transparent: true, alphaTest: 0.4 });
    this.materials[BLOCKS.GLASS] = makeMat(glassTex, { transparent: true, opacity: 0.7 });
    this.materials[BLOCKS.WATER] = makeMat(waterTex, { transparent: true, opacity: 0.65 });
    this.materials[BLOCKS.LAVA] = new THREE.MeshBasicMaterial({ map: lavaTex });

    this.materials[BLOCKS.GRASS] = [
      makeMat(grassSideTex), makeMat(grassSideTex),
      makeMat(grassTopTex), makeMat(dirtTex),
      makeMat(grassSideTex), makeMat(grassSideTex)
    ];

    this.materials[BLOCKS.OAK_LOG] = [
      makeMat(logSideTex), makeMat(logSideTex),
      makeMat(logTopTex), makeMat(logTopTex),
      makeMat(logSideTex), makeMat(logSideTex)
    ];

    this.materials[BLOCKS.CRAFTING_TABLE] = [
      makeMat(planksTex), makeMat(planksTex),
      makeMat(craftTopTex), makeMat(planksTex),
      makeMat(planksTex), makeMat(planksTex)
    ];
  }

  getMaterial(blockId) {
    return this.materials[blockId] || this.materials[BLOCKS.DIRT];
  }
}

export const textureGenerator = new TextureGenerator();
