import { describe, it, expect } from 'vitest';
import { createDeck, parseCard, cardImagePath } from '@/lib/deck';

describe('createDeck', () => {
  it('returns 81 unique card ids', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(81);
    expect(new Set(deck).size).toBe(81);
  });

  it('contains every id from 0 to 80', () => {
    const deck = createDeck();
    for (let i = 0; i < 81; i++) expect(deck).toContain(i);
  });

  it('is shuffled (almost certainly not sorted)', () => {
    const deck = createDeck();
    const sorted = [...deck].sort((a, b) => a - b);
    expect(deck).not.toEqual(sorted);
  });
});

describe('parseCard', () => {
  it('decodes card 0 to all-zero attributes', () => {
    expect(parseCard(0)).toEqual({ id: 0, color: 0, fill: 0, shape: 0, count: 0 });
  });

  it('decodes card 80 to all-two attributes', () => {
    expect(parseCard(80)).toEqual({ id: 80, color: 2, fill: 2, shape: 2, count: 2 });
  });

  it('decodes card 1 correctly (color=1, rest 0)', () => {
    expect(parseCard(1)).toEqual({ id: 1, color: 1, fill: 0, shape: 0, count: 0 });
  });

  it('decodes card 3 correctly (fill=1, rest 0)', () => {
    expect(parseCard(3)).toEqual({ id: 3, color: 0, fill: 1, shape: 0, count: 0 });
  });

  it('round-trips: re-encoding parsed attributes gives back the original id', () => {
    for (let id = 0; id < 81; id++) {
      const card = parseCard(id);
      const reEncoded = card.color + card.fill * 3 + card.shape * 9 + card.count * 27;
      expect(reEncoded).toBe(id);
    }
  });
});

describe('cardImagePath', () => {
  it('produces correct path for card 0 (red full oval x1)', () => {
    expect(cardImagePath(parseCard(0))).toBe('/setshapes/rfo.png');
  });

  it('produces a path ending in .png', () => {
    for (let id = 0; id < 81; id++) {
      expect(cardImagePath(parseCard(id))).toMatch(/\.png$/);
    }
  });

  it('path starts with /setshapes/', () => {
    for (let id = 0; id < 81; id++) {
      expect(cardImagePath(parseCard(id))).toMatch(/^\/setshapes\//);
    }
  });
});
