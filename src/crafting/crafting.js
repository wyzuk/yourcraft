/**
 * YOURCRAFT - Crafting Evaluator
 * Evaluates 2x2 and 3x3 item grids against recipe matrices
 */

import { BLOCKS, ITEMS } from '../utils/config.js';

export const RECIPES = [
  { input: [ [BLOCKS.OAK_LOG] ], output: { id: BLOCKS.WOOD_PLANKS, count: 4 } },
  { input: [ [BLOCKS.WOOD_PLANKS], [BLOCKS.WOOD_PLANKS] ], output: { id: ITEMS.STICK, count: 4 } },
  { input: [ [BLOCKS.WOOD_PLANKS, BLOCKS.WOOD_PLANKS], [BLOCKS.WOOD_PLANKS, BLOCKS.WOOD_PLANKS] ], output: { id: BLOCKS.CRAFTING_TABLE, count: 1 } },
  { input: [ [ITEMS.COAL], [ITEMS.STICK] ], output: { id: BLOCKS.TORCH, count: 4 } },
];

export class CraftingSystem {
  static checkRecipe(grid) {
    for (const recipe of RECIPES) {
      if (this.matchesRecipe(grid, recipe.input)) {
        return recipe.output;
      }
    }
    return null;
  }

  static matchesRecipe(grid, recipeInput) {
    const gridRows = grid.length;
    const gridCols = grid[0].length;
    const recipeRows = recipeInput.length;
    const recipeCols = recipeInput[0].length;

    if (recipeRows > gridRows || recipeCols > gridCols) return false;

    let minR = gridRows, maxR = -1, minC = gridCols, maxC = -1;
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        if (grid[r][c] !== null) {
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;
        }
      }
    }

    if (maxR === -1) return false;

    if ((maxR - minR + 1) !== recipeRows || (maxC - minC + 1) !== recipeCols) return false;

    for (let r = 0; r < recipeRows; r++) {
      for (let c = 0; c < recipeCols; c++) {
        const gridVal = grid[minR + r][minC + c];
        const recipeVal = recipeInput[r][c];
        if (recipeVal === null && gridVal !== null) return false;
        if (recipeVal !== null && gridVal !== recipeVal) return false;
      }
    }

    return true;
  }
}
