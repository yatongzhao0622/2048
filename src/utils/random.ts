import type { GameConfig, Position, PlaceTileResult } from '../types';

/**
 * Linear Congruential Generator (LCG) parameters
 * Using values from "Numerical Recipes"
 */
const LCG_A = 1664525;
const LCG_C = 1013904223;
const LCG_M = Math.pow(2, 32); // 2^32

/**
 * Generates the next pseudo-random number using LCG algorithm
 * @param seed Current seed value
 * @returns Object containing next random value (0 to 1) and next seed
 */
export function prngNext(seed: number): { value: number; nextSeed: number } {
    const nextSeed = (LCG_A * seed + LCG_C) % LCG_M;
    const value = nextSeed / LCG_M; // Normalize to [0,1)
    return { value, nextSeed };
}

/**
 * Selects a value from a weighted distribution using a random number
 * @param distribution Array of value-weight pairs
 * @param randomNumber Random number between 0 and 1
 * @returns Selected value based on weights
 */
export function selectWeightedValue<T>(
    distribution: ReadonlyArray<{ value: T; weight: number }>,
    randomNumber: number
): T {
    const totalWeight = distribution.reduce((sum, item) => sum + item.weight, 0);
    let cumulativeWeight = 0;
    const normalizedRandom = randomNumber * totalWeight;

    for (const item of distribution) {
        cumulativeWeight += item.weight;
        if (normalizedRandom < cumulativeWeight) {
            return item.value;
        }
    }

    // Fallback to last item (for randomNumber = 1)
    return distribution[distribution.length - 1].value;
}

/**
 * Gets all empty cells on the board
 * @param board Current game board
 * @returns Array of empty cell positions
 */
function getEmptyCells(
    board: ReadonlyArray<ReadonlyArray<number>>
): ReadonlyArray<Position> {
    const emptyCells: Position[] = [];
    
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
            if (board[r][c] === 0) {
                emptyCells.push({ r, c });
            }
        }
    }
    
    return emptyCells;
}

/**
 * Places a new tile on the board at a random empty position
 * @param board Current game board
 * @param config Game configuration
 * @param currentSeed Current PRNG seed
 * @returns New board state and updated seed
 */
export function _placeNewTileOnBoard(
    board: ReadonlyArray<ReadonlyArray<number>>,
    config: Readonly<GameConfig>,
    currentSeed: number
): PlaceTileResult {
    const emptyCells = getEmptyCells(board);
    
    if (emptyCells.length === 0) {
        return {
            newBoardWithTile: board,
            nextSeed: currentSeed,
            tileAdded: false
        };
    }

    // Generate random value for tile
    const { value: rand1, nextSeed: seedAfterValueChoice } = prngNext(currentSeed);
    const tileValue = selectWeightedValue(config.tileValueDistribution, rand1);

    // Generate random position
    const { value: rand2, nextSeed: finalNextSeed } = prngNext(seedAfterValueChoice);
    const chosenCellIndex = Math.floor(rand2 * emptyCells.length);
    const chosenCellPosition = emptyCells[chosenCellIndex];

    // Create new board with the tile placed
    const newBoard = board.map((row, r) =>
        row.map((cell, c) =>
            r === chosenCellPosition.r && c === chosenCellPosition.c
                ? tileValue
                : cell
        )
    );

    return {
        newBoardWithTile: newBoard,
        nextSeed: finalNextSeed,
        tileAdded: true,
        newTileValue: tileValue,
        newTilePosition: chosenCellPosition
    };
}
