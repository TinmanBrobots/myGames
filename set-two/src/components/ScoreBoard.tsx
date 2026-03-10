'use client';

import { useEffect, useState } from 'react';
import { type GameState, type Player } from '@/lib/types';
import { countSets } from '@/lib/validator';

interface ScoreBoardProps {
  state: GameState;
  players: Player[];
  showPlayerScores?: boolean;
  /** Render stats in a single horizontal row instead of a vertical stack. */
  horizontal?: boolean;
}

export function ScoreBoard({ state, players, showPlayerScores = true, horizontal = false }: ScoreBoardProps) {
  const [elapsed, setElapsed] = useState(0);
  const [sinceLastSet, setSinceLastSet] = useState(0);

  useEffect(() => {
    if (state.phase !== 'playing') return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - state.startedAt) / 1000));
      setSinceLastSet(Math.floor((Date.now() - state.lastSetAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [state.phase, state.startedAt, state.lastSetAt]);

  const cardsInDeck = state.deck.length - state.deckCursor;
  const setsOnBoard = state.phase !== 'paused' ? countSets(state.board) : '—';

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  if (horizontal) {
    return (
      <div className="flex items-center gap-6 rounded-2xl bg-card border border-border px-6 py-3 text-center">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Deck</p>
          <p className="text-xl font-semibold">{cardsInDeck}</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Time</p>
          <p className="text-xl font-semibold">{formatTime(elapsed)}</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">This set</p>
          <p className="text-xl font-semibold">{formatTime(sinceLastSet)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card border border-border p-4 min-w-[120px] text-center">
      {showPlayerScores && players.map((p) => {
        const found = state.foundSets.filter(s => s.playerId === p.id).length;
        return (
          <div key={p.id}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{p.name}</p>
            <p className="text-2xl font-bold">{found}</p>
            <p className="text-xs text-muted-foreground">sets found</p>
          </div>
        );
      })}

      {showPlayerScores && <hr className="border-border" />}

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Deck</p>
        <p className="text-xl font-semibold">{cardsInDeck}</p>
      </div>

      <hr className="border-border" />

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Time</p>
        <p className="text-xl font-semibold">{formatTime(elapsed)}</p>
      </div>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">This set</p>
        <p className="text-xl font-semibold">{formatTime(sinceLastSet)}</p>
      </div>
    </div>
  );
}
