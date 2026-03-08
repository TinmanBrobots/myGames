'use client';

import Image from 'next/image';
import { type CardId } from '@/lib/types';
import { parseCard, cardImagePath } from '@/lib/deck';
import { cn } from '@/lib/utils';

const PLAYER_RING_COLORS: Record<string, string> = {
  p1: 'ring-[var(--color-p1)]',
  p2: 'ring-[var(--color-p2)]',
  p3: 'ring-[var(--color-p3)]',
  p4: 'ring-[var(--color-p4)]',
};

interface GameCardProps {
  cardId: CardId;
  boardIndex: number;
  selectedBy: string | null; // player id, or null
  isHinted: boolean;
  onClick: (boardIndex: number) => void;
  size?: 'normal' | 'small';
}

export function GameCard({
  cardId,
  boardIndex,
  selectedBy,
  isHinted,
  onClick,
  size = 'normal',
}: GameCardProps) {
  const card = parseCard(cardId);
  const imgSrc = cardImagePath(card);
  const count = card.count + 1; // 1, 2, or 3 figures

  const isSelected = selectedBy !== null;
  const ringColor = selectedBy ? PLAYER_RING_COLORS[selectedBy] : '';

  return (
    <button
      onClick={() => onClick(boardIndex)}
      className={cn(
        'flex flex-row items-center justify-center rounded-xl bg-white border border-gray-300 transition-all duration-150 cursor-pointer select-none',
        size === 'normal' && 'w-36 h-24',
        size === 'small' && 'w-16 h-11',
        isSelected && ['ring-4', ringColor, 'scale-95'],
        isHinted && !isSelected && 'ring-4 ring-[var(--color-accent)] bg-teal-50',
        'hover:brightness-95 active:scale-90'
      )}
      aria-label={`Card ${boardIndex}`}
      aria-pressed={isSelected}
    >
      {Array.from({ length: count }, (_, i) => (
        <Image
          key={i}
          src={imgSrc}
          alt=""
          width={size === 'normal' ? 44 : 20}
          height={size === 'normal' ? 28 : 13}
          className={cn(
            'object-contain',
            size === 'normal' && 'mx-0.5',
            size === 'small' && 'mx-px'
          )}
        />
      ))}
    </button>
  );
}
