/**
 * Basic example demonstrating core functionality of the 2048 game library.
 * This example shows:
 * 1. Creating a game with default settings
 * 2. Creating a game with custom configuration
 * 3. Making moves and handling game state
 * 4. Visualizing the game board
 */

/* eslint-disable no-console */
import { 
  createGame, 
  move, 
  getBoard, 
  getScore, 
  checkIfGameOver,
  GameConfig,
  GameState, 
} from '../src/index.js';

/**
 * Formats a board for console display.
 * Pads numbers for alignment and adds grid lines.
 */
function formatBoard(board: ReadonlyArray<ReadonlyArray<number>>): string {
  const cellWidth = 6;  // Width for each cell including padding
  const horizontalLine = '-'.repeat(board.length * cellWidth + board.length + 1);
    
  return board.map(row => 
    '|' + row.map(cell => 
      cell === 0 ? ' '.repeat(cellWidth) : cell.toString().padStart(cellWidth),
    ).join('|') + '|',
  ).join('\n' + horizontalLine + '\n');
}

/**
 * Prints the current game state.
 */
function printGameState(state: GameState): void {
  const board = getBoard(state);
  const cellWidth = 6;
  const horizontalLine = '-'.repeat(board.length * cellWidth + board.length + 1);

  console.log('\nBoard:');
  console.log(horizontalLine);
  console.log(formatBoard(board));
  console.log(horizontalLine);
  console.log(`Score: ${getScore(state)}`);
  console.log(`Status: ${state.gameStatus}`);
  console.log();
}

// Example 1: Default Game
console.log('Example 1: Default Game\n');
let game = createGame();

// Make some moves
const moves = ['left', 'up', 'right', 'down'] as const;
for (const direction of moves) {
  console.log(`Moving ${direction}...`);
  game = move(game, direction);
  printGameState(game);
}

// Example 2: Custom Game
console.log('\nExample 2: Custom Game\n');

const customConfig: Partial<GameConfig> = {
  boardSize: 3,                    // Smaller board
  numberOfInitialTiles: 3,         // More initial tiles
  initialSeed: 12345,              // Seed for random number generation
  tileValueDistribution: [         // Different tile distribution
    { value: 2, weight: 7 },     // 70% chance
    { value: 4, weight: 3 },      // 30% chance
  ],
  mergeLogic: (v1: number, v2: number) => {  // Custom merge rules
    if (v1 === v2) {
      return {
        mergedValue: v1 * 2,
        scoreEarned: v1,       // Score = value of one tile
      };
    }
    return null;
  },
};

let customGame = createGame(customConfig);
console.log('Initial state:');
printGameState(customGame);

// Play until game over
let moveCount = 0;
const maxMoves = 20;  // Prevent infinite loop in case of bugs

while (!checkIfGameOver(customGame) && moveCount < maxMoves) {
  // Rotate through moves
  const direction = moves[moveCount % moves.length];
  console.log(`Move ${moveCount + 1}: ${direction}`);
    
  customGame = move(customGame, direction);
  printGameState(customGame);
    
  moveCount++;
}

if (checkIfGameOver(customGame)) {
  console.log('Game Over!');
  console.log(`Final score: ${getScore(customGame)}`);
} else {
  console.log('Maximum moves reached');
} 