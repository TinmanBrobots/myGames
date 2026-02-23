import { useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Box, Button, Typography } from '@mui/material';
import { useGameState } from '../hooks/useGameState';
import { GameStatusBox } from './GameStatusBox';
import { SlotRow } from './SlotRow';

export function GameBoard() {
  const {
    slots,
    currentNumber,
    gameStatus,
    placeNumber,
    restart,
    validSlotIndices,
  } = useGameState();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;

      const key = e.key;
      const num = key === '0' ? 10 : parseInt(key, 10);
      if (num >= 1 && num <= 10) {
        const index = num - 1;
        if (validSlotIndices.includes(index)) {
          e.preventDefault();
          placeNumber(index);
        }
      }
    },
    [gameStatus, validSlotIndices, placeNumber]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const hasTriggeredConfetti = useRef(false);
  useEffect(() => {
    if (gameStatus === 'won') {
      if (!hasTriggeredConfetti.current) {
        hasTriggeredConfetti.current = true;
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: ['#2e7d32', '#4caf50', '#81c784', '#ffd54f', '#ff9800'],
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: ['#2e7d32', '#4caf50', '#81c784', '#ffd54f', '#ff9800'],
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      }
    } else {
      hasTriggeredConfetti.current = false;
    }
  }, [gameStatus]);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center', fontWeight: 700 }}>
        Sporcle Numbers
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        Place each number in a slot so they end up in ascending order. Click a valid slot or press
        1–9 or 0 (for slot 10).
      </Typography>

      <GameStatusBox
        gameStatus={gameStatus}
        currentNumber={currentNumber}
        onRestart={restart}
      />

      <SlotRow
        slots={slots}
        validSlotIndices={validSlotIndices}
        isDisabled={gameStatus !== 'playing'}
        onPlace={placeNumber}
      />

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button variant="outlined" onClick={restart}>
          Restart
        </Button>
      </Box>
    </Box>
  );
}
