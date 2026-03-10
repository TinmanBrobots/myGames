'use client';

import Image from 'next/image';
import { type CardId } from '@/lib/types';
import { parseCard, cardImagePath } from '@/lib/deck';
import { cn } from '@/lib/utils';

const PLAYER_COLORS: Record<string, string> = {
  p1: 'var(--color-p1)',
  p2: 'var(--color-p2)',
  p3: 'var(--color-p3)',
  p4: 'var(--color-p4)',
};

export interface CornerPip {
  /** 0=top-left  1=top-right  2=bottom-left  3=bottom-right */
  position: 0 | 1 | 2 | 3;
  color: string; // CSS color value
}

const CORNER_PIP_STYLES: Record<0 | 1 | 2 | 3, React.CSSProperties> = {
  0: { top: 4, left: 4 },
  1: { top: 4, right: 4 },
  2: { bottom: 4, left: 4 },
  3: { bottom: 4, right: 4 },
};

interface GameCardProps {
  cardId: CardId;
  boardIndex: number;
  /** Color keys for ring rendering (local mode: up to 2; online mode: 0 or 1). */
  selectedBy: string[];
  /** Small corner dots showing other online players' selections. */
  cornerPips?: CornerPip[];
  isHinted: boolean;
  onClick: (boardIndex: number) => void;
  size?: 'normal' | 'small';
  disabled?: boolean;
}

function selectionStyle(selectedBy: string[]): React.CSSProperties {
  if (selectedBy.length === 0) return {};

  if (selectedBy.length === 1) {
    const color = PLAYER_COLORS[selectedBy[0]] ?? 'currentColor';
    return { boxShadow: `0 0 0 4px ${color}` };
  }

  // Two players selected the same card:
  // inner solid ring = first selector's color, outer dashed outline = second selector's color.
  const inner = PLAYER_COLORS[selectedBy[0]] ?? 'currentColor';
  const outer = PLAYER_COLORS[selectedBy[1]] ?? 'currentColor';
  return {
    boxShadow: `0 0 0 4px ${inner}`,
    outline: `3px dashed ${outer}`,
    outlineOffset: '4px',
  };
}

export function GameCard({
  cardId,
  boardIndex,
  selectedBy,
  cornerPips,
  isHinted,
  onClick,
  size = 'normal',
  disabled = false,
}: GameCardProps) {
  const card = parseCard(cardId);
  const imgSrc = cardImagePath(card);
  const count = card.count + 1;

  const isSelected = selectedBy.length > 0;

  const imgStyle: React.CSSProperties = {
    height: '75%',
    width: 'auto',
    pointerEvents: 'none',
  };

  return (
    <button
      onClick={() => onClick(boardIndex)}
      style={selectionStyle(selectedBy)}
      className={cn(
        'relative flex flex-row items-center justify-center rounded-xl bg-white border border-gray-300',
        'transition-[box-shadow,outline,background-color] duration-75',
        'cursor-pointer select-none',
        size === 'normal' && 'w-36 h-24 px-2 gap-1.5',
        size === 'small' && 'w-18 h-12 px-1 gap-1',
        isHinted && !isSelected && 'ring-4 ring-[var(--color-accent)] bg-teal-50',
        'hover:brightness-95 active:scale-[0.97] active:duration-[30ms]'
      )}
      aria-label={`Card ${boardIndex}`}
      aria-pressed={isSelected}
      disabled={disabled}
    >
      {Array.from({ length: count }, (_, i) => (
        <Image
          key={i}
          src={imgSrc}
          alt=""
          width={0}
          height={0}
          sizes="10vw"
          style={imgStyle}
        />
      ))}

      {/* Corner pips: other players' selections in online mode */}
      {cornerPips?.map(({ position, color }) => (
        <span
          key={position}
          className="absolute w-2.5 h-2.5 rounded-full pointer-events-none"
          style={{ ...CORNER_PIP_STYLES[position], backgroundColor: color }}
        />
      ))}
    </button>
  );
}
