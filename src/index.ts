/**
 * Main entry point for the 2048 game library.
 * Re-exports all public types and functions.
 */

export * from './core/game.js';
export * from './types/index.js';
export * from './utils/board.js';
export * from './utils/random.js';

export type {
  GameConfig,
  GameState,
  Direction,
  Position,
  MoveResult,
  PlaceTileResult,
} from './types';
