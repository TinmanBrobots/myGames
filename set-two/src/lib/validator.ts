import { type Attribute, type Card, type CardId } from './types';
import { parseCard } from './deck';

/**
 * Three cards form a valid Set iff for every attribute, the three values
 * are either all the same or all different.
 * Equivalent condition: (a + b + c) % 3 === 0 for each attribute.
 */
export function isValidSet(a: Card, b: Card, c: Card): boolean {
  const attrs: (keyof Pick<Card, 'color' | 'fill' | 'shape' | 'count'>)[] =
    ['color', 'fill', 'shape', 'count'];
  return attrs.every(attr => (a[attr] + b[attr] + c[attr]) % 3 === 0);
}

/**
 * Given two parsed cards, returns the CardId of the unique third card that
 * would complete a valid Set with them.
 *
 * For each attribute: if a === b, the third must equal a; otherwise it must
 * be the remaining value (3 - a - b) % 3.
 */
export function thirdCardId(a: Card, b: Card): CardId {
  const attrs: (keyof Pick<Card, 'color' | 'fill' | 'shape' | 'count'>)[] =
    ['color', 'fill', 'shape', 'count'];

  // Re-encode the computed attributes back into a card id (base-3)
  return attrs.reduce((id, attr, i) => {
    const third: Attribute = (a[attr] === b[attr]
      ? a[attr]
      : ((3 - a[attr] - b[attr]) % 3)) as Attribute;
    return id + third * 3 ** i;
  }, 0);
}

/**
 * Searches `board` for any valid Set.
 * Returns the three board indices, or null if no Set exists.
 */
export function findFirstSet(board: (CardId | null)[]): [number, number, number] | null {
  const present = board
    .map((id, index) => (id !== null ? { id, index } : null))
    .filter((x): x is { id: CardId; index: number } => x !== null);

  const parsed = present.map(({ id }) => parseCard(id));

  for (let i = 0; i < present.length - 2; i++) {
    for (let j = i + 1; j < present.length - 1; j++) {
      const neededId = thirdCardId(parsed[i], parsed[j]);
      const k = present.findIndex(({ id }, idx) => idx > j && id === neededId);
      if (k !== -1) {
        return [present[i].index, present[j].index, present[k].index];
      }
    }
  }

  return null;
}

/** Counts all valid Sets currently on the board. */
export function countSets(board: (CardId | null)[]): number {
  const present = board
    .map((id, index) => (id !== null ? { id, index } : null))
    .filter((x): x is { id: CardId; index: number } => x !== null);

  const parsed = present.map(({ id }) => parseCard(id));
  let count = 0;

  for (let i = 0; i < present.length - 2; i++) {
    for (let j = i + 1; j < present.length - 1; j++) {
      const neededId = thirdCardId(parsed[i], parsed[j]);
      if (present.some(({ id }, idx) => idx > j && id === neededId)) {
        count++;
      }
    }
  }

  return count;
}
