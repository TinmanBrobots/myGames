import { Box, Button, Typography } from '@mui/material';
import type { GameStatus } from '../types/game';

interface GameStatusBoxProps {
  gameStatus: GameStatus;
  currentNumber: number | null;
  onRestart: () => void;
}

export function GameStatusBox({ gameStatus, currentNumber, onRestart }: GameStatusBoxProps) {
  if (gameStatus === 'playing') {
    return (
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.9 }}>
          Place this number
        </Typography>
        <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
          {currentNumber ?? '—'}
        </Typography>
      </Box>
    );
  }

  const isWon = gameStatus === 'won';

  return (
    <Box
      sx={{
        mb: 3,
        p: 3,
        borderRadius: 2,
        bgcolor: isWon ? 'success.main' : 'error.main',
        color: isWon ? 'success.contrastText' : 'error.contrastText',
        textAlign: 'center',
      }}
    >
      <Typography variant="h5" component="div" sx={{ fontWeight: 700, mb: 2 }}>
        {isWon ? 'You Win!' : 'Game Over'}
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {isWon
          ? 'All numbers placed in order. Well done!'
          : `No valid slot for ${currentNumber ?? 'this number'}.`}
      </Typography>
      <Button
        variant="contained"
        onClick={onRestart}
        sx={{
          bgcolor: 'white',
          color: isWon ? 'success.main' : 'error.main',
          '&:hover': { bgcolor: 'grey.100' },
        }}
      >
        Play Again
      </Button>
    </Box>
  );
}
