'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type GamePhase } from '@/lib/types';

interface ControlsProps {
  phase: GamePhase;
  canAddCards: boolean;
  hintActive: boolean;
  onNewGame: () => void;
  onRevealHint: () => void;
  onAddCards: () => void;
  onTogglePause: () => void;
}

function KeyHint({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1 text-xs text-muted-foreground font-mono opacity-70">
      [{children}]
    </span>
  );
}

function ControlButton({
  label,
  keyHint,
  onClick,
  disabled,
  highlighted,
}: {
  label: string;
  keyHint: string;
  onClick: () => void;
  disabled?: boolean;
  highlighted?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          disabled={disabled}
          variant={highlighted ? 'outline' : 'secondary'}
          className="flex flex-col h-14 w-32 text-xs leading-tight"
        >
          <span>{label}</span>
          <KeyHint>{keyHint}</KeyHint>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Keyboard: {keyHint}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function Controls({
  phase,
  canAddCards,
  hintActive,
  onNewGame,
  onRevealHint,
  onAddCards,
  onTogglePause,
}: ControlsProps) {
  const isOver = phase === 'over';
  const isPaused = phase === 'paused';

  return (
    <div className="flex flex-wrap gap-2">
      <ControlButton
        label="New Game"
        keyHint="Esc"
        onClick={onNewGame}
        highlighted={isOver}
      />
      <ControlButton
        label={hintActive ? 'Hide Hint' : 'Reveal Set'}
        keyHint="→"
        onClick={onRevealHint}
        disabled={isPaused || isOver}
      />
      <ControlButton
        label="Add 3 Cards"
        keyHint="\"
        onClick={onAddCards}
        disabled={!canAddCards || isPaused || isOver}
        highlighted={!canAddCards && !isPaused && !isOver ? false : false}
      />
      <ControlButton
        label={isPaused ? 'Resume' : 'Pause'}
        keyHint="Del"
        onClick={onTogglePause}
        disabled={isOver}
      />
    </div>
  );
}
