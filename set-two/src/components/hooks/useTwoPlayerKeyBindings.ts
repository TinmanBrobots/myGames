'use client';

import { useEffect } from 'react';

// P1 uses the left side of the keyboard (same row-major layout as solo mode).
const P1_ROWS = [
  ['KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY'],
  ['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH'],
  ['KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN'],
] as const;

// P2 uses the right side of the keyboard, same row-major logic.
// Row 0: U I O P [ ]  →  cols 0-5
// Row 1: J K L ; '    →  cols 0-4
// Row 2: M , . /      →  cols 0-3
const P2_ROWS = [
  ['KeyU','KeyI','KeyO','KeyP','BracketLeft'],
  ['KeyJ','KeyK','KeyL','Semicolon','Quote'],
  ['KeyM','Comma','Period','Slash','ShiftRight'],
] as const;

const NUM_ROWS = 3;

function buildTwoPlayerKeyMap(boardSize: number): {
  p1: Record<string, number>;
  p2: Record<string, number>;
} {
  const numCols = Math.ceil(boardSize / NUM_ROWS);
  const p1: Record<string, number> = {};
  const p2: Record<string, number> = {};

  for (let row = 0; row < NUM_ROWS; row++) {
    for (let col = 0; col < numCols; col++) {
      const boardIndex = row * numCols + col;
      const p1Key = P1_ROWS[row][col];
      const p2Key = P2_ROWS[row][col];
      if (p1Key) p1[p1Key] = boardIndex;
      if (p2Key) p2[p2Key] = boardIndex;
    }
  }

  return { p1, p2 };
}

interface TwoPlayerKeyBindings {
  onSelectCard: (boardIndex: number, playerId: 'p1' | 'p2') => void;
  onNewGame: () => void;
  onRevealHint: () => void;
  onAddCards: () => void;
  onTogglePause: () => void;
  boardSize: number;
  canAddCards: boolean;
}

export function useTwoPlayerKeyBindings({
  onSelectCard,
  onNewGame,
  onRevealHint,
  onAddCards,
  onTogglePause,
  boardSize,
  canAddCards,
}: TwoPlayerKeyBindings) {
  useEffect(() => {
    const { p1, p2 } = buildTwoPlayerKeyMap(boardSize);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.repeat) return;

      if (e.code in p1) { onSelectCard(p1[e.code], 'p1'); return; }
      if (e.code in p2) { onSelectCard(p2[e.code], 'p2'); return; }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'Escape':     onNewGame();     break;
        case 'ArrowRight': onRevealHint();  break;
        case 'Backslash':  if (canAddCards) onAddCards(); break;
        case 'Delete':
        case 'Backspace':  onTogglePause(); break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onSelectCard, onNewGame, onRevealHint, onAddCards, onTogglePause, boardSize, canAddCards]);
}
