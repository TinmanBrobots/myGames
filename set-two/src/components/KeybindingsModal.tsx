'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Exactly 5 keys per row per player.
// The 5th key in each row (index 4) is used only when a 15th card is added.
const P1_ROWS = [
  ['Q','W','E','R','T'],
  ['A','S','D','F','G'],
  ['Z','X','C','V','B'],
];

const P2_ROWS = [
  ['U','I','O','P','['],
  ['J','K','L',';',"'"],
  ['M',',','.','/','⇧'],
];

const ACTION_KEYS: { label: string; action: string }[] = [
  { label: 'Esc', action: 'New Game' },
  { label: '→',   action: 'Reveal Set' },
  { label: '\\',  action: 'Add Cards' },
  { label: 'Del', action: 'Pause' },
];

function Key({
  label,
  color,
  dim = false,
}: {
  label: string;
  color: string;   // tailwind bg class
  dim?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded font-mono font-bold text-xs w-8 h-8 ${color} transition-opacity`}
      style={{ opacity: dim ? 0.35 : 1 }}
    >
      {label}
    </span>
  );
}

function NeutralKey({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center justify-center rounded font-mono font-bold text-xs px-2 h-8 bg-secondary text-secondary-foreground min-w-8">
      {label}
    </span>
  );
}

interface KeybindingsModalProps {
  open: boolean;
  onStart: () => void;
}

export function KeybindingsModal({ open, onStart }: KeybindingsModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-lg"
        showCloseButton={false}
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">Local 2-Player Controls</DialogTitle>
          <DialogDescription>
            Keys map left-to-right, top-to-bottom across the board.
            Faded keys activate only when a 5th column is added.
          </DialogDescription>
        </DialogHeader>

        {/* Legend */}
        <div className="flex gap-6 justify-center text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[var(--color-p1)] inline-block" />
            Player 1
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[var(--color-p2)] inline-block" />
            Player 2
          </div>
        </div>

        {/* Keyboard diagram — two zones side by side */}
        <div className="flex gap-4 justify-center bg-muted rounded-xl p-4">
          {/* P1 zone */}
          <div className="flex flex-col gap-1">
            {P1_ROWS.map((row, r) => (
              <div key={r} className="flex gap-1">
                {row.map((k, c) => (
                  <Key
                    key={c}
                    label={k}
                    color="bg-[var(--color-p1)] text-black"
                    dim={c === 4}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="w-px bg-border self-stretch" />

          {/* P2 zone */}
          <div className="flex flex-col gap-1">
            {P2_ROWS.map((row, r) => (
              <div key={r} className="flex gap-1">
                {row.map((k, c) => (
                  <Key
                    key={c}
                    label={k}
                    color="bg-[var(--color-p2)] text-white"
                    dim={c === 4}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Action keys */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-muted-foreground">
          {ACTION_KEYS.map(({ label, action }) => (
            <div key={label} className="flex items-center gap-2">
              <NeutralKey label={label} />
              <span>{action}</span>
            </div>
          ))}
        </div>

        <Button onClick={onStart} className="w-full" size="lg">
          Start Game
        </Button>
      </DialogContent>
    </Dialog>
  );
}
