# 2048 Game Core Library

A TypeScript implementation of the 2048 game core mechanics, focusing on functional programming principles and immutability.

## Features

- 🎮 Complete 2048 game logic
- 🔄 Immutable state management
- 🎲 Deterministic random number generation
- ⚙️ Customizable game configuration
- 🧪 Comprehensive test coverage
- 📝 Full TypeScript type safety

## Installation

```bash
npm install @your-username/2048-core
```

## Quick Start

```typescript
import { createGame, move, getBoard, getScore, checkIfGameOver } from '@your-username/2048-core';

// Create a new game with default settings
let game = createGame();

// Make moves
game = move(game, 'left');
game = move(game, 'up');

// Get current state
const board = getBoard(game);
const score = getScore(game);

// Check game status
if (checkIfGameOver(game)) {
    console.log(`Game Over! Final score: ${score}`);
}
```

## Game Configuration

You can customize various aspects of the game by passing a configuration object:

```typescript
import { createGame, GameConfig } from '@your-username/2048-core';

const customConfig: Partial<GameConfig> = {
    boardSize: 3,                    // Create a 3x3 board
    numberOfInitialTiles: 3,         // Start with 3 tiles
    tileValueDistribution: [         // Custom tile value distribution
        { value: 2, weight: 8 },     // 80% chance of 2
        { value: 4, weight: 2 }      // 20% chance of 4
    ],
    mergeLogic: (v1, v2) => {       // Custom merge rules
        if (v1 === v2) {
            return {
                mergedValue: v1 * 2,
                scoreEarned: v1 * 3   // Different scoring system
            };
        }
        return null;
    }
};

const game = createGame(customConfig);
```

## API Reference

### Core Functions

#### `createGame(config?: Partial<GameConfig>): GameState`
Creates a new game with optional custom configuration.

#### `move(state: GameState, direction: Direction): GameState`
Executes a move in the specified direction ('up', 'down', 'left', 'right').

#### `getBoard(state: GameState): ReadonlyArray<ReadonlyArray<number>>`
Gets the current board state.

#### `getScore(state: GameState): number`
Gets the current score.

#### `checkIfGameOver(state: GameState): boolean`
Checks if the game is over (no moves possible).

### Types

#### `GameConfig`
Configuration options for game initialization:
- `boardSize`: Board dimensions (width/height)
- `initialSeed`: Random seed for deterministic behavior
- `numberOfInitialTiles`: Initial tiles to place
- `tileValueDistribution`: Weighted distribution for new tile values
- `mergeLogic`: Function defining merge rules

#### `GameState`
Complete game state:
- `board`: Current board configuration
- `score`: Current score
- `config`: Game configuration
- `seed`: Current random seed
- `gameStatus`: 'playing' or 'game-over'

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/2048-core.git

# Install dependencies
cd 2048-core
npm install

# Run tests
npm test
```

### Testing

The library includes comprehensive test coverage:
- Unit tests for core functions
- Integration tests for game flow
- Edge case testing
- Random number generation validation

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm test -- -t "board operations"
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Original 2048 game by Gabriele Cirulli
- Inspired by functional programming principles
- Built with TypeScript for type safety 