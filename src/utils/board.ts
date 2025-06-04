import type { GameConfig, MoveResult } from '../types/index.js';

/**
 * Slides all non-zero numbers in a row to the left, maintaining their order
 * @param row Array of numbers representing a row
 * @returns New array with numbers slid to the left
 */
export function slide(row: ReadonlyArray<number>): ReadonlyArray<number> {
  const nonZeroNums = row.filter(x => x !== 0);
  const zeros = Array(row.length - nonZeroNums.length).fill(0);
  return [...nonZeroNums, ...zeros];
}

/**
 * Merges adjacent equal numbers in a row after sliding
 * @param row Array of numbers that has been slid
 * @param mergeLogic Function defining how to merge tiles
 * @returns Object containing new row, points earned, and whether the row changed
 */
export function mergeLine(
  row: ReadonlyArray<number>,
  mergeLogic: NonNullable<GameConfig['mergeLogic']>,
): { newRow: ReadonlyArray<number>; pointsEarned: number; lineChanged: boolean } {
  const result: number[] = [...row];
  let pointsEarned = 0;
  let lineChanged = false;

  for (let i = 0; i < result.length - 1; i++) {
    if (result[i] !== 0) {
      const mergeResult = mergeLogic(result[i], result[i + 1]);
      if (mergeResult !== null) {
        result[i] = mergeResult.mergedValue;
        result[i + 1] = 0;
        pointsEarned += mergeResult.scoreEarned;
        lineChanged = true;
        // Skip the merged tile
        i++;
      }
    }
  }

  return {
    newRow: result,
    pointsEarned,
    lineChanged,
  };
}

/**
 * Processes a line by sliding and merging
 * @param row Array of numbers representing a row
 * @param mergeLogic Function defining how to merge tiles
 * @returns Object containing new row, points earned, and whether the line changed
 */
export function processLine(
  row: ReadonlyArray<number>,
  mergeLogic: NonNullable<GameConfig['mergeLogic']>,
): { newRow: ReadonlyArray<number>; pointsEarned: number; lineChanged: boolean } {
  const slidResult = slide(row);
  const mergeResult = mergeLine(slidResult, mergeLogic);
    
  // If merging changed the line, slide again to fill gaps
  const finalRow = mergeResult.lineChanged ? slide(mergeResult.newRow) : mergeResult.newRow;
    
  const lineChanged = !row.every((val, idx) => val === finalRow[idx]);
    
  return {
    newRow: finalRow,
    pointsEarned: mergeResult.pointsEarned,
    lineChanged,
  };
}

/**
 * Transposes a 2D array
 * @param board 2D array to transpose
 * @returns Transposed array
 */
export function transpose<T>(
  board: ReadonlyArray<ReadonlyArray<T>>,
): ReadonlyArray<ReadonlyArray<T>> {
  return board[0].map((_, colIndex) => 
    board.map(row => row[colIndex]),
  );
}

/**
 * Reverses each row in the board
 * @param board 2D array to reverse rows of
 * @returns New board with reversed rows
 */
export function reverseRows<T>(
  board: ReadonlyArray<ReadonlyArray<T>>,
): ReadonlyArray<ReadonlyArray<T>> {
  return board.map(row => [...row].reverse());
}

/**
 * Executes a move on the board in the specified direction
 * @param board Current game board
 * @param direction Direction to move ('up', 'down', 'left', 'right')
 * @param mergeLogic Function defining how to merge tiles
 * @returns Object containing new board state and points earned
 */
export function _executeMoveOnBoard(
  board: ReadonlyArray<ReadonlyArray<number>>,
  direction: 'up' | 'down' | 'left' | 'right',
  mergeLogic: NonNullable<GameConfig['mergeLogic']>,
): MoveResult {
  let processedBoard: ReadonlyArray<ReadonlyArray<number>> = board;
  let totalPoints = 0;
  let boardChanged = false;

  // Transform board based on direction
  if (direction === 'up') {
    processedBoard = transpose(board);
  } else if (direction === 'down') {
    processedBoard = reverseRows(transpose(board));
  } else if (direction === 'right') {
    processedBoard = reverseRows(board);
  }

  // Process each row
  const processedRows = processedBoard.map(row => {
    const result = processLine(row, mergeLogic);
    totalPoints += result.pointsEarned;
    if (result.lineChanged) boardChanged = true;
    return result.newRow;
  });

  // Transform back based on direction
  if (direction === 'up') {
    processedBoard = transpose(processedRows);
  } else if (direction === 'down') {
    processedBoard = transpose(reverseRows(processedRows));
  } else if (direction === 'right') {
    processedBoard = reverseRows(processedRows);
  } else {
    processedBoard = processedRows;
  }

  return {
    newBoard: processedBoard,
    pointsEarned: totalPoints,
    boardChanged,
  };
}
