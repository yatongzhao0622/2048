import { createGame, getBoard, getScore, checkIfGameOver, move, defaultConfig } from '../../src/core/game';
import type { GameState } from '../../src/types';

describe('Core Game Module', () => {
  describe('createGame', () => {
    it('should create a new game with default configuration', () => {
      const game = createGame();
      expect(game.board.length).toBe(defaultConfig.boardSize);
      expect(game.board[0].length).toBe(defaultConfig.boardSize);
      expect(game.score).toBe(0);
      expect(game.gameStatus).toBe('playing');

      // Count initial tiles
      const nonZeroTiles = game.board.flat().filter(cell => cell !== 0).length;
      expect(nonZeroTiles).toBe(defaultConfig.numberOfInitialTiles);
    });

    it('should create a game with custom configuration', () => {
      const customConfig = {
        boardSize: 5,
        numberOfInitialTiles: 3,
      };
      const game = createGame(customConfig);
      expect(game.board.length).toBe(customConfig.boardSize);
      expect(game.board[0].length).toBe(customConfig.boardSize);
            
      const nonZeroTiles = game.board.flat().filter(cell => cell !== 0).length;
      expect(nonZeroTiles).toBe(customConfig.numberOfInitialTiles);
    });

    it('should use deterministic random with fixed seed', () => {
      const config = { initialSeed: 12345 };
      const game1 = createGame(config);
      const game2 = createGame(config);
      expect(game1.board).toEqual(game2.board);
    });
  });

  describe('getBoard and getScore', () => {
    let game: GameState;

    beforeEach(() => {
      game = createGame({ initialSeed: 12345 });
    });

    it('should return current board state', () => {
      const board = getBoard(game);
      expect(board).toBe(game.board);
    });

    it('should return current score', () => {
      const score = getScore(game);
      expect(score).toBe(game.score);
    });
  });

  describe('move', () => {
    let game: GameState;

    beforeEach(() => {
      // Create a game with a known board state
      game = createGame({ initialSeed: 12345 });
    });

    it('should not modify state when game is over', () => {
      const gameOver: GameState = {
        ...game,
        gameStatus: 'game-over',
      };
      const newState = move(gameOver, 'left');
      expect(newState).toBe(gameOver);
    });

    it('should update score after successful merge', () => {
      // Create a game with a known board that will merge
      const initialBoard = [
        [2, 2, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      const initialState: GameState = {
        board: initialBoard,
        score: 0,
        config: defaultConfig,
        seed: 12345,
        gameStatus: 'playing',
      };

      const newState = move(initialState, 'left');
      expect(newState.score).toBe(4); // 2 + 2 = 4 points
      expect(newState.board[0][0]).toBe(4); // Merged 2 + 2 = 4
    });

    it('should add a new tile after successful move', () => {
      // Create a game with a known board that will change
      const initialBoard = [
        [0, 0, 0, 2], // 2 will move left and a new tile should appear
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      const initialState: GameState = {
        board: initialBoard,
        score: 0,
        config: {
          ...defaultConfig,
          initialSeed: 12345,
          tileValueDistribution: [{ value: 2, weight: 1 }], // Force 2s only for predictability
        },
        seed: 12345,
        gameStatus: 'playing',
      };

      const newState = move(initialState, 'left');
            
      // Board should have changed
      expect(newState).not.toBe(initialState);
            
      // Original tile should have moved left
      expect(newState.board[0][0]).toBe(2);
            
      // Count non-zero tiles
      const nonZeroTiles = newState.board.flat().filter(cell => cell !== 0).length;
      expect(nonZeroTiles).toBe(2); // Original tile + new tile
            
      // Verify the new tile is a 2 (due to our forced distribution)
      const newTileValue = newState.board.flat().find((cell, idx) => 
        cell !== 0 && initialBoard.flat()[idx] === 0,
      );
      expect(newTileValue).toBe(2);
    });

    it('should not modify state for invalid moves', () => {
      const initialBoard = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      const initialState: GameState = {
        board: initialBoard,
        score: 0,
        config: defaultConfig,
        seed: 12345,
        gameStatus: 'playing',
      };

      const newState = move(initialState, 'left');
      expect(newState).toBe(initialState); // No change because tiles are already left-aligned
    });
  });

  describe('checkIfGameOver', () => {
    it('should return false when moves are available', () => {
      const game = createGame();
      expect(checkIfGameOver(game)).toBe(false);
    });

    it('should return true when no moves are possible', () => {
      // Create a board with no possible moves
      const fullBoard = [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2],
      ];
      const gameState: GameState = {
        board: fullBoard,
        score: 0,
        config: defaultConfig,
        seed: 12345,
        gameStatus: 'playing',
      };
      expect(checkIfGameOver(gameState)).toBe(true);
    });

    it('should return false when merges are possible', () => {
      const boardWithMerges = [
        [2, 2, 4, 8],
        [4, 8, 2, 4],
        [8, 4, 8, 2],
        [2, 8, 4, 2],
      ];
      const gameState: GameState = {
        board: boardWithMerges,
        score: 0,
        config: defaultConfig,
        seed: 12345,
        gameStatus: 'playing',
      };
      expect(checkIfGameOver(gameState)).toBe(false);
    });
  });
}); 