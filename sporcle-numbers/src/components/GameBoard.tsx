import { useEffect, useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useGameState } from '../hooks/useGameState';
import { CurrentNumberDisplay } from './CurrentNumberDisplay';
import { SlotRow } from './SlotRow';
import { GameStatusOverlay } from './GameStatusOverlay';

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

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center', fontWeight: 700 }}>
        Sporcle Numbers
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        Place each number in a slot so they end up in ascending order. Click a valid slot or press
        1–9 or 0 (for slot 10).
      </Typography>

      <CurrentNumberDisplay number={currentNumber} gameStatus={gameStatus} />

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

      <GameStatusOverlay
        gameStatus={gameStatus}
        currentNumber={currentNumber}
        onRestart={restart}
      />
    </Box>
  );
}
