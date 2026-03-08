'use client';

import { type FoundSet } from '@/lib/types';
import { parseCard, cardImagePath } from '@/lib/deck';
import { GameCard } from './GameCard';

const PLAYER_LABEL_COLORS: Record<string, string> = {
  p1: 'text-[var(--color-p1)]',
  p2: 'text-[var(--color-p2)]',
  p3: 'text-[var(--color-p3)]',
  p4: 'text-[var(--color-p4)]',
};

interface FoundSetsListProps {
  foundSets: FoundSet[];
  playerNames: Record<string, string>; // playerId → name
  showPlayerNames: boolean;
}

export function FoundSetsList({ foundSets, playerNames, showPlayerNames }: FoundSetsListProps) {
  if (foundSets.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
      {[...foundSets].reverse().map((fs, i) => {
        const labelColor = PLAYER_LABEL_COLORS[fs.playerId] ?? 'text-foreground';
        return (
          <div
            key={i}
            className="flex items-center gap-2 rounded-xl bg-card border border-border p-2"
          >
            <div className="flex gap-1">
              {fs.cardIds.map((id, j) => (
                <GameCard
                  key={j}
                  cardId={id}
                  boardIndex={-1}
                  selectedBy={null}
                  isHinted={false}
                  onClick={() => {}}
                  size="small"
                />
              ))}
            </div>
            <div className="flex flex-col text-xs ml-1">
              {showPlayerNames && (
                <span className={`font-semibold ${labelColor}`}>
                  {playerNames[fs.playerId] ?? fs.playerId}
                </span>
              )}
              <span className="text-muted-foreground">{fs.elapsedSeconds}s</span>
              <span className="text-muted-foreground">{fs.setsOnBoard} sets</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
