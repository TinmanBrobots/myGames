import { Box } from '@mui/material';
import { Slot } from './Slot';
import type { SlotValue } from '../types/game';

interface SlotRowProps {
  slots: SlotValue[];
  validSlotIndices: number[];
  isDisabled: boolean;
  onPlace: (index: number) => void;
}

export function SlotRow({ slots, validSlotIndices, isDisabled, onPlace }: SlotRowProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: 'nowrap',
        justifyContent: 'center',
      }}
    >
      {slots.map((value, index) => (
        <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Slot
            value={value}
            index={index}
            isValid={validSlotIndices.includes(index)}
            isDisabled={isDisabled}
            onPlace={onPlace}
          />
          <Box component="span" sx={{ mt: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
            {index + 1}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
