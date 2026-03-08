'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type FoundSet, type Player } from '@/lib/types';

interface GameOverDialogProps {
  open: boolean;
  foundSets: FoundSet[];
  players: Player[];
  totalTime: number;
  onNewGame: () => void;
}

export function GameOverDialog({
  open,
  foundSets,
  players,
  totalTime,
  onNewGame,
}: GameOverDialogProps) {
  const scores = Object.fromEntries(players.map(p => [p.id, 0]));
  for (const fs of foundSets) {
    if (fs.playerId in scores) scores[fs.playerId]++;
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-sm text-center" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Game Over</DialogTitle>
          <DialogDescription>All sets found!</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {players.map(p => (
            <div key={p.id} className="flex justify-between text-sm">
              <span className="font-medium">{p.name}</span>
              <span className="text-muted-foreground">{scores[p.id]} sets</span>
            </div>
          ))}
          <hr className="border-border" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total time</span>
            <span className="font-semibold">{formatTime(totalTime)}</span>
          </div>
        </div>

        <Button onClick={onNewGame} className="w-full">
          Play Again
        </Button>
      </DialogContent>
    </Dialog>
  );
}
