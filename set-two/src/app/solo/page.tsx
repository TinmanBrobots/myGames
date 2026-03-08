'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Board } from '@/components/Board';
import { ScoreBoard } from '@/components/ScoreBoard';
import { Controls } from '@/components/Controls';
import { FoundSetsList } from '@/components/FoundSetsList';
import { GameOverDialog } from '@/components/GameOverDialog';
import { useKeyBindings } from '@/components/hooks/useKeyBindings';

export default function SoloPage() {
  const {
    state,
    players,
    hintIndices,
    newGame,
    selectCard,
    addCards,
    togglePause: togglePauseAction,
    revealHint,
    hideHint,
  } = useGameStore();

  const playerNames = useMemo(
    () => Object.fromEntries(players.map(p => [p.id, p.name])),
    [players]
  );

  const cardsOnBoard = state.board.filter(c => c !== null).length;
  const deckEmpty = state.deckCursor >= state.deck.length;
  const canAddCards = !deckEmpty && cardsOnBoard < 21;

  const handleRevealHint = () => {
    hintIndices ? hideHint() : revealHint();
  };

  useKeyBindings({
    onSelectCard: selectCard,
    onNewGame: newGame,
    onRevealHint: handleRevealHint,
    onAddCards: addCards,
    onTogglePause: togglePauseAction,
    boardSize: state.board.length,
  });

  const totalTime = Math.floor((Date.now() - state.startedAt) / 1000);

  return (
    <main className="flex flex-col items-center gap-4 p-6 min-h-screen">
      <h1 className="text-3xl font-bold tracking-tight">SET</h1>

      <div className="flex gap-4 items-start">
        {/* Left: stats */}
        <ScoreBoard state={state} players={players} />

        {/* Center: board + controls */}
        <div className="flex flex-col gap-4 items-center">
          <Board
            board={state.board}
            selections={state.selections}
            hintIndices={hintIndices}
            onCardClick={selectCard}
            isPaused={state.phase === 'paused'}
          />
          <Controls
            phase={state.phase}
            canAddCards={canAddCards}
            hintActive={hintIndices !== null}
            onNewGame={newGame}
            onRevealHint={handleRevealHint}
            onAddCards={addCards}
            onTogglePause={togglePauseAction}
          />
        </div>

        {/* Right: found sets log */}
        <FoundSetsList
          foundSets={state.foundSets}
          playerNames={playerNames}
          showPlayerNames={false}
        />
      </div>

      <GameOverDialog
        open={state.phase === 'over'}
        foundSets={state.foundSets}
        players={players}
        totalTime={totalTime}
        onNewGame={newGame}
      />
    </main>
  );
}
