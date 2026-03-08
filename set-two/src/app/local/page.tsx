'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLocalTwoPlayerStore } from '@/store/localTwoPlayerStore';
import { Board } from '@/components/Board';
import { Controls } from '@/components/Controls';
import { ScoreBoard } from '@/components/ScoreBoard';
import { PlayerPanel } from '@/components/PlayerPanel';
import { GameOverDialog } from '@/components/GameOverDialog';
import { KeybindingsModal } from '@/components/KeybindingsModal';
import { useTwoPlayerKeyBindings } from '@/components/hooks/useTwoPlayerKeyBindings';
import { Button } from '@/components/ui/button';

export default function LocalTwoPlayerPage() {
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
  } = useLocalTwoPlayerStore();

  const [modalOpen, setModalOpen] = useState(true);
  const [gameOverDismissed, setGameOverDismissed] = useState(false);
  useEffect(() => {
    if (state.phase === 'playing') setGameOverDismissed(false);
  }, [state.phase]);

  const handleStart = useCallback(() => {
    newGame();
    setModalOpen(false);
  }, [newGame]);

  const handleNewGame = useCallback(() => {
    newGame();
  }, [newGame]);

  const cardsOnBoard = state.board.filter(c => c !== null).length;
  const deckEmpty = state.deckCursor >= state.deck.length;
  const canAddCards = !deckEmpty && cardsOnBoard < 15;

  const handleRevealHint = useCallback(
    () => (hintIndices ? hideHint() : revealHint()),
    [hintIndices, hideHint, revealHint]
  );

  const handleSelectCard = useCallback(
    (boardIndex: number, playerId: 'p1' | 'p2') => selectCard(boardIndex, playerId),
    [selectCard]
  );

  useTwoPlayerKeyBindings({
    onSelectCard: handleSelectCard,
    onNewGame: handleNewGame,
    onRevealHint: handleRevealHint,
    onAddCards: addCards,
    onTogglePause: togglePauseAction,
    boardSize: state.board.length,
    canAddCards,
  });

  const totalTime = Math.floor((Date.now() - state.startedAt) / 1000);

  return (
    <main className="flex flex-col items-center gap-4 p-6 min-h-screen">
      <div className="flex items-center gap-4 self-start">
        <Link href="/"><Button variant="ghost" size="sm">← Home</Button></Link>
        <h1 className="text-3xl font-bold tracking-tight">SET — Local 2-Player</h1>
      </div>

      <div className="flex gap-4 items-start">
        <PlayerPanel
          player={players[0]}
          foundSets={state.foundSets}
          selectionCount={state.selections['p1']?.length ?? 0}
        />

        <div className="flex flex-col gap-4 items-center">
          <ScoreBoard state={state} players={players} showPlayerScores={false} />
          <Board
            board={state.board}
            selections={state.selections}
            hintIndices={hintIndices}
            onCardClick={() => {}}
            isPaused={state.phase === 'paused'}
          />
          <Controls
            phase={state.phase}
            canAddCards={canAddCards}
            hintActive={hintIndices !== null}
            onNewGame={handleNewGame}
            onRevealHint={handleRevealHint}
            onAddCards={addCards}
            onTogglePause={togglePauseAction}
          />
        </div>

        <PlayerPanel
          player={players[1]}
          foundSets={state.foundSets}
          selectionCount={state.selections['p2']?.length ?? 0}
        />
      </div>

      <KeybindingsModal open={modalOpen} onStart={handleStart} />

      <GameOverDialog
        open={state.phase === 'over' && !gameOverDismissed}
        foundSets={state.foundSets}
        players={players}
        totalTime={totalTime}
        onNewGame={handleNewGame}
        onClose={() => setGameOverDismissed(true)}
      />
    </main>
  );
}
