import { prngNext, selectWeightedValue, _placeNewTileOnBoard } from '../../src/utils/random';
import { defaultConfig } from '../../src/core/game';

describe('Random Utils', () => {
  describe('prngNext', () => {
    test('should generate deterministic sequence', () => {
      const seed1 = 12345;
      const seed2 = 12345;
      
      const result1 = prngNext(seed1);
      const result2 = prngNext(seed2);

      expect(result1.value).toBe(result2.value);
      expect(result1.nextSeed).toBe(result2.nextSeed);
      expect(result1.value).toBeGreaterThanOrEqual(0);
      expect(result1.value).toBeLessThan(1);
    });

    test('should generate different values for different seeds', () => {
      const seed1 = 12345;
      const seed2 = 54321;
      
      const result1 = prngNext(seed1);
      const result2 = prngNext(seed2);

      expect(result1.value).not.toBe(result2.value);
      expect(result1.nextSeed).not.toBe(result2.nextSeed);
    });
  });

  describe('selectWeightedValue', () => {
    test('should select values based on weights', () => {
      const values = [
        { value: 2, weight: 9 },
        { value: 4, weight: 1 },
      ];
      const randomNumber = 0.5;

      const result = selectWeightedValue(values, randomNumber);
      expect([2, 4]).toContain(result);
    });

    test('should be deterministic for same random number', () => {
      const values = [
        { value: 2, weight: 9 },
        { value: 4, weight: 1 },
      ];
      const randomNumber = 0.5;

      const result1 = selectWeightedValue(values, randomNumber);
      const result2 = selectWeightedValue(values, randomNumber);

      expect(result1).toBe(result2);
    });
  });

  describe('_placeNewTileOnBoard', () => {
    test('should place tile on empty spot', () => {
      const board = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      const seed = 12345;

      const result = _placeNewTileOnBoard(board, defaultConfig, seed);

      expect(result.tileAdded).toBe(true);
      expect(result.newTileValue).toBeDefined();
      expect(result.newTilePosition).toBeDefined();
      expect(result.nextSeed).toBeDefined();
    });

    test('should handle full board', () => {
      const board = [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2],
      ];
      const seed = 12345;

      const result = _placeNewTileOnBoard(board, defaultConfig, seed);

      expect(result.tileAdded).toBe(false);
      expect(result.newTileValue).toBeUndefined();
      expect(result.newTilePosition).toBeUndefined();
      expect(result.nextSeed).toBe(seed);
    });
  });
});
