'use client';

import { type CardId } from '@/lib/types';
import { GameCard } from './GameCard';

interface BoardProps {
  board: (CardId | null)[];
  selections: Record<string, number[]>;
  hintIndices: [number, number, number] | null;
  onCardClick: (boardIndex: number) => void;
  isPaused: boolean;
}

export function Board({ board, selections, hintIndices, onCardClick, isPaused }: BoardProps) {
  // Build a reverse lookup: boardIndex → ordered list of player IDs who selected it.
  // Ordered so the first selector is the inner ring, second is the outer dashed ring.
  const selectedByPlayers: Record<number, string[]> = {};
  for (const [playerId, indices] of Object.entries(selections)) {
    for (const i of indices) {
      if (!selectedByPlayers[i]) selectedByPlayers[i] = [];
      selectedByPlayers[i].push(playerId);
    }
  }

  const columns = Math.ceil(board.length / 3);

  if (isPaused) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-card border border-border"
        style={{ width: columns * 152, height: 3 * 104 }}
      >
        <p className="text-2xl font-semibold text-muted-foreground tracking-wide">PAUSED</p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${columns}, 9rem)`,
        gridTemplateRows: 'repeat(3, 6rem)',
      }}
    >
      {board.map((cardId, index) =>
        cardId !== null ? (
          <GameCard
            key={`${index}-${cardId}`}
            cardId={cardId}
            boardIndex={index}
            selectedBy={selectedByPlayers[index] ?? []}
            isHinted={hintIndices?.includes(index) ?? false}
            onClick={onCardClick}
          />
        ) : (
          <div key={index} className="w-36 h-24 rounded-xl border border-dashed border-border opacity-30" />
        )
      )}
    </div>
  );
}
