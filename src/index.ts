/**
 * Main entry point for the 2048 game library.
 * Re-exports all public types and functions.
 */

export {
    createGame,
    move,
    getBoard,
    getScore,
    checkIfGameOver,
    defaultConfig,
    defaultMergeLogic
} from './core/game';

export type {
    GameConfig,
    GameState,
    Direction,
    Position,
    MoveResult,
    PlaceTileResult
} from './types';
