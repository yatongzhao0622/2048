# **2048游戏核心JavaScript库 \- 精确函数式规范与系统架构 (v2)**

## **1\. 引言**

本文档为2048游戏的核心JavaScript库提供了修订后的、基于函数式编程范式的规范和系统架构设计。此版本整合了详细的澄清，旨在为后续的深入研究和实现提供一个精确、无歧义的基础。核心目标保持不变：创建一个可重用、可测试、与UI解耦、强调不可变性和纯函数的游戏引擎。

## **2\. 核心函数式原则**

* **不可变性 (Immutability)**: 所有游戏状态 (GameState) 及其组成部分 (如游戏板、分数、配置、种子) 都是不可变的。任何操作都返回一个新的 GameState 对象，原始状态不受影响。  
* **纯函数 (Pure Functions)**: 核心逻辑函数是纯函数。给定相同的输入（包括 GameState 和操作），它们总是返回相同的输出，并且没有副作用。  
* **数据驱动 (Data-Driven)**: 游戏的核心是状态的转换。函数接收当前状态和操作作为输入，并产生新的状态作为输出。  
* **组合性 (Composability)**: 通过组合小的、专注的纯函数来构建更复杂的逻辑。

## **3\. 核心数据结构**

### **3.1. GameConfig**

定义了游戏的初始设置和规则。此对象在游戏创建时提供，并作为 GameState 的一部分被持久化，以确保游戏规则在整个会话中的一致性。

* **GameConfig**:  
  * boardSize: number: 棋盘的维度 (例如, 4 代表 4x4)。  
  * initialSeed: number: 用于初始化伪随机数生成器 (PRNG) 的初始种子。  
  * numberOfInitialTiles: number: 游戏开始时在棋盘上放置的初始方块数量。  
  * tileValueDistribution: ReadonlyArray\<{value: number, weight: number}\>: 一个只读数组，定义了新生成方块的数值及其相对权重。例如: \[{value: 2, weight: 9}, {value: 4, weight: 1}\] 表示生成2的概率是90%，生成4的概率是10%。方块数值不限于2的幂。  
  * mergeLogic: (val1: number, val2: number) \=\> { mergedValue: number, scoreEarned: number } | null: (高级，可选默认为标准2048合并) 一个函数，定义了当 val1 和 val2 相同时如何合并。返回合并后的值和因此获得的分数。如果不能合并（例如，在更复杂的规则下），则返回 null。标准2048逻辑：if (val1 \=== val2) return { mergedValue: val1 \+ val2, scoreEarned: val1 \+ val2 }; else return null;

### **3.2. GameState**

表示游戏在任何特定时间点的完整、不可变状态。

* **GameState**:  
  * board: ReadonlyArray\<ReadonlyArray\<number\>\>: 表示游戏板的二维只读数组。0代表空格。  
  * score: number: 当前游戏分数。  
  * config: Readonly\<GameConfig\>: 创建此游戏实例时使用的配置，为只读。  
  * currentSeed: number: 伪随机数生成器 (PRNG) 的当前状态/种子。每次随机操作后都会更新。  
  * isGameOver: boolean: 标记游戏是否结束。  
  * tilesPlacedCount: number: (新增) 记录总共放置到棋盘上的方块数量（包括初始方块和移动后新增的方块）。可用于某些PRNG或游戏分析。

## **4\. 核心API函数 (纯函数)**

这些函数是库的公共接口。

* **createGame(config: GameConfig): GameState**:  
  * 接收一个 GameConfig 对象。  
  * 初始化并返回一个新的 GameState。  
  * 棋盘根据 config.boardSize 初始化为空。  
  * currentSeed 初始化为 config.initialSeed。  
  * 分数设为0，isGameOver 设为 false，tilesPlacedCount 设为0。  
  * 根据 config.numberOfInitialTiles 和 config.tileValueDistribution，使用PRNG（由 currentSeed驱动）在棋盘的随机空位上添加初始方块。每次添加方块都会更新 currentSeed 和 board，并增加 tilesPlacedCount。  
  * 最终返回包含初始棋盘、更新后的种子、分数、游戏结束状态和配置的 GameState。  
* **getBoard(gameState: GameState): ReadonlyArray\<ReadonlyArray\<number\>\>**:  
  * 返回 gameState.board。  
* **getScore(gameState: GameState): number**:  
  * 返回 gameState.score。  
* **checkIfGameOver(gameState: GameState): boolean**:  
  * 这是一个辅助检查函数，根据 gameState.board 和 gameState.config.mergeLogic 判断游戏是否结束（棋盘已满且无法进行任何有效移动）。  
  * gameState.isGameOver 是 move 函数计算并存储的权威状态。此函数可用于独立验证。  
* **move(gameState: GameState, direction: string): GameState**:  
  * 接收当前 gameState 和一个移动方向 ('up', 'down', 'left', 'right')。  
  * **步骤**:  
    1. 根据方向对 gameState.board 执行滑动和合并操作（使用 gameState.config.mergeLogic）。这将产生一个 processedBoard、此次移动获得的 pointsEarned，以及一个布尔值 boardChanged。  
    2. 如果 \!boardChanged，则返回原始的 gameState 对象（引用不变）。  
    3. 如果 boardChanged:  
       a. 计算 newScore \= gameState.score \+ pointsEarned。  
       b. 调用内部的随机方块添加逻辑（见5.1），传入 processedBoard、gameState.config（特别是 tileValueDistribution）和 gameState.currentSeed。这将返回 { newBoardWithTile: ReadonlyArray\<ReadonlyArray\<number\>\>, nextSeed: number, tileAdded: boolean, newTileValue?: number, newTilePosition?: {r:number, c:number} }。  
       c. 更新 newTilesPlacedCount \= gameState.tilesPlacedCount \+ (tileAdded ? 1 : 0)。  
       d. 检查新的游戏结束状态: newIsGameOver \= \_calculateIsGameOver(newBoardWithTile, gameState.config.mergeLogic)。  
       e. 构造并返回一个新的 GameState 对象，包含 newBoardWithTile、newScore、gameState.config (不变)、nextSeed、newIsGameOver 和 newTilesPlacedCount。

## **5\. 内部纯函数和逻辑模块**

### **5.1. 随机数与方块放置模块 (RandomUtils)**

这个模块将封装PRNG逻辑和基于权重的随机选择。

* **prngNext(seed: number): { value: number, nextSeed: number }**:  
  * 一个简单的PRNG实现（例如，LCG: nextSeed \= (a \* seed \+ c) % m）。  
  * 返回一个0到1之间的伪随机数 (value) 和下一个种子 (nextSeed)。  
* **selectWeightedValue\<T\>(distribution: ReadonlyArray\<{value: T, weight: number}\>, randomNumber: number): T**:  
  * 根据提供的 randomNumber (0-1范围) 和权重分布，选择一个值。  
* **\_placeNewTileOnBoard(board: ReadonlyArray\<ReadonlyArray\<number\>\>, config: Readonly\<GameConfig\>, currentSeed: number): { newBoardWithTile: ReadonlyArray\<ReadonlyArray\<number\>\>, nextSeed: number, tileAdded: boolean, newTileValue?: number, newTilePosition?: {r:number, c:number} }**:  
  * 获取所有空单元格 emptyCells \= getEmptyCells(board)。  
  * 如果 emptyCells 为空，返回 { newBoardWithTile: board, nextSeed: currentSeed, tileAdded: false }。  
  * 使用 prngNext(currentSeed) 获取 rand1 和 seedAfterValueChoice。  
  * 使用 selectWeightedValue(config.tileValueDistribution, rand1) 选择 tileValue。  
  * 使用 prngNext(seedAfterValueChoice) 获取 rand2 和 finalNextSeed。  
  * 使用 rand2 从 emptyCells 中选择一个随机位置 chosenCellPosition。  
  * 创建 newBoardWithTile，将 tileValue 放置在 chosenCellPosition。  
  * 返回 { newBoardWithTile, nextSeed: finalNextSeed, tileAdded: true, newTileValue: tileValue, newTilePosition: chosenCellPosition }。

### **5.2. 移动与合并逻辑模块 (BoardOperations)**

* **slide(row: ReadonlyArray\<number\>): ReadonlyArray\<number\>**: 同v1。  
* **mergeLine(row: ReadonlyArray\<number\>, mergeLogic: GameConfig\['mergeLogic'\]): { newRow: ReadonlyArray\<number\>, pointsEarned: number, lineChanged: boolean }**:  
  * 接收已滑动过的行和合并逻辑。  
  * 应用 mergeLogic 进行合并。  
  * 返回新行、得分和是否有变化。  
* **processLine(row: ReadonlyArray\<number\>, mergeLogic: GameConfig\['mergeLogic'\]): { newRow: ReadonlyArray\<number\>, pointsEarned: number, lineChanged: boolean }**:  
  * 先 slide，然后 mergeLine。  
* **transpose(board: ReadonlyArray\<ReadonlyArray\<number\>\>): ReadonlyArray\<ReadonlyArray\<number\>\>**: 同v1。  
* **reverseItems\<T\>(items: ReadonlyArray\<T\>): ReadonlyArray\<T\>**: 同v1。  
* **\_executeMoveOnBoard(board: ReadonlyArray\<ReadonlyArray\<number\>\>, direction: string, mergeLogic: GameConfig\['mergeLogic'\]): { newBoard: ReadonlyArray\<ReadonlyArray\<number\>\>, totalPointsEarned: number, boardChanged: boolean }**:  
  * 根据 direction，可能使用 transpose 和 reverseItems 辅助。  
  * 对每一行/列应用 processLine。  
  * 累积总得分和跟踪棋盘是否有任何变化。

### **5.3. 游戏状态检查模块 (GameChecks)**

* **getEmptyCells(board: ReadonlyArray\<ReadonlyArray\<number\>\>): ReadonlyArray\<{r: number, c: number}\>**: 同v1。  
* **\_canAnyCellMove(board: ReadonlyArray\<ReadonlyArray\<number\>\>, mergeLogic: GameConfig\['mergeLogic'\]): boolean**:  
  * 检查棋盘上是否有任何相邻的方块可以根据 mergeLogic 合并。  
  * 遍历棋盘，对每个单元格检查其右边和下边的邻居是否可合并。  
* **\_calculateIsGameOver(board: ReadonlyArray\<ReadonlyArray\<number\>\>, mergeLogic: GameConfig\['mergeLogic'\]): boolean**:  
  * 游戏结束条件：getEmptyCells(board).length \=== 0 && \!\_canAnyCellMove(board, mergeLogic)。

## **6\. 示例用法 (保持不变，但内部逻辑更精确)**

// 假设导入: import \* as Game2048 from './game-2048-core-fp-v2';

const config \= {  
    boardSize: 4,  
    initialSeed: Date.now(), // Or any fixed number for deterministic play  
    numberOfInitialTiles: 2,  
    tileValueDistribution: \[{value: 2, weight: 9}, {value: 4, weight: 1}\],  
    mergeLogic: (v1, v2) \=\> (v1 \=== v2 ? { mergedValue: v1 \+ v2, scoreEarned: v1 \+ v2 } : null)  
};

let gameState \= Game2048.createGame(config);  
console.log("Initial Board:", Game2048.getBoard(gameState));  
console.log("Initial Score:", Game2048.getScore(gameState));  
console.log("Initial Seed:", gameState.currentSeed);

// 尝试向左移动  
const nextGameState \= Game2048.move(gameState, 'left');

if (nextGameState \!== gameState) {  
    console.log("Board after moving left:", Game2048.getBoard(nextGameState));  
    console.log("Score:", Game2048.getScore(nextGameState));  
    console.log("Seed after move:", nextGameState.currentSeed);  
    gameState \= nextGameState;  
} else {  
    console.log("No change after moving left.");  
}

if (gameState.isGameOver) { // Accessing the authoritative flag  
    console.log("Game Over\! Final Score:", Game2048.getScore(gameState));  
}

## **7\. 总结**

此 v2 规范通过引入 GameConfig，明确PRNG种子管理和演化，以及详细定义方块生成和合并逻辑，进一步增强了2048核心库的精确性和函数式纯度。这种设计为构建一个健壮、可测试且灵活的游戏引擎奠定了坚实的基础，同时允许通过配置进行定制（例如，不同的方块数值、合并规则）。
