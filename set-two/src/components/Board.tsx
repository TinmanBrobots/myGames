'use client';

import { type CardId } from '@/lib/types';
import { GameCard, type CornerPip } from './GameCard';

// Position (0-3) assigned to each color key for corner pip placement.
// Matches player panel layout: p1=top-left, p2=top-right, p3=bottom-left, p4=bottom-right.
const COLOR_PIP_POSITION: Record<string, 0 | 1 | 2 | 3> = {
  p1: 0, p2: 1, p3: 2, p4: 3,
};

interface BoardProps {
  board: (CardId | null)[];
  selections: Record<string, number[]>;
  hintIndices: [number, number, number] | null;
  onCardClick: (boardIndex: number) => void;
  isPaused: boolean;
  /** Maps arbitrary player IDs → color keys ('p1'|'p2'|'p3'|'p4'). Used in online mode. */
  playerColorMap?: Record<string, string>;
  /**
   * Online mode: the current player's color key ('p1'…'p4').
   * When set, only this player's selection shows as a ring; all others become corner pips.
   * When absent (local mode), all selections render as rings (dual-ring for 2 players).
   */
  myColorKey?: string;
}

export function Board({
  board,
  selections,
  hintIndices,
  onCardClick,
  isPaused,
  playerColorMap,
  myColorKey,
}: BoardProps) {
  // Build per-card data: ring selectors and corner pips.
  const ringsByIndex: Record<number, string[]> = {};
  const pipsByIndex: Record<number, CornerPip[]> = {};

  for (const [playerId, indices] of Object.entries(selections)) {
    const colorKey = playerColorMap?.[playerId] ?? playerId;

    for (const i of indices) {
      if (myColorKey !== undefined) {
        // Online mode: ring only for me, corner pip for everyone else.
        if (colorKey === myColorKey) {
          if (!ringsByIndex[i]) ringsByIndex[i] = [];
          ringsByIndex[i].push(colorKey);
        } else {
          const position = COLOR_PIP_POSITION[colorKey] ?? 0;
          if (!pipsByIndex[i]) pipsByIndex[i] = [];
          pipsByIndex[i].push({ position, color: `var(--color-${colorKey})` });
        }
      } else {
        // Local mode: all selections render as rings (dual-ring for 2 players).
        if (!ringsByIndex[i]) ringsByIndex[i] = [];
        ringsByIndex[i].push(colorKey);
      }
    }
  }

  const columns = Math.ceil(board.length / 3);

  if (isPaused) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-card border border-border"
        style={{
          width: `calc(${columns} * var(--board-card-w) + ${columns - 1} * 0.5rem)`,
          height: `calc(3 * var(--board-card-h) + 2 * 0.5rem)`,
        }}
      >
        <p className="text-2xl font-semibold text-muted-foreground tracking-wide">PAUSED</p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-2 p-1.5"
      style={{
        gridTemplateColumns: `repeat(${columns}, var(--board-card-w))`,
        gridTemplateRows: 'repeat(3, var(--board-card-h))',
      }}
    >
      {board.map((cardId, index) =>
        cardId !== null ? (
          <GameCard
            key={`${index}-${cardId}`}
            cardId={cardId}
            boardIndex={index}
            selectedBy={ringsByIndex[index] ?? []}
            cornerPips={pipsByIndex[index]}
            isHinted={hintIndices?.includes(index) ?? false}
            onClick={onCardClick}
          />
        ) : (
          <div
            key={index}
            className="rounded-xl border border-dashed border-border opacity-30"
            style={{ width: 'var(--board-card-w)', height: 'var(--board-card-h)' }}
          />
        )
      )}
    </div>
  );
}
