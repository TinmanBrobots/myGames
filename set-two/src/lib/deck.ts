import { shuffle } from 'lodash';
import { type Attribute, type Card, type CardId, COLOR_CODES, FILL_CODES, SHAPE_CODES } from './types';

const DECK_SIZE = 81;
const NUM_ATTRIBUTES = 4;

/** Returns a shuffled deck of all 81 card ids (0–80). */
export function createDeck(): CardId[] {
  return shuffle(Array.from({ length: DECK_SIZE }, (_, i) => i));
}

/**
 * Decodes a card id (0–80) into its four base-3 attributes.
 * Digit order: color (10^0), fill (10^1), shape (10^2), count (10^3).
 */
export function parseCard(id: CardId): Card {
  const digits = Array.from({ length: NUM_ATTRIBUTES }, (_, i) =>
    (Math.floor(id / 3 ** i) % 3) as Attribute
  );
  return {
    id,
    color: digits[0],
    fill:  digits[1],
    shape: digits[2],
    count: digits[3],
  };
}

/**
 * Returns the URL path for a card's image asset.
 * e.g. card with color=0, fill=1, shape=2 → '/setshapes/rhs.png'
 */
export function cardImagePath(card: Card): string {
  return `/setshapes/${COLOR_CODES[card.color]}${FILL_CODES[card.fill]}${SHAPE_CODES[card.shape]}.png`;
}
