import type { SlotValue } from '../types/game';

const NUM_SLOTS = 10;
const MIN_NUM = 1;
const MAX_NUM = 100;

/**
 * Fisher-Yates shuffle to randomize an array in place.
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate 10 unique integers between 1 and 100, shuffled.
 */
export function generateNumbers(): number[] {
  const pool: number[] = [];
  for (let i = MIN_NUM; i <= MAX_NUM; i++) {
    pool.push(i);
  }
  return shuffle(pool).slice(0, NUM_SLOTS);
}

/**
 * Get the indices of slots where placing `num` would be valid.
 * A slot is valid if the number fits between its left and right neighbors
 * (or has no left/right constraint).
 */
export function getValidSlotIndices(num: number, slots: SlotValue[]): number[] {
  const valid: number[] = [];

  for (let i = 0; i < slots.length; i++) {
    if (slots[i] !== null) continue; // Slot is occupied

    const leftNeighbor = findLeftNeighbor(i, slots);
    const rightNeighbor = findRightNeighbor(i, slots);

    const leftOk = leftNeighbor === null || num > leftNeighbor;
    const rightOk = rightNeighbor === null || num < rightNeighbor;

    if (leftOk && rightOk) {
      valid.push(i);
    }
  }

  return valid;
}

function findLeftNeighbor(index: number, slots: SlotValue[]): number | null {
  for (let i = index - 1; i >= 0; i--) {
    if (slots[i] !== null) return slots[i] as number;
  }
  return null;
}

function findRightNeighbor(index: number, slots: SlotValue[]): number | null {
  for (let i = index + 1; i < slots.length; i++) {
    if (slots[i] !== null) return slots[i] as number;
  }
  return null;
}

/**
 * Check if the current number has any valid slot to be placed.
 * If not, the player loses (number was revealed but cannot be placed).
 */
export function hasValidPlacement(currentNumber: number, slots: SlotValue[]): boolean {
  return getValidSlotIndices(currentNumber, slots).length > 0;
}
