export type GameStatus = 'playing' | 'won' | 'lost';

export type SlotValue = number | null;

export interface GameState {
  slots: SlotValue[];
  currentNumber: number | null;
  remainingNumbers: number[];
  gameStatus: GameStatus;
}
