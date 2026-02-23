import { Box, Typography } from '@mui/material';

interface CurrentNumberDisplayProps {
  number: number | null;
  gameStatus: string;
}

export function CurrentNumberDisplay({ number, gameStatus }: CurrentNumberDisplayProps) {
  if (gameStatus !== 'playing') {
    return null;
  }

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
        {number ?? '—'}
      </Typography>
    </Box>
  );
}
