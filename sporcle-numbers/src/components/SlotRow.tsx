import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Slot } from './Slot';
import type { SlotValue } from '../types/game';

interface SlotRowProps {
  slots: SlotValue[];
  validSlotIndices: number[];
  isDisabled: boolean;
  onPlace: (index: number) => void;
}

export function SlotRow({ slots, validSlotIndices, isDisabled, onPlace }: SlotRowProps) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        display: 'flex',
        gap: isCompact ? 1 : 2,
        flexDirection: { xs: 'column', sm: 'row' },
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: { xs: 'stretch', sm: 'center' },
      }}
    >
      {slots.map((value, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCompact ? 'stretch' : 'center',
          }}
        >
          <Slot
            value={value}
            index={index}
            isValid={validSlotIndices.includes(index)}
            isDisabled={isDisabled}
            onPlace={onPlace}
            compact={isCompact}
          />
          {!isCompact && (
            <Box component="span" sx={{ mt: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
              {index + 1}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}
