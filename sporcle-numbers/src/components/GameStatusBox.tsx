import InfoIcon from '@mui/icons-material/Info';
import { Box, Button, IconButton, Typography } from '@mui/material';
import type { GameStatus } from '../types/game';

interface GameStatusBoxProps {
  gameStatus: GameStatus;
  currentNumber: number | null;
  onRestart: () => void;
  onOpenInstructions: () => void;
}

export function GameStatusBox({
  gameStatus,
  currentNumber,
  onRestart,
  onOpenInstructions,
}: GameStatusBoxProps) {
  if (gameStatus === 'playing') {
    return (
      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onOpenInstructions}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'inherit',
            opacity: 0.9,
            '&:hover': { opacity: 1 },
          }}
          size="small"
          aria-label="How to play"
        >
          <InfoIcon fontSize="small" />
        </IconButton>
        <Typography variant="overline" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: 'inherit' } }}>
          Place this number
        </Typography>
        <Typography
          variant="h3"
          component="div"
          sx={{ fontWeight: 700, fontSize: { xs: '2rem', sm: 'inherit' } }}
        >
          {currentNumber ?? '—'}
        </Typography>
      </Box>
    );
  }

  const isWon = gameStatus === 'won';

  return (
    <Box
      sx={{
        mb: { xs: 2, sm: 3 },
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        bgcolor: isWon ? 'success.main' : 'error.main',
        color: isWon ? 'success.contrastText' : 'error.contrastText',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <IconButton
        onClick={onOpenInstructions}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          color: 'inherit',
          opacity: 0.9,
          '&:hover': { opacity: 1 },
        }}
        size="small"
        aria-label="How to play"
      >
        <InfoIcon fontSize="small" />
      </IconButton>
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
