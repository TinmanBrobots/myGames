import { Box } from '@mui/material';
import type { SlotValue } from '../types/game';

interface SlotProps {
  value: SlotValue;
  index: number;
  isValid: boolean;
  isDisabled: boolean;
  onPlace: (index: number) => void;
}

export function Slot({ value, index, isValid, isDisabled, onPlace }: SlotProps) {
  const isEmpty = value === null;
  const canClick = isEmpty && isValid && !isDisabled;

  const handleClick = () => {
    if (canClick) onPlace(index);
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        width: 56,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 2,
        borderColor: isEmpty ? (isValid ? 'primary.main' : 'grey.300') : 'grey.400',
        borderRadius: 1,
        bgcolor: isEmpty && isValid ? 'primary.50' : isEmpty ? 'grey.50' : 'grey.100',
        cursor: canClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': canClick
          ? {
              bgcolor: 'primary.100',
              borderColor: 'primary.main',
              transform: 'scale(1.05)',
            }
          : {},
      }}
    >
      {isEmpty ? '—' : value}
    </Box>
  );
}
