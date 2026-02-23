import { useState, useCallback } from 'react';
import type { GameState } from '../types/game';
import { generateNumbers, getValidSlotIndices, hasValidPlacement } from '../utils/gameLogic';

const NUM_SLOTS = 10;

function createInitialState(): GameState {
  const numbers = generateNumbers();
  const [first, ...remaining] = numbers;
  const slots: (number | null)[] = Array(NUM_SLOTS).fill(null);

  const gameStatus = first !== undefined && !hasValidPlacement(first, slots)
    ? 'lost'
    : 'playing';

  return {
    slots,
    currentNumber: first ?? null,
    remainingNumbers: remaining,
    gameStatus,
  };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialState);

  const placeNumber = useCallback((slotIndex: number) => {
    setState((prev) => {
      if (prev.gameStatus !== 'playing' || prev.currentNumber === null) return prev;

      const validIndices = getValidSlotIndices(prev.currentNumber, prev.slots);
      if (!validIndices.includes(slotIndex)) return prev;

      const newSlots = [...prev.slots];
      newSlots[slotIndex] = prev.currentNumber;

      const [nextNumber, ...remaining] = prev.remainingNumbers;

      if (remaining.length === 0 && nextNumber === undefined) {
        return {
          slots: newSlots,
          currentNumber: null,
          remainingNumbers: [],
          gameStatus: 'won',
        };
      }

      const newStatus = nextNumber !== undefined && !hasValidPlacement(nextNumber, newSlots)
        ? 'lost'
        : 'playing';

      return {
        slots: newSlots,
        currentNumber: nextNumber ?? null,
        remainingNumbers: remaining,
        gameStatus: newStatus,
      };
    });
  }, []);

  const restart = useCallback(() => {
    setState(createInitialState());
  }, []);

  const validSlotIndices =
    state.gameStatus === 'playing' && state.currentNumber !== null
      ? getValidSlotIndices(state.currentNumber, state.slots)
      : [];

  return {
    ...state,
    placeNumber,
    restart,
    validSlotIndices,
  };
}
