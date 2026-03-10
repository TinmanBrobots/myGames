import { shuffle } from 'lodash';
import { type CardId, type FoundSet, type GameState, type Player } from './types';
import { parseCard } from './deck';
import { isValidSet, findFirstSet, countSets } from './validator';

const INITIAL_BOARD_SIZE = 12;
const MAX_BOARD_SIZE = 21;
const COLUMN_SIZE = 3;

// ── Board helpers ─────────────────────────────────────────────────────────────

/** Deal n cards from the deck into empty board slots, or append new slots. */
function dealCards(state: GameState, count: number): GameState {
  const board = [...state.board];
  let cursor = state.deckCursor;

  for (let i = 0; i < count; i++) {
    if (cursor >= state.deck.length) break;
    // Fill first empty slot, or push a new slot
    const emptyIdx = board.indexOf(null);
    if (emptyIdx !== -1) {
      board[emptyIdx] = state.deck[cursor++];
    } else {
      board.push(state.deck[cursor++]);
    }
  }

  return { ...state, board, deckCursor: cursor };
}

/** Remove cards at given board indices and return a fully compacted array (no nulls). */
function removeFromBoard(board: (CardId | null)[], indices: number[]): CardId[] {
  const toRemove = new Set(indices);
  return board.filter((c, i): c is CardId => c !== null && !toRemove.has(i));
}

// ── Public state transitions ──────────────────────────────────────────────────

export function createInitialState(players: Player[]): GameState {
  const deck = shuffle(Array.from({ length: 81 }, (_, i) => i)) as CardId[];
  const board: (CardId | null)[] = deck.slice(0, INITIAL_BOARD_SIZE);
  const selections: Record<string, number[]> = {};
  for (const p of players) selections[p.id] = [];

  return {
    deck,
    deckCursor: INITIAL_BOARD_SIZE,
    board,
    selections,
    foundSets: [],
    phase: 'playing',
    startedAt: Date.now(),
    lastSetAt: Date.now(),
  };
}

export function toggleCardSelection(
  state: GameState,
  playerId: string,
  boardIndex: number
): GameState {
  const current = state.selections[playerId] ?? [];
  const alreadySelected = current.includes(boardIndex);
  const updated = alreadySelected
    ? current.filter(i => i !== boardIndex)
    : [...current, boardIndex];

  return {
    ...state,
    selections: { ...state.selections, [playerId]: updated },
  };
}

export function submitSelection(state: GameState, playerId: string): GameState {
  const indices = state.selections[playerId] ?? [];
  if (indices.length !== 3) return state;

  const [a, b, c] = indices.map(i => parseCard(state.board[i]!));

  // Invalid set — clear only the submitting player's selection
  if (!isValidSet(a, b, c)) {
    return { ...state, selections: { ...state.selections, [playerId]: [] } };
  }

  // Valid set — clear ALL players' selections so stale picks don't persist
  const clearedSelections = Object.fromEntries(
    Object.keys(state.selections).map(id => [id, []])
  );

  // Valid set — record it, remove cards, deal replacements
  const foundSet: FoundSet = {
    cardIds: [a.id, b.id, c.id],
    playerId,
    elapsedSeconds: Math.floor((Date.now() - state.lastSetAt) / 1000),
    setsOnBoard: countSets(state.board),
  };

  const deckEmpty = state.deckCursor >= state.deck.length;
  const boardHas12 = state.board.filter(c => c !== null).length === 12;

  let nextState: GameState = {
    ...state,
    selections: clearedSelections,
    foundSets: [...state.foundSets, foundSet],
    lastSetAt: Date.now(),
  };

  if (!deckEmpty && boardHas12) {
    // Replace the three removed cards in-place
    const board = [...nextState.board];
    let cursor = nextState.deckCursor;
    for (const i of indices) {
      board[i] = nextState.deck[cursor++];
    }
    nextState = { ...nextState, board, deckCursor: cursor };
  } else {
    // Remove cards and don't replace (board shrinks)
    const board = removeFromBoard(nextState.board, indices);
    nextState = { ...nextState, board };
  }

  // Check game-over: deck exhausted and no sets remain
  if (nextState.deckCursor >= nextState.deck.length && findFirstSet(nextState.board) === null) {
    return { ...nextState, phase: 'over' };
  }

  return nextState;
}

export function addColumnToBoard(state: GameState): GameState {
  const cardCount = state.board.filter(c => c !== null).length;
  if (cardCount >= MAX_BOARD_SIZE) return state;
  if (state.deckCursor >= state.deck.length) return state;

  return dealCards(state, COLUMN_SIZE);
}

export function togglePause(state: GameState): GameState {
  if (state.phase === 'over') return state;
  return {
    ...state,
    phase: state.phase === 'paused' ? 'playing' : 'paused',
  };
}
