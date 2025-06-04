import { createGame, move, checkIfGameOver, defaultConfig, getBoard } from '../../src/core/game';
import type { GameState, Direction } from '../../src/types';

describe('Game Flow Integration', () => {
  describe('Complete Game Scenario', () => {
    it('should play through a complete game with deterministic outcome', () => {
      // Create a game with fixed seed for deterministic behavior
      let game = createGame({
        initialSeed: 12345,
        boardSize: 3, // Smaller board for quicker test
        numberOfInitialTiles: 2,
        tileValueDistribution: [{ value: 2, weight: 1 }], // Only generate 2s for predictability
      });

      // Verify initial state
      expect(game.board.flat().filter(cell => cell !== 0).length).toBe(2);
      expect(game.score).toBe(0);
      expect(game.gameStatus).toBe('playing');

      // Execute a sequence of moves and verify state changes
      const moveSequence: Direction[] = ['left', 'up', 'right', 'down'];
      let previousBoard = game.board;

      for (const direction of moveSequence) {
        game = move(game, direction);
                
        // Verify board changes (if move was valid)
        if (game.board !== previousBoard) {
          // Count non-zero tiles
          const nonZeroTiles = game.board.flat().filter(cell => cell !== 0).length;
          expect(nonZeroTiles).toBeGreaterThanOrEqual(2); // Should always have at least 2 tiles
        }
                
        previousBoard = game.board;
      }
    });

    it('should correctly handle merging chains', () => {
      // Create a game with a known board state for testing merge chains
      const initialBoard = [
        [2, 2, 2, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      let game: GameState = {
        board: initialBoard,
        score: 0,
        config: defaultConfig,
        seed: 12345,
        gameStatus: 'playing',
      };

      // Move left should merge pairs: [2,2,2,2] -> [4,4,0,0] -> [8,0,0,0]
      game = move(game, 'left');
      expect(game.board[0].slice(0, 2)).toEqual([4, 4]);
      expect(game.score).toBe(8); // Two merges of 2+2

      game = move(game, 'left');
      expect(game.board[0][0]).toBe(8);
      expect(game.score).toBe(16); // Previous 8 plus new merge of 4+4
    });

    it('should handle game over condition', () => {
      // Create a game with a board that's full and has no possible merges
      // This pattern ensures no merges are possible in any direction
      const fullBoard = [
        [16, 8, 16, 8],
        [8, 16, 8, 16],
        [16, 8, 16, 8],
        [8, 16, 8, 16],
      ];
      let game: GameState = {
        board: fullBoard,
        score: 0,
        config: defaultConfig,
        seed: 12345,
        gameStatus: 'playing',
      };

      // Check if game is over
      expect(checkIfGameOver(game)).toBe(true);

      // Make a move and verify game over state is set
      game = move(game, 'up');
      expect(game.gameStatus).toBe('game-over');
            
      // Verify that further moves don't change the state
      const finalState = game;
      const directions: Direction[] = ['up', 'down', 'left', 'right'];
      for (const direction of directions) {
        game = move(game, direction);
        expect(game).toBe(finalState);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid moves without losing state', () => {
      let game = createGame({ initialSeed: 12345 });
      const moves: Direction[] = ['up', 'right', 'down', 'left', 'up', 'right'];

      // Execute moves in rapid succession
      moves.forEach(direction => {
        game = move(game, direction);
      });

      // Verify game state integrity
      expect(game.board.length).toBe(defaultConfig.boardSize);
      expect(game.board[0].length).toBe(defaultConfig.boardSize);
      expect(typeof game.score).toBe('number');
      expect(['playing', 'game-over']).toContain(game.gameStatus);
    });

    it('should maintain deterministic behavior with same seed', () => {
      const config = {
        initialSeed: 12345,
        tileValueDistribution: [{ value: 2, weight: 1 }],
      };
            
      // Play two identical games
      let game1 = createGame(config);
      let game2 = createGame(config);
            
      const moves: Direction[] = ['right', 'down', 'left', 'up'];
            
      // Execute same moves on both games
      moves.forEach(direction => {
        game1 = move(game1, direction);
        game2 = move(game2, direction);
                
        // Verify states match exactly
        expect(game1.board).toEqual(game2.board);
        expect(game1.score).toBe(game2.score);
        expect(game1.gameStatus).toBe(game2.gameStatus);
      });
    });

    it('should handle maximum possible tile value', () => {
      // Create a game with a board that can create a large tile
      const largeValueBoard = [
        [1024, 1024, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      let game: GameState = {
        board: largeValueBoard,
        score: 0,
        config: defaultConfig,
        seed: 12345,
        gameStatus: 'playing',
      };

      // Merge to create 2048 tile
      game = move(game, 'left');
      expect(game.board[0][0]).toBe(2048);
      expect(game.score).toBe(2048);

      // Game should continue after reaching 2048
      expect(game.gameStatus).toBe('playing');
    });
  });

  describe('Random Number Generation', () => {
    it('should generate new tiles with expected distribution', () => {
      // Create a game with default distribution (90% 2s, 10% 4s)
      const game = createGame({
        initialSeed: 12345,
        boardSize: 3, // Smaller board for quicker test
      });

      // Track tile value distribution over many moves
      let currentGame = game;
      const newTileValues: number[] = [];
      const moves: Direction[] = ['right', 'left', 'up', 'down'];

      // Play many moves to get a good sample size
      for (let i = 0; i < 100; i++) {
        const prevBoard = currentGame.board.map(row => [...row]);
        currentGame = move(currentGame, moves[i % moves.length]);
                
        // Find and record the new tile value if the board changed
        if (currentGame.board.some((row, r) => 
          row.some((cell, c) => typeof cell === 'number' && typeof prevBoard[r][c] === 'number' && cell !== prevBoard[r][c]),
        )) {
          const newTile = currentGame.board.flat().find((val, idx) => {
            const prevVal = prevBoard.flat()[idx];
            return typeof val === 'number' && typeof prevVal === 'number' && val > 0 && prevVal === 0;
          });
          if (typeof newTile === 'number' && newTile > 0) {
            newTileValues.push(newTile);
          }
        }
      }

      // Count occurrences
      const twoCount = newTileValues.filter(v => v === 2).length;
      const fourCount = newTileValues.filter(v => v === 4).length;
            
      // With enough samples, we should see both 2s and 4s
      expect(twoCount).toBeGreaterThan(0);
      expect(fourCount).toBeGreaterThan(0);
            
      // Rough ratio check (allowing for more variance)
      const twoRatio = twoCount / newTileValues.length;
      expect(twoRatio).toBeGreaterThan(0.7); // Should be mostly 2s
      expect(twoRatio).toBeLessThan(1.0); // But not all 2s
    });
  });

  test('should initialize game with correct configuration', () => {
    const game = createGame();
    const board = getBoard(game);

    // Verify board dimensions
    expect(board.length).toBe(defaultConfig.boardSize);
    board.forEach(row => {
      expect(row.length).toBe(defaultConfig.boardSize);
    });

    // Verify initial tiles
    const nonEmptyTiles = board.flat().filter(cell => typeof cell === 'number' && !Number.isNaN(cell) && cell > 0);
    expect(nonEmptyTiles.length).toBe(defaultConfig.numberOfInitialTiles);
  });

  test('should handle multiple moves and track game progress', () => {
    const game = createGame();
    let board = getBoard(game);
    
    // Make some moves
    const moves: Direction[] = ['right', 'down', 'left', 'up'];
    moves.forEach(direction => {
      const result = move(game, direction);
      board = getBoard(result);
    });

    // Check if any tiles were merged or moved
    const nonZeroTiles = board.flat().filter(cell => typeof cell === 'number' && !Number.isNaN(cell) && cell > 0);
    const hasNonEmptyTiles = nonZeroTiles.length > 0;
    
    expect(hasNonEmptyTiles).toBe(true);
  });

  test('should detect game over condition', () => {
    const game: GameState = {
      board: [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2],
      ],
      score: 0,
      seed: 1,
      config: defaultConfig,
      gameStatus: 'game-over',
    };

    expect(checkIfGameOver(game)).toBe(true);
  });
}); 