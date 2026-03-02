import { Box, Typography } from '@mui/material';
import type { SlotValue } from '../types/game';

interface SlotProps {
  value: SlotValue;
  index: number;
  isValid: boolean;
  isDisabled: boolean;
  onPlace: (index: number) => void;
  compact?: boolean;
}

export function Slot({ value, index, isValid, isDisabled, onPlace, compact }: SlotProps) {
  const isEmpty = value === null;
  const canClick = isEmpty && isValid && !isDisabled;

  const handleClick = () => {
    if (canClick) onPlace(index);
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        width: compact ? '100%' : 56,
        height: compact ? "5vh" : 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? 1 : 0,
        px: compact ? 1.5 : 0,
        border: 2,
        borderColor: isEmpty ? (isValid ? 'primary.main' : 'grey.300') : 'grey.400',
        borderRadius: 1,
        bgcolor: isEmpty && isValid ? 'primary.50' : isEmpty ? 'grey.50' : 'grey.100',
        cursor: canClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        flexShrink: 0,
        '&:hover': canClick
          ? {
              bgcolor: 'primary.100',
              borderColor: 'primary.main',
              transform: compact ? 'none' : 'scale(1.05)',
            }
          : {},
      }}
    >
      {compact ? (
        <>
          <Box
            component="span"
            sx={{
              fontSize: '0.75rem',
              color: 'text.secondary',
              minWidth: 24,
              textAlign: 'left',
              flexShrink: 0,
            }}
          >
            {index + 1}
          </Box>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minWidth: 0,
            }}
          >
            <Typography variant="h6" sx={{ fontSize: '0.875rem' }}>
              {isEmpty ? '—' : value}
            </Typography>
          </Box>
          <Box sx={{ minWidth: 24, flexShrink: 0 }} />
        </>
      ) : (
        <Typography variant="h6">
          {isEmpty ? '—' : value}
        </Typography>
      )}
    </Box>
  );
}
