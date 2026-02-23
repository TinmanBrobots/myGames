import { Box, Button, Typography } from '@mui/material';

interface GameStatusOverlayProps {
  gameStatus: 'playing' | 'won' | 'lost';
  currentNumber: number | null;
  onRestart: () => void;
}

export function GameStatusOverlay({ gameStatus, currentNumber, onRestart }: GameStatusOverlayProps) {
  if (gameStatus === 'playing') return null;

  const isWon = gameStatus === 'won';

  return (
    <Box
      sx={{
        mt: 3,
        p: 3,
        borderRadius: 2,
        bgcolor: isWon ? 'success.light' : 'error.light',
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
