'use client';

import { create } from 'zustand';
import { type GameState, type Player } from '@/lib/types';
import {
  createInitialState,
  toggleCardSelection,
  submitSelection,
  addColumnToBoard,
  togglePause,
} from '@/lib/game';
import { findFirstSet } from '@/lib/validator';

const PLAYERS: [Player, Player] = [
  { id: 'p1', name: 'Player 1', score: 0 },
  { id: 'p2', name: 'Player 2', score: 0 },
];

interface LocalTwoPlayerStore {
  state: GameState;
  players: [Player, Player];
  hintIndices: [number, number, number] | null;
  newGame: () => void;
  selectCard: (boardIndex: number, playerId: 'p1' | 'p2') => void;
  addCards: () => void;
  togglePause: () => void;
  revealHint: () => void;
  hideHint: () => void;
}

export const useLocalTwoPlayerStore = create<LocalTwoPlayerStore>((set, get) => ({
  state: createInitialState(PLAYERS),
  players: PLAYERS,
  hintIndices: null,

  newGame: () =>
    set({ state: createInitialState(PLAYERS), hintIndices: null }),

  selectCard: (boardIndex, playerId) => {
    const { state } = get();
    if (state.phase !== 'playing') return;

    const currentSelection = state.selections[playerId] ?? [];
    if (currentSelection.length === 3) return;

    let next = toggleCardSelection(state, playerId, boardIndex);

    if (next.selections[playerId].length === 3) {
      next = submitSelection(next, playerId);
    }

    set({ state: next, hintIndices: null });
  },

  addCards: () => {
    const { state } = get();
    if (state.phase !== 'playing') return;
    let next = addColumnToBoard(state);
    // 2-player cap: if board has reached 15 cards and no set exists, game over
    const cardCount = next.board.filter(c => c !== null).length;
    if (cardCount >= 15 && findFirstSet(next.board) === null) {
      next = { ...next, phase: 'over' };
    }
    set({ state: next, hintIndices: null });
  },

  togglePause: () =>
    set((s) => ({ state: togglePause(s.state), hintIndices: null })),

  revealHint: () => {
    const { state } = get();
    if (state.phase !== 'playing') return;
    set({ hintIndices: findFirstSet(state.board) ?? null });
  },

  hideHint: () => set({ hintIndices: null }),
}));
