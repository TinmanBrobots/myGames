'use client';

import { type FoundSet, type Player } from '@/lib/types';
import { GameCard } from './GameCard';

const PLAYER_STYLES: Record<string, { border: string; label: string }> = {
  p1: { border: 'border-[var(--color-p1)]', label: 'text-[var(--color-p1)]' },
  p2: { border: 'border-[var(--color-p2)]', label: 'text-[var(--color-p2)]' },
  p3: { border: 'border-[var(--color-p3)]', label: 'text-[var(--color-p3)]' },
  p4: { border: 'border-[var(--color-p4)]', label: 'text-[var(--color-p4)]' },
};

interface PlayerPanelProps {
  player: Player;
  foundSets: FoundSet[];
  selectionCount: number;
  /** Override color index (0-3) for online mode where player.id is a UUID. */
  colorIndex?: number;
  /** Show a "(you)" badge — used in online mode. */
  isMe?: boolean;
  /** Dim panel when player is disconnected. */
  dimmed?: boolean;
}

export function PlayerPanel({ player, foundSets, selectionCount, colorIndex, isMe, dimmed }: PlayerPanelProps) {
  const colorKey = colorIndex !== undefined ? `p${colorIndex + 1}` : player.id;
  const style = PLAYER_STYLES[colorKey] ?? PLAYER_STYLES['p1'];
  const playerFoundSets = foundSets.filter(fs => fs.playerId === player.id);

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl bg-card border-2 ${style.border} p-4 w-60 transition-opacity`}
      style={{ opacity: dimmed ? 0.4 : 1 }}
    >
      <div className="text-center">
        <p className={`text-lg font-bold ${style.label}`}>
          {player.name}
          {isMe && <span className="text-xs font-normal text-muted-foreground ml-1">(you)</span>}
        </p>
        <p className="text-4xl font-black">{playerFoundSets.length}</p>
        {/* <p className="text-xs text-muted-foreground">sets found</p> */}
      </div>

      {/* {selectionCount > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {selectionCount} / 3 selected
        </p>
      )} */}

      <hr className="border-border" />

      {/* Found sets log, newest first */}
      {/* hide scrollbar */}
      <div className="flex flex-col gap-2 overflow-y-auto max-h-56 [scrollbar-width:none]">
        {playerFoundSets.length === 0 && (
          <p className="text-xs text-muted-foreground text-center italic">No sets yet</p>
        )}
        {[...playerFoundSets].reverse().map((fs, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <div className="flex gap-1 justify-center">
              {fs.cardIds.map((id, j) => (
                <GameCard
                  key={j}
                  cardId={id}
                  boardIndex={-1}
                  selectedBy={[]}
                  isHinted={false}
                  onClick={() => {}}
                  size="small"
                  disabled
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">{fs.elapsedSeconds}s</p>
          </div>
        ))}
      </div>
    </div>
  );
}
