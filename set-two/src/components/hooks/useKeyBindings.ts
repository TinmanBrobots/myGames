'use client';

import { useEffect } from 'react';

// Keyboard rows in left-to-right order, matching the physical keyboard layout.
// Each row maps to the corresponding row of cards on the board.
const KEYBOARD_ROWS = [
  ['KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP'],
  ['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon'],
  ['KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash'],
] as const;

const NUM_ROWS = 3;

// Builds a key-code → board-index map for the current board size.
// The board is a 3-row grid with ceil(boardSize/3) columns.
// Board indices run left-to-right, top-to-bottom (row-major, matching CSS Grid).
// Keys map the same way: Q W E R ... across the top card row,
//                        A S D F ... across the middle card row,
//                        Z X C V ... across the bottom card row.
function buildCardKeyMap(boardSize: number): Record<string, number> {
  const numCols = Math.ceil(boardSize / NUM_ROWS);
  const map: Record<string, number> = {};
  for (let row = 0; row < NUM_ROWS; row++) {
    for (let col = 0; col < numCols; col++) {
      const keyCode = KEYBOARD_ROWS[row][col];
      if (!keyCode) break;
      map[keyCode] = row * numCols + col;
    }
  }
  return map;
}

interface KeyBindings {
  onSelectCard: (boardIndex: number) => void;
  onNewGame: () => void;
  onRevealHint: () => void;
  onAddCards: () => void;
  onTogglePause: () => void;
  boardSize: number;
}

export function useKeyBindings({
  onSelectCard,
  onNewGame,
  onRevealHint,
  onAddCards,
  onTogglePause,
  boardSize,
}: KeyBindings) {
  useEffect(() => {
    const cardKeyMap = buildCardKeyMap(boardSize);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.repeat) return; // ignore held keys

      const cardIndex = cardKeyMap[e.code];
      if (cardIndex !== undefined) onSelectCard(cardIndex);
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'Escape':     onNewGame();      break;
        case 'ArrowRight': onRevealHint();   break;
        case 'Backslash':  onAddCards();     break;
        case 'Delete':
        case 'Backspace':  onTogglePause();  break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onSelectCard, onNewGame, onRevealHint, onAddCards, onTogglePause, boardSize]);
}
