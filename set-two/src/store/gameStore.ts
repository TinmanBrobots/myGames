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

const SOLO_PLAYER: Player = { id: 'p1', name: 'You', score: 0 };

interface GameStore {
  state: GameState;
  players: Player[];
  hintIndices: [number, number, number] | null;
  // Actions
  newGame: () => void;
  selectCard: (boardIndex: number) => void;
  addCards: () => void;
  togglePause: () => void;
  revealHint: () => void;
  hideHint: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialState([SOLO_PLAYER]),
  players: [SOLO_PLAYER],
  hintIndices: null,

  newGame: () =>
    set({
      state: createInitialState([SOLO_PLAYER]),
      hintIndices: null,
    }),

  selectCard: (boardIndex) => {
    const { state } = get();
    if (state.phase !== 'playing') return;

    const currentSelection = state.selections['p1'] ?? [];
    const alreadyThree = currentSelection.length === 3;
    if (alreadyThree) return;

    let next = toggleCardSelection(state, 'p1', boardIndex);

    // Auto-submit when three cards are selected
    if (next.selections['p1'].length === 3) {
      next = submitSelection(next, 'p1');
    }

    set({ state: next, hintIndices: null });
  },

  addCards: () => {
    const { state } = get();
    if (state.phase !== 'playing') return;
    set({ state: addColumnToBoard(state), hintIndices: null });
  },

  togglePause: () =>
    set((s) => ({ state: togglePause(s.state), hintIndices: null })),

  revealHint: () => {
    const { state } = get();
    if (state.phase !== 'playing') return;
    const hint = findFirstSet(state.board);
    set({ hintIndices: hint ?? null });
  },

  hideHint: () => set({ hintIndices: null }),
}));
