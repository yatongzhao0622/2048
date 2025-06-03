import { createGame, move, getBoard, getScore, defaultConfig } from '../src/core/game';
import type { Direction } from '../src/types';

/**
 * Example of playing a 2048 game
 */
function playGame() {
    // Create a new game with default settings
    let game = createGame();
    console.log('New game created!');
    console.log('Initial board:');
    printBoard(game.board);
    console.log('Score:', getScore(game));

    // Example of making moves
    const moves: Direction[] = ['right', 'up', 'left', 'down'];
    for (let i = 0; i < moves.length; i++) {
        console.log(`\nMaking move: ${moves[i]}`);
        game = move(game, moves[i]);
        console.log('Board after move:');
        printBoard(game.board);
        console.log('Score:', getScore(game));

        if (game.gameStatus === 'game-over') {
            console.log('\nGame Over!');
            break;
        }
    }
}

/**
 * Example of playing a game with custom configuration
 */
function playCustomGame() {
    // Create a game with custom settings
    const customConfig = {
        boardSize: 3, // 3x3 board
        numberOfInitialTiles: 3, // Start with 3 tiles
        tileValueDistribution: [ // Custom tile distribution
            { value: 2, weight: 4 },
            { value: 4, weight: 1 }
        ]
    };

    let game = createGame(customConfig);
    console.log('\nCustom game created!');
    console.log('Initial board:');
    printBoard(game.board);
    console.log('Score:', getScore(game));

    // Make a few moves
    const moves: Direction[] = ['left', 'up'];
    for (const direction of moves) {
        console.log(`\nMaking move: ${direction}`);
        game = move(game, direction);
        console.log('Board after move:');
        printBoard(game.board);
        console.log('Score:', getScore(game));
    }
}

/**
 * Helper function to print the game board
 */
function printBoard(board: ReadonlyArray<ReadonlyArray<number>>) {
    const cellWidth = 6;
    const horizontalLine = '-'.repeat((cellWidth + 1) * board.length + 1);

    console.log(horizontalLine);
    for (const row of board) {
        let line = '|';
        for (const cell of row) {
            line += cell === 0 ? ' '.repeat(cellWidth) : cell.toString().padStart(cellWidth);
            line += '|';
        }
        console.log(line);
        console.log(horizontalLine);
    }
}

// Run the examples
console.log('=== Basic Game Example ===');
playGame();

console.log('\n=== Custom Game Example ===');
playCustomGame(); 