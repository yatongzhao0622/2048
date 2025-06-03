import type { GameConfig, GameState, Direction, MoveResult } from '../types';
import { _placeNewTileOnBoard } from '../utils/random';
import { _executeMoveOnBoard } from '../utils/board';

/**
 * Default merge logic for 2048 game
 * Merges equal values and doubles the score
 */
export const defaultMergeLogic: NonNullable<GameConfig['mergeLogic']> = (v1: number, v2: number) => {
    if (v1 === v2) {
        return {
            mergedValue: v1 + v2,
            scoreEarned: v1 + v2
        };
    }
    return null;
};

/**
 * Default configuration for 2048 game
 */
export const defaultConfig: GameConfig = {
    boardSize: 4,
    initialSeed: Date.now(),
    numberOfInitialTiles: 2,
    tileValueDistribution: [
        { value: 2, weight: 9 },
        { value: 4, weight: 1 }
    ],
    mergeLogic: defaultMergeLogic
};

/**
 * Creates an empty board of specified size
 */
function createEmptyBoard(size: number): ReadonlyArray<ReadonlyArray<number>> {
    return Array(size).fill(null).map(() => 
        Array(size).fill(0)
    );
}

/**
 * Checks if there are any possible moves left
 */
function hasAvailableMoves(
    board: ReadonlyArray<ReadonlyArray<number>>,
    mergeLogic: NonNullable<GameConfig['mergeLogic']>
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
 * Creates a new game with the specified configuration
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
        gameStatus: 'playing'
    };
}

/**
 * Gets the current board state
 */
export function getBoard(state: Readonly<GameState>): ReadonlyArray<ReadonlyArray<number>> {
    return state.board;
}

/**
 * Gets the current score
 */
export function getScore(state: Readonly<GameState>): number {
    return state.score;
}

/**
 * Checks if the game is over
 */
export function checkIfGameOver(state: Readonly<GameState>): boolean {
    return !hasAvailableMoves(state.board, state.config.mergeLogic);
}

/**
 * Executes a move in the specified direction
 */
export function move(state: Readonly<GameState>, direction: Direction): GameState {
    if (state.gameStatus !== 'playing') {
        return state;
    }

    // Execute the move
    const moveResult = _executeMoveOnBoard(
        state.board,
        direction,
        state.config.mergeLogic
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
        state.seed
    );

    // Check if game is over
    const newBoard = placeResult.newBoardWithTile;
    const isGameOver = !hasAvailableMoves(newBoard, state.config.mergeLogic);

    return {
        board: newBoard,
        score: state.score + moveResult.pointsEarned,
        config: state.config,
        seed: placeResult.nextSeed,
        gameStatus: isGameOver ? 'game-over' : 'playing'
    };
}
