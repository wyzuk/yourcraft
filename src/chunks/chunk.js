/**
 * YOURCRAFT - Voxel Chunk & Face Culler
 * Optimizes chunk geometry by generating face-culled merged BufferGeometries
 */

import { textureGenerator } from '../render/textures.js';
import { BLOCK_DATA, BLOCKS, CONFIG } from '../utils/config.js';

// Pre-allocated static plant geometry to prevent memory leaks during mining updates
const PLANT_GEOMETRY = new THREE.PlaneGeometry(0.8, 0.8);
PLANT_GEOMETRY.isShared = true;

export class Chunk {
  constructor(cx, cz, world) {
    this.cx = cx;
    this.cz = cz;
    this.world = world;
    this.blocks = new Uint8Array(CONFIG.CHUNK_SIZE * CONFIG.CHUNK_HEIGHT * CONFIG.CHUNK_SIZE);
    this.meshGroup = new THREE.Group();
    this.meshGroup.position.set(cx * CONFIG.CHUNK_SIZE, 0, cz * CONFIG.CHUNK_SIZE);
    this.isDirty = true;
  }

  getBlockIndex(x, y, z) {
    return x + z * CONFIG.CHUNK_SIZE + y * (CONFIG.CHUNK_SIZE * CONFIG.CHUNK_SIZE);
  }

  getBlock(x, y, z) {
    if (x < 0 || x >= CONFIG.CHUNK_SIZE || z < 0 || z >= CONFIG.CHUNK_SIZE || y < 0 || y >= CONFIG.CHUNK_HEIGHT) {
      return BLOCKS.AIR;
    }
    return this.blocks[this.getBlockIndex(x, y, z)];
  }

  setBlock(x, y, z, blockId) {
    if (x < 0 || x >= CONFIG.CHUNK_SIZE || z < 0 || z >= CONFIG.CHUNK_SIZE || y < 0 || y >= CONFIG.CHUNK_HEIGHT) {
      return;
    }
    this.blocks[this.getBlockIndex(x, y, z)] = blockId;
    this.isDirty = true;
  }

  buildMesh() {
    // Properly clean up children without array mutation bugs
    for (let i = this.meshGroup.children.length - 1; i >= 0; i--) {
      const child = this.meshGroup.children[i];
      this.meshGroup.remove(child);
      if (child.geometry && !child.geometry.isShared) {
        child.geometry.dispose();
      }
    }

    const geometriesByBlock = {};

    const faces = [
      { dir: [1, 0, 0], corners: [ [1,0,0], [1,1,0], [1,1,1], [1,0,1] ], norm: [1,0,0] },
      { dir: [-1, 0, 0], corners: [ [0,0,1], [0,1,1], [0,1,0], [0,0,0] ], norm: [-1,0,0] },
      { dir: [0, 1, 0], corners: [ [0,1,1], [1,1,1], [1,1,0], [0,1,0] ], norm: [0,1,0] },
      { dir: [0, -1, 0], corners: [ [0,0,0], [1,0,0], [1,0,1], [0,0,1] ], norm: [0,-1,0] },
      { dir: [0, 0, 1], corners: [ [1,0,1], [1,1,1], [0,1,1], [0,0,1] ], norm: [0,0,1] },
      { dir: [0, 0, -1], corners: [ [0,0,0], [0,1,0], [1,1,0], [1,0,0] ], norm: [0,0,-1] }
    ];

    for (let x = 0; x < CONFIG.CHUNK_SIZE; x++) {
      for (let y = 0; y < CONFIG.CHUNK_HEIGHT; y++) {
        for (let z = 0; z < CONFIG.CHUNK_SIZE; z++) {
          const blockId = this.getBlock(x, y, z);
          if (blockId === BLOCKS.AIR) continue;

          const data = BLOCK_DATA[blockId];
          if (!data) continue;

          if (data.plant) {
            this.buildPlantMesh(x, y, z, blockId);
            continue;
          }

          if (!geometriesByBlock[blockId]) {
            geometriesByBlock[blockId] = { pos: [], norm: [], uvs: [], indices: [] };
          }
          const bucket = geometriesByBlock[blockId];

          for (let f = 0; f < 6; f++) {
            const face = faces[f];
            const nx = x + face.dir[0];
            const ny = y + face.dir[1];
            const nz = z + face.dir[2];

            const neighborBlock = this.world.getBlock(
              this.cx * CONFIG.CHUNK_SIZE + nx,
              ny,
              this.cz * CONFIG.CHUNK_SIZE + nz
            );
            const neighborData = BLOCK_DATA[neighborBlock];

            if (!neighborData || neighborData.transparent || (data.transparent && neighborBlock !== blockId)) {
              const baseIndex = bucket.pos.length / 3;

              for (let c = 0; c < 4; c++) {
                const corner = face.corners[c];
                bucket.pos.push(x + corner[0], y + corner[1], z + corner[2]);
                bucket.norm.push(...face.norm);
              }
              bucket.uvs.push(0, 0,  1, 0,  1, 1,  0, 1);

              bucket.indices.push(
                baseIndex, baseIndex + 1, baseIndex + 2,
                baseIndex, baseIndex + 2, baseIndex + 3
              );
            }
          }
        }
      }
    }

    for (const [bId, bucket] of Object.entries(geometriesByBlock)) {
      if (bucket.pos.length === 0) continue;

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(bucket.pos, 3));
      geom.setAttribute('normal', new THREE.Float32BufferAttribute(bucket.norm, 3));
      geom.setAttribute('uv', new THREE.Float32BufferAttribute(bucket.uvs, 2));
      geom.setIndex(bucket.indices);

      const mat = textureGenerator.getMaterial(parseInt(bId));
      const mesh = new THREE.Mesh(geom, mat);
      this.meshGroup.add(mesh);
    }

    this.isDirty = false;
  }

  buildPlantMesh(x, y, z, blockId) {
    const mat = textureGenerator.getMaterial(blockId);

    const m1 = new THREE.Mesh(PLANT_GEOMETRY, mat);
    m1.position.set(x + 0.5, y + 0.4, z + 0.5);
    m1.rotation.y = Math.PI / 4;

    const m2 = new THREE.Mesh(PLANT_GEOMETRY, mat);
    m2.position.set(x + 0.5, y + 0.4, z + 0.5);
    m2.rotation.y = -Math.PI / 4;

    this.meshGroup.add(m1);
    this.meshGroup.add(m2);
  }

  dispose() {
    for (let i = this.meshGroup.children.length - 1; i >= 0; i--) {
      const child = this.meshGroup.children[i];
      this.meshGroup.remove(child);
      if (child.geometry && !child.geometry.isShared) {
        child.geometry.dispose();
      }
    }
  }
}
