/**
 * @module types
 * @description Type definitions for the 2048 game implementation.
 * This module contains all the core types used throughout the game.
 */

/** Configuration for initializing and running a 2048 game instance.
 * Allows customization of board size, initial tiles, and game mechanics.
 * 
 * @property boardSize - The size of the game board (width and height)
 * @property initialSeed - Random seed for deterministic behavior
 * @property numberOfInitialTiles - How many tiles to place when starting a new game
 * @property tileValueDistribution - Array of possible tile values and their relative weights
 * @property mergeLogic - Function defining how tiles merge and points are scored
 * 
 * @example
 * ```typescript
 * const config: GameConfig = {
 *   boardSize: 4,
 *   initialSeed: Date.now(),
 *   numberOfInitialTiles: 2,
 *   tileValueDistribution: [
 *     { value: 2, weight: 9 },  // 90% chance
 *     { value: 4, weight: 1 }   // 10% chance
 *   ],
 *   mergeLogic: (v1, v2) => v1 === v2 ? { mergedValue: v1 + v2, scoreEarned: v1 + v2 } : null
 * };
 * ```
 */
export interface GameConfig {
    boardSize: number;
    initialSeed: number;
    numberOfInitialTiles: number;
    tileValueDistribution: ReadonlyArray<{ value: number; weight: number }>;
    mergeLogic: (
        val1: number,
        val2: number,
    ) => { mergedValue: number; scoreEarned: number } | null;
}

/** Represents the complete state of a 2048 game at any point in time.
 * This is the core data structure that tracks the game's progress.
 * All properties are readonly to enforce immutability.
 * 
 * @property board - 2D array representing the game board, where 0 represents an empty cell
 * @property score - Current game score, increased when tiles merge
 * @property config - Game configuration (readonly to prevent changes during play)
 * @property seed - Current random seed, used for deterministic behavior
 * @property gameStatus - Current game status ('playing' or 'game-over')
 * 
 * @example
 * ```typescript
 * const state: GameState = {
 *   board: [[2, 0, 0, 0], [0, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
 *   score: 0,
 *   config: defaultConfig,
 *   seed: 12345,
 *   gameStatus: 'playing'
 * };
 * ```
 */
export interface GameState {
    board: ReadonlyArray<ReadonlyArray<number>>;
    score: number;
    config: Readonly<GameConfig>;
    seed: number;
    gameStatus: 'playing' | 'game-over';
}

/** Valid directions for moving tiles on the board.
 * These are the four possible moves a player can make.
 * 
 * @example
 * ```typescript
 * const moves: Direction[] = ['up', 'down', 'left', 'right'];
 * ```
 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/** Represents a position on the game board.
 * Used to track tile locations and movements.
 * 
 * @property r - Row index (0-based)
 * @property c - Column index (0-based)
 * 
 * @example
 * ```typescript
 * const position: Position = { r: 0, c: 1 }; // Second cell in first row
 * ```
 */
export type Position = {
    readonly r: number;
    readonly c: number;
};

/** Result of a move operation on the board.
 * Contains the new board state and information about what changed.
 * 
 * @property newBoard - The board state after the move
 * @property pointsEarned - Points earned from any merges during the move
 * @property boardChanged - Whether the move actually changed the board
 * 
 * @example
 * ```typescript
 * const result: MoveResult = {
 *   newBoard: [[4, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
 *   pointsEarned: 4,
 *   boardChanged: true
 * };
 * ```
 */
export interface MoveResult {
    newBoard: ReadonlyArray<ReadonlyArray<number>>;
    pointsEarned: number;
    boardChanged: boolean;
}

/** Result of placing a new tile on the board.
 * Contains the updated board state and information about the placed tile.
 * 
 * @property newBoardWithTile - The board state after placing the new tile
 * @property nextSeed - The next random seed to use
 * @property tileAdded - Whether a tile was successfully added
 * @property newTileValue - The value of the added tile (if one was added)
 * @property newTilePosition - The position where the tile was added (if one was added)
 * 
 * @example
 * ```typescript
 * const result: PlaceTileResult = {
 *   newBoardWithTile: [[2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
 *   nextSeed: 67890,
 *   tileAdded: true,
 *   newTileValue: 2,
 *   newTilePosition: { r: 0, c: 0 }
 * };
 * ```
 */
export interface PlaceTileResult {
    newBoardWithTile: ReadonlyArray<ReadonlyArray<number>>;
    nextSeed: number;
    tileAdded: boolean;
    newTileValue?: number;
    newTilePosition?: Position;
}
