/**
 * @module core/game
 * @description Core game logic for the 2048 game implementation.
 * This module provides the main public interface for creating and managing a 2048 game.
 */

import type { GameConfig, GameState, Direction } from '../types/index.js';
import { _placeNewTileOnBoard } from '../utils/random.js';
import { _executeMoveOnBoard } from '../utils/board.js';

/**
 * Default merge logic for the 2048 game.
 * When two equal values collide, they merge into their sum and add to the score.
 * 
 * @param v1 - The first value to compare
 * @param v2 - The second value to compare
 * @returns An object containing the merged value and points earned if the values can merge,
 *          or null if they cannot merge
 * @example
 * ```typescript
 * defaultMergeLogic(2, 2) // returns { mergedValue: 4, scoreEarned: 4 }
 * defaultMergeLogic(2, 4) // returns null
 * ```
 */
export const defaultMergeLogic: NonNullable<GameConfig['mergeLogic']> = (v1: number, v2: number) => {
  if (v1 === v2) {
    return {
      mergedValue: v1 + v2,
      scoreEarned: v1 + v2,
    };
  }
  return null;
};

/**
 * Default configuration for a standard 2048 game.
 * Creates a 4x4 board with 2 initial tiles and standard tile distribution.
 * 
 * @property boardSize - Size of the game board (4 for standard game)
 * @property initialSeed - Random seed for deterministic behavior
 * @property numberOfInitialTiles - Number of tiles to place at game start (2 for standard game)
 * @property tileValueDistribution - Weighted distribution of tile values (90% 2s, 10% 4s)
 * @property mergeLogic - Function defining how tiles merge
 */
export const defaultConfig: GameConfig = {
  boardSize: 4,
  initialSeed: Date.now(),
  numberOfInitialTiles: 2,
  tileValueDistribution: [
    { value: 2, weight: 9 },
    { value: 4, weight: 1 },
  ],
  mergeLogic: defaultMergeLogic,
};

/**
 * Creates an empty board of specified size.
 * 
 * @private
 * @param size - The size of the board (both width and height)
 * @returns A square board filled with zeros
 */
function createEmptyBoard(size: number): ReadonlyArray<ReadonlyArray<number>> {
  const board: number[][] = Array.from({ length: size }, () => 
    Array.from({ length: size }, () => 0)
  );
  return board as ReadonlyArray<ReadonlyArray<number>>;
}

/**
 * Checks if there are any possible moves left.
 * 
 * @private
 * @param board - The current game board
 * @param mergeLogic - Function defining how tiles can merge
 * @returns True if moves are available, false if game is over
 */
function hasAvailableMoves(
  board: ReadonlyArray<ReadonlyArray<number>>,
  mergeLogic: NonNullable<GameConfig['mergeLogic']>,
): boolean {
  // Check for empty cells
  if (board.some(row => row.some(cell => cell === 0))) {
    return true;
  }

  // Check for possible merges horizontally
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length - 1; c++) {
      if (mergeLogic(board[r][c], board[r][c + 1]) !== null) {
        return true;
      }
    }
  }

  // Check for possible merges vertically
  for (let r = 0; r < board.length - 1; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (mergeLogic(board[r][c], board[r + 1][c]) !== null) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Creates a new game with the specified configuration.
 * 
 * @param config - Optional partial configuration to override default settings
 * @returns A new game state with initial tiles placed
 * @example
 * ```typescript
 * // Create a standard 4x4 game
 * const game = createGame();
 * 
 * // Create a custom 3x3 game with different tile distribution
 * const customGame = createGame({
 *   boardSize: 3,
 *   tileValueDistribution: [
 *     { value: 2, weight: 4 },
 *     { value: 4, weight: 1 }
 *   ]
 * });
 * ```
 */
export function createGame(config: Partial<GameConfig> = {}): GameState {
  const finalConfig: GameConfig = { ...defaultConfig, ...config };
  let board = createEmptyBoard(finalConfig.boardSize);
  let currentSeed = finalConfig.initialSeed;

  // Place initial tiles
  for (let i = 0; i < finalConfig.numberOfInitialTiles; i++) {
    const result = _placeNewTileOnBoard(board, finalConfig, currentSeed);
    board = result.newBoardWithTile;
    currentSeed = result.nextSeed;
  }

  return {
    board,
    score: 0,
    config: finalConfig,
    seed: currentSeed,
    gameStatus: 'playing',
  };
}

/**
 * Gets the current board state.
 * The board is returned as a readonly 2D array of numbers.
 * 
 * @param state - The current game state
 * @returns The current board configuration
 * @example
 * ```typescript
 * const board = getBoard(game);
 * // board might look like:
 * // [[2, 0, 0, 0],
 * //  [0, 2, 0, 0],
 * //  [0, 0, 0, 0],
 * //  [0, 0, 0, 0]]
 * ```
 */
export function getBoard(state: Readonly<GameState>): ReadonlyArray<ReadonlyArray<number>> {
  return state.board;
}

/**
 * Gets the current score.
 * The score increases when tiles merge, adding the value of the merged tile.
 * 
 * @param state - The current game state
 * @returns The current score
 * @example
 * ```typescript
 * const score = getScore(game); // e.g., 24 after merging two 4s and two 8s
 * ```
 */
export function getScore(state: Readonly<GameState>): number {
  return state.score;
}

/**
 * Checks if the game is over.
 * A game is over when there are no empty cells and no possible merges.
 * 
 * @param state - The current game state
 * @returns True if no moves are possible, false otherwise
 * @example
 * ```typescript
 * if (checkIfGameOver(game)) {
 *   console.log('Game Over! Final score:', getScore(game));
 * }
 * ```
 */
export function checkIfGameOver(state: Readonly<GameState>): boolean {
  return !hasAvailableMoves(state.board, state.config.mergeLogic);
}

/**
 * Executes a move in the specified direction.
 * This is the main game mechanic that:
 * 1. Slides all tiles in the specified direction
 * 2. Merges adjacent equal tiles
 * 3. Places a new tile in a random empty cell
 * 4. Updates the score and game status
 * 
 * The function maintains immutability - it returns a new state rather than modifying the existing one.
 * 
 * @param state - The current game state
 * @param direction - The direction to move tiles ('up', 'down', 'left', 'right')
 * @returns A new game state after the move is executed
 * @example
 * ```typescript
 * // Move all tiles left
 * game = move(game, 'left');
 * 
 * // Chain moves
 * game = move(move(game, 'up'), 'right');
 * ```
 */
export function move(state: Readonly<GameState>, direction: Direction): GameState {
  if (state.gameStatus !== 'playing') {
    return state;
  }

  // Execute the move
  const moveResult = _executeMoveOnBoard(
    state.board,
    direction,
    state.config.mergeLogic,
  );

  // If board didn't change, check if game is over
  if (!moveResult.boardChanged) {
    const isGameOver = !hasAvailableMoves(state.board, state.config.mergeLogic);
    return isGameOver ? { ...state, gameStatus: 'game-over' } : state;
  }

  // Place a new tile
  const placeResult = _placeNewTileOnBoard(
    moveResult.newBoard,
    state.config,
    state.seed,
  );

  // Check if game is over
  const newBoard = placeResult.newBoardWithTile;
  const isGameOver = !hasAvailableMoves(newBoard, state.config.mergeLogic);

  return {
    board: newBoard,
    score: state.score + moveResult.pointsEarned,
    config: state.config,
    seed: placeResult.nextSeed,
    gameStatus: isGameOver ? 'game-over' : 'playing',
  };
}
