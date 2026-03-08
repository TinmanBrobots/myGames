import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  toggleCardSelection,
  submitSelection,
  addColumnToBoard,
  togglePause,
} from '@/lib/game';
import { type Player } from '@/lib/types';
import { isValidSet } from '@/lib/validator';
import { parseCard } from '@/lib/deck';

const player: Player = { id: 'p1', name: 'Alice', score: 0 };

describe('createInitialState', () => {
  it('starts with 12 cards on the board', () => {
    const state = createInitialState([player]);
    const filled = state.board.filter(c => c !== null);
    expect(filled).toHaveLength(12);
  });

  it('has deckCursor at 12', () => {
    const state = createInitialState([player]);
    expect(state.deckCursor).toBe(12);
  });

  it('starts in playing phase', () => {
    expect(createInitialState([player]).phase).toBe('playing');
  });

  it('initialises an empty selection for each player', () => {
    const p2: Player = { id: 'p2', name: 'Bob', score: 0 };
    const state = createInitialState([player, p2]);
    expect(state.selections['p1']).toEqual([]);
    expect(state.selections['p2']).toEqual([]);
  });
});

describe('toggleCardSelection', () => {
  it('adds a board index to the selection', () => {
    const state = createInitialState([player]);
    const next = toggleCardSelection(state, 'p1', 3);
    expect(next.selections['p1']).toContain(3);
  });

  it('removes an already-selected index (deselect)', () => {
    const state = createInitialState([player]);
    const s1 = toggleCardSelection(state, 'p1', 3);
    const s2 = toggleCardSelection(s1, 'p1', 3);
    expect(s2.selections['p1']).not.toContain(3);
  });

  it('does not mutate the original state', () => {
    const state = createInitialState([player]);
    toggleCardSelection(state, 'p1', 3);
    expect(state.selections['p1']).toEqual([]);
  });
});

describe('submitSelection', () => {
  it('clears the selection after submission', () => {
    const state = createInitialState([player]);
    let s = toggleCardSelection(state, 'p1', 0);
    s = toggleCardSelection(s, 'p1', 1);
    s = toggleCardSelection(s, 'p1', 2);
    const next = submitSelection(s, 'p1');
    expect(next.selections['p1']).toEqual([]);
  });

  it('records a found set when selection is valid', () => {
    // Build a state with a known valid set at indices 0,1,2
    const state = createInitialState([player]);
    // Find a valid set on the board
    const board = state.board as number[];
    let validIndices: [number, number, number] | null = null;
    outer: for (let i = 0; i < board.length - 2; i++) {
      for (let j = i + 1; j < board.length - 1; j++) {
        for (let k = j + 1; k < board.length; k++) {
          if (isValidSet(parseCard(board[i]), parseCard(board[j]), parseCard(board[k]))) {
            validIndices = [i, j, k];
            break outer;
          }
        }
      }
    }
    if (!validIndices) return; // skip if no set (unlikely with 12 cards)

    let s = toggleCardSelection(state, 'p1', validIndices[0]);
    s = toggleCardSelection(s, 'p1', validIndices[1]);
    s = toggleCardSelection(s, 'p1', validIndices[2]);
    const next = submitSelection(s, 'p1');
    expect(next.foundSets).toHaveLength(1);
    expect(next.foundSets[0].playerId).toBe('p1');
  });

  it('does not record a found set when selection is invalid', () => {
    const state = createInitialState([player]);
    const board = state.board as number[];
    // Find an invalid trio (brute-force first non-set)
    let invalidIndices: [number, number, number] | null = null;
    outer: for (let i = 0; i < board.length - 2; i++) {
      for (let j = i + 1; j < board.length - 1; j++) {
        for (let k = j + 1; k < board.length; k++) {
          if (!isValidSet(parseCard(board[i]), parseCard(board[j]), parseCard(board[k]))) {
            invalidIndices = [i, j, k];
            break outer;
          }
        }
      }
    }
    if (!invalidIndices) return; // skip (very unlikely)

    let s = toggleCardSelection(state, 'p1', invalidIndices[0]);
    s = toggleCardSelection(s, 'p1', invalidIndices[1]);
    s = toggleCardSelection(s, 'p1', invalidIndices[2]);
    const next = submitSelection(s, 'p1');
    expect(next.foundSets).toHaveLength(0);
  });
});

describe('addColumnToBoard', () => {
  it('adds 3 cards to the board', () => {
    const state = createInitialState([player]);
    const next = addColumnToBoard(state);
    const filled = next.board.filter(c => c !== null);
    expect(filled).toHaveLength(15);
  });

  it('advances deckCursor by 3', () => {
    const state = createInitialState([player]);
    const next = addColumnToBoard(state);
    expect(next.deckCursor).toBe(state.deckCursor + 3);
  });

  it('does not add cards beyond 21', () => {
    let state = createInitialState([player]);
    for (let i = 0; i < 4; i++) state = addColumnToBoard(state);
    const next = addColumnToBoard(state);
    const filled = next.board.filter(c => c !== null);
    expect(filled.length).toBeLessThanOrEqual(21);
  });
});

describe('togglePause', () => {
  it('transitions playing → paused', () => {
    const state = createInitialState([player]);
    expect(togglePause(state).phase).toBe('paused');
  });

  it('transitions paused → playing', () => {
    const state = { ...createInitialState([player]), phase: 'paused' as const };
    expect(togglePause(state).phase).toBe('playing');
  });

  it('does not change phase when game is over', () => {
    const state = { ...createInitialState([player]), phase: 'over' as const };
    expect(togglePause(state).phase).toBe('over');
  });
});
