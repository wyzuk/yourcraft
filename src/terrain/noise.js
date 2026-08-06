/**
 * YOURCRAFT - Terrain Noise Wrapper
 * Encapsulates Simplex Noise generation for height maps and cave density
 */

export class TerrainNoise {
  constructor() {
    this.simplex = new SimplexNoise();
  }

  reseed() {
    this.simplex = new SimplexNoise();
  }

  getElevation(x, z) {
    // Multi-octave 2D terrain height noise
    const n1 = this.simplex.noise2D(x * 0.004, z * 0.004);
    const n2 = this.simplex.noise2D(x * 0.015, z * 0.015) * 0.4;
    const n3 = this.simplex.noise2D(x * 0.04, z * 0.04) * 0.15;
    return n1 + n2 + n3;
  }

  getBiomeNoise(x, z) {
    return this.simplex.noise2D(x * 0.002, z * 0.002);
  }

  getCaveNoise(x, y, z) {
    return this.simplex.noise3D(x * 0.035, y * 0.045, z * 0.035);
  }
}
