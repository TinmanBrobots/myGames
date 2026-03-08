'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type FoundSet, type Player } from '@/lib/types';

// Must match globals.css --color-p1 / --color-p2
const PLAYER_HEX: Record<string, string> = {
  p1: '#ff9a3c',
  p2: '#ff4040',
  p3: '#4ecdc4',
  p4: '#a78bfa',
};

function launchConfetti(color: string) {
  const opts = (x: number, angle: number): confetti.Options => ({
    particleCount: 90,
    angle,
    spread: 60,
    origin: { x, y: 0.65 },
    colors: [color, '#ffffff', color],
    scalar: 1.1,
  });
  confetti(opts(0, 60));
  confetti(opts(1, 120));
}

interface GameOverDialogProps {
  open: boolean;
  foundSets: FoundSet[];
  players: Player[];
  totalTime: number;
  onNewGame: () => void;
  onClose: () => void;
}

export function GameOverDialog({
  open,
  foundSets,
  players,
  totalTime,
  onNewGame,
  onClose,
}: GameOverDialogProps) {
  const scores = Object.fromEntries(players.map(p => [p.id, 0]));
  for (const fs of foundSets) {
    if (fs.playerId in scores) scores[fs.playerId]++;
  }

  // Determine winner (2-player only)
  const isMultiplayer = players.length > 1;
  const maxScore = Math.max(...Object.values(scores));
  const winners = players.filter(p => scores[p.id] === maxScore);
  const isTie = winners.length > 1;
  const winner = isTie ? null : winners[0];

  // Fire confetti when the dialog opens
  useEffect(() => {
    if (!open) return;
    const color = winner ? (PLAYER_HEX[winner.id] ?? '#ffffff') : '#ffd700';
    const timer = setTimeout(() => launchConfetti(color), 150);
    return () => clearTimeout(timer);
  }, [open, winner]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const title = isMultiplayer
    ? isTie
      ? "It's a Tie!"
      : `${winner!.name} Wins!`
    : 'Game Over';

  const winnerColor = winner ? PLAYER_HEX[winner.id] : undefined;

  return (
    <Dialog open={open} onOpenChange={isOpen => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader>
          <DialogTitle
            className="text-2xl"
            style={winnerColor ? { color: winnerColor } : undefined}
          >
            {title}
          </DialogTitle>
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
