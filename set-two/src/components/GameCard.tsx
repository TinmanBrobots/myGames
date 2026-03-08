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

interface GameCardProps {
  cardId: CardId;
  boardIndex: number;
  /** Array of player IDs who have selected this card (0, 1, or 2 entries). */
  selectedBy: string[];
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
        'flex flex-row items-center justify-center rounded-xl bg-white border border-gray-300',
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
    </button>
  );
}
