/** Configuration for initializing and running a 2048 game instance. */ export interface GameConfig {
  boardSize: number;
  initialSeed: number;
  numberOfInitialTiles: number;
  tileValueDistribution: ReadonlyArray<{ value: number; weight: number }>;
  mergeLogic?: (
    val1: number,
    val2: number,
  ) => { mergedValue: number; scoreEarned: number } | null;
}
/** Represents the complete state of a 2048 game at any point in time. */ export interface GameState {
  board: ReadonlyArray<ReadonlyArray<number>>;
  score: number;
  config: Readonly<GameConfig>;
  currentSeed: number;
  isGameOver: boolean;
  tilesPlacedCount: number;
}
/** Valid directions for moving tiles on the board. */ export type Direction =
  | "up"
  | "down"
  | "left"
  | "right";
/** Represents a position on the game board. */ export type Position = {
  readonly r: number;
  readonly c: number;
};
/** Result of a move operation on the board. */ export interface MoveResult {
  newBoard: ReadonlyArray<ReadonlyArray<number>>;
  pointsEarned: number;
  boardChanged: boolean;
}
/** Result of placing a new tile on the board. */ export interface PlaceTileResult {
  newBoardWithTile: ReadonlyArray<ReadonlyArray<number>>;
  nextSeed: number;
  tileAdded: boolean;
  newTileValue?: number;
  newTilePosition?: Position;
}
