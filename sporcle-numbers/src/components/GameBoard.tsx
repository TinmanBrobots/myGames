import { useEffect, useCallback, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import { useGameState } from '../hooks/useGameState';
import { GameStatusBox } from './GameStatusBox';
import { SlotRow } from './SlotRow';

export function GameBoard() {
  const [instructionsOpen, setInstructionsOpen] = useState(true);

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
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Dialog
        open={instructionsOpen}
        onClose={() => setInstructionsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={700}>How to Play</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Place each number in a slot so they end up in ascending order.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click a valid slot (highlighted) or press 1–9 or 0 (for slot 10) on your keyboard.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You win when all 10 numbers are placed correctly. You lose if you receive a number that
            has no valid slot.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInstructionsOpen(false)} variant="contained">
            Got it
          </Button>
        </DialogActions>
      </Dialog>

      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontWeight: 700 }}
      >
        Sporcle Numbers
      </Typography>

      <GameStatusBox
        gameStatus={gameStatus}
        currentNumber={currentNumber}
        onRestart={restart}
        onOpenInstructions={() => setInstructionsOpen(true)}
      />

      <SlotRow
        slots={slots}
        validSlotIndices={validSlotIndices}
        isDisabled={gameStatus !== 'playing'}
        onPlace={placeNumber}
      />

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, sm: 3 } }}>
        <Button variant="outlined" onClick={restart}>
          Restart
        </Button>
      </Box>
    </Box>
  );
}
