'use client';

import { useEffect } from 'react';

// Maps keyboard codes to board indices (row-major: col 0 = Q/A/Z, col 1 = W/S/X, ...)
// Same layout as original but cleaner: position i maps to board index i
const CARD_KEYS: Record<string, number> = {
  KeyQ: 0,  KeyA: 1,  KeyZ: 2,
  KeyW: 3,  KeyS: 4,  KeyX: 5,
  KeyE: 6,  KeyD: 7,  KeyC: 8,
  KeyR: 9,  KeyF: 10, KeyV: 11,
  KeyT: 12, KeyG: 13, KeyB: 14,
  KeyY: 15, KeyH: 16, KeyN: 17,
  KeyU: 18, KeyJ: 19, KeyM: 20,
};

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
    function handleKeyUp(e: KeyboardEvent) {
      // Don't fire when typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const cardIndex = CARD_KEYS[e.code];
      if (cardIndex !== undefined && cardIndex < boardSize) {
        onSelectCard(cardIndex);
        return;
      }

      switch (e.code) {
        case 'Escape':      onNewGame(); break;
        case 'ArrowRight':  onRevealHint(); break;
        case 'Backslash':   onAddCards(); break;
        case 'Delete':
        case 'Backspace':   onTogglePause(); break;
      }
    }

    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [onSelectCard, onNewGame, onRevealHint, onAddCards, onTogglePause, boardSize]);
}
