import { slide, mergeLine, processLine, transpose, reverseRows, _executeMoveOnBoard } from '../../src/utils/board';
import type { GameConfig } from '../../src/types';

describe('BoardOperations', () => {
    // Standard 2048 merge logic for testing
    const standardMergeLogic: NonNullable<GameConfig['mergeLogic']> = (v1, v2) => {
        if (v1 === v2) {
            return { mergedValue: v1 + v2, scoreEarned: v1 + v2 };
        }
        return null;
    };

    describe('slide', () => {
        it('should slide non-zero numbers to the left', () => {
            expect(slide([0, 2, 0, 4])).toEqual([2, 4, 0, 0]);
            expect(slide([2, 0, 0, 2])).toEqual([2, 2, 0, 0]);
            expect(slide([0, 0, 0, 2])).toEqual([2, 0, 0, 0]);
        });

        it('should maintain order of numbers', () => {
            expect(slide([4, 0, 2, 0])).toEqual([4, 2, 0, 0]);
            expect(slide([0, 4, 0, 2])).toEqual([4, 2, 0, 0]);
        });

        it('should handle already slid rows', () => {
            expect(slide([2, 4, 0, 0])).toEqual([2, 4, 0, 0]);
            expect(slide([4, 2, 8, 0])).toEqual([4, 2, 8, 0]);
        });
    });

    describe('mergeLine', () => {
        it('should merge adjacent equal numbers', () => {
            const result = mergeLine([2, 2, 0, 0], standardMergeLogic);
            expect(result.newRow).toEqual([4, 0, 0, 0]);
            expect(result.pointsEarned).toBe(4);
            expect(result.lineChanged).toBe(true);
        });

        it('should not merge different numbers', () => {
            const result = mergeLine([2, 4, 0, 0], standardMergeLogic);
            expect(result.newRow).toEqual([2, 4, 0, 0]);
            expect(result.pointsEarned).toBe(0);
            expect(result.lineChanged).toBe(false);
        });

        it('should merge only once per move', () => {
            const result = mergeLine([2, 2, 2, 2], standardMergeLogic);
            expect(result.newRow).toEqual([4, 0, 4, 0]);
            expect(result.pointsEarned).toBe(8);
            expect(result.lineChanged).toBe(true);
        });
    });

    describe('processLine', () => {
        it('should slide and merge in one operation', () => {
            const result = processLine([0, 2, 0, 2], standardMergeLogic);
            expect(result.newRow).toEqual([4, 0, 0, 0]);
            expect(result.pointsEarned).toBe(4);
            expect(result.lineChanged).toBe(true);
        });

        it('should handle multiple merges', () => {
            const result = processLine([2, 2, 4, 4], standardMergeLogic);
            expect(result.newRow).toEqual([4, 8, 0, 0]);
            expect(result.pointsEarned).toBe(12);
            expect(result.lineChanged).toBe(true);
        });

        it('should not change unchanged lines', () => {
            const result = processLine([2, 4, 8, 16], standardMergeLogic);
            expect(result.newRow).toEqual([2, 4, 8, 16]);
            expect(result.pointsEarned).toBe(0);
            expect(result.lineChanged).toBe(false);
        });
    });

    describe('transpose', () => {
        it('should transpose a square matrix', () => {
            const board = [
                [1, 2],
                [3, 4]
            ];
            const expected = [
                [1, 3],
                [2, 4]
            ];
            expect(transpose(board)).toEqual(expected);
        });

        it('should handle empty rows', () => {
            const board = [
                [0, 0],
                [0, 0]
            ];
            expect(transpose(board)).toEqual(board);
        });
    });

    describe('reverseRows', () => {
        it('should reverse each row', () => {
            const board = [
                [1, 2, 3],
                [4, 5, 6]
            ];
            const expected = [
                [3, 2, 1],
                [6, 5, 4]
            ];
            expect(reverseRows(board)).toEqual(expected);
        });
    });

    describe('_executeMoveOnBoard', () => {
        const emptyBoard = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];

        const testBoard = [
            [2, 0, 0, 2],
            [4, 4, 0, 0],
            [8, 0, 8, 0],
            [0, 2, 2, 0]
        ];

        it('should move left correctly', () => {
            const result = _executeMoveOnBoard(testBoard, 'left', standardMergeLogic);
            const expected = [
                [4, 0, 0, 0],
                [8, 0, 0, 0],
                [16, 0, 0, 0],
                [4, 0, 0, 0]
            ];
            expect(result.newBoard).toEqual(expected);
            expect(result.pointsEarned).toBe(32);
            expect(result.boardChanged).toBe(true);
        });

        it('should move right correctly', () => {
            const result = _executeMoveOnBoard(testBoard, 'right', standardMergeLogic);
            const expected = [
                [0, 0, 0, 4],
                [0, 0, 0, 8],
                [0, 0, 0, 16],
                [0, 0, 0, 4]
            ];
            expect(result.newBoard).toEqual(expected);
            expect(result.pointsEarned).toBe(32);
            expect(result.boardChanged).toBe(true);
        });

        it('should move up correctly', () => {
            const verticalBoard = [
                [2, 4, 0, 2],
                [2, 4, 0, 2],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];
            const result = _executeMoveOnBoard(verticalBoard, 'up', standardMergeLogic);
            const expected = [
                [4, 8, 0, 4],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];
            expect(result.newBoard).toEqual(expected);
            expect(result.pointsEarned).toBe(16);
            expect(result.boardChanged).toBe(true);
        });

        it('should not change board when no moves possible', () => {
            const fullBoard = [
                [2, 4, 2, 4],
                [4, 2, 4, 2],
                [2, 4, 2, 4],
                [4, 2, 4, 2]
            ];
            const result = _executeMoveOnBoard(fullBoard, 'left', standardMergeLogic);
            expect(result.newBoard).toEqual(fullBoard);
            expect(result.pointsEarned).toBe(0);
            expect(result.boardChanged).toBe(false);
        });
    });
}); 