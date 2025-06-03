import { prngNext, selectWeightedValue, _placeNewTileOnBoard } from '../../src/utils/random';
import type { GameConfig } from '../../src/types';

describe('RandomUtils', () => {
    describe('prngNext', () => {
        it('should generate deterministic sequence', () => {
            const seed = 12345;
            const { value: value1, nextSeed: seed2 } = prngNext(seed);
            const { value: value2, nextSeed: seed3 } = prngNext(seed2);
            
            // Same seed should produce same values
            const { value: value1Repeat, nextSeed: seed2Repeat } = prngNext(seed);
            
            expect(value1).toBe(value1Repeat);
            expect(seed2).toBe(seed2Repeat);
            expect(value1).not.toBe(value2);
        });

        it('should generate values between 0 and 1', () => {
            for (let seed = 0; seed < 1000; seed += 100) {
                const { value } = prngNext(seed);
                expect(value).toBeGreaterThanOrEqual(0);
                expect(value).toBeLessThan(1);
            }
        });
    });

    describe('selectWeightedValue', () => {
        const distribution = [
            { value: 2, weight: 9 },
            { value: 4, weight: 1 }
        ] as const;

        it('should select values based on weights', () => {
            // Test boundary conditions
            expect(selectWeightedValue(distribution, 0)).toBe(2); // First value
            expect(selectWeightedValue(distribution, 0.89)).toBe(2); // Just before threshold
            expect(selectWeightedValue(distribution, 0.9)).toBe(4); // At threshold
            expect(selectWeightedValue(distribution, 0.99)).toBe(4); // Last value
        });

        it('should handle single item distribution', () => {
            const singleDist = [{ value: 'only', weight: 1 }] as const;
            expect(selectWeightedValue(singleDist, 0)).toBe('only');
            expect(selectWeightedValue(singleDist, 0.5)).toBe('only');
            expect(selectWeightedValue(singleDist, 0.99)).toBe('only');
        });
    });

    describe('_placeNewTileOnBoard', () => {
        const config: GameConfig = {
            boardSize: 4,
            initialSeed: 12345,
            numberOfInitialTiles: 2,
            tileValueDistribution: [
                { value: 2, weight: 9 },
                { value: 4, weight: 1 }
            ],
            mergeLogic: (v1, v2) => v1 === v2 ? { mergedValue: v1 + v2, scoreEarned: v1 + v2 } : null
        };

        it('should place a tile on an empty board', () => {
            const emptyBoard = Array(4).fill(Array(4).fill(0));
            const result = _placeNewTileOnBoard(emptyBoard, config, 12345);

            expect(result.tileAdded).toBe(true);
            expect(result.newTileValue).toBeDefined();
            expect(result.newTilePosition).toBeDefined();
            expect(result.nextSeed).not.toBe(12345);

            // Verify only one tile was placed
            const tilesPlaced = result.newBoardWithTile.flat().filter(cell => cell !== 0).length;
            expect(tilesPlaced).toBe(1);
        });

        it('should not place a tile on a full board', () => {
            const fullBoard = Array(4).fill(Array(4).fill(2));
            const result = _placeNewTileOnBoard(fullBoard, config, 12345);

            expect(result.tileAdded).toBe(false);
            expect(result.newTileValue).toBeUndefined();
            expect(result.newTilePosition).toBeUndefined();
            expect(result.nextSeed).toBe(12345);
            expect(result.newBoardWithTile).toBe(fullBoard);
        });

        it('should maintain board immutability', () => {
            const originalBoard = Array(4).fill(Array(4).fill(0));
            const result = _placeNewTileOnBoard(originalBoard, config, 12345);

            expect(result.newBoardWithTile).not.toBe(originalBoard);
            expect(originalBoard.every(row => row.every((cell: number) => cell === 0))).toBe(true);
        });

        it('should place tiles with correct distribution', () => {
            const emptyBoard = Array(4).fill(Array(4).fill(0));
            const trials = 1000;
            let twoCount = 0;
            let fourCount = 0;

            let seed = 12345;
            for (let i = 0; i < trials; i++) {
                const result = _placeNewTileOnBoard(emptyBoard, config, seed);
                if (result.newTileValue === 2) twoCount++;
                if (result.newTileValue === 4) fourCount++;
                seed = result.nextSeed;
            }

            // Check if distribution roughly matches weights (90% 2s, 10% 4s)
            const twoRatio = twoCount / trials;
            expect(twoRatio).toBeGreaterThan(0.85);
            expect(twoRatio).toBeLessThan(0.95);
        });
    });
});
