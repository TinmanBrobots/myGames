'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Copy, Check } from 'lucide-react';
import {
  useOnlineStore,
  getStoredPlayerName,
  storePlayerName,
} from '@/store/onlineStore';
import { Lobby } from '@/components/Lobby';
import { Board } from '@/components/Board';
import { PlayerPanel } from '@/components/PlayerPanel';
import { ScoreBoard } from '@/components/ScoreBoard';
import { GameOverDialog } from '@/components/GameOverDialog';
import { useKeyBindings } from '@/components/hooks/useKeyBindings';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Player } from '@/lib/types';

export default function OnlineRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const {
    socket,
    room,
    sessionToken,
    wasRemoved,
    connect,
    joinRoom,
    leaveRoom,
    stepAway,
    startGame,
    selectCard,
    restartGame,
    kickPlayer,
    clearWasRemoved,
  } = useOnlineStore();

  const [playerName, setPlayerName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [gameOverDismissed, setGameOverDismissed] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // Connect socket on mount
  useEffect(() => { connect(); }, [connect]);

  // Auto-join with stored name (covers direct link + page refresh)
  useEffect(() => {
    if (!socket || hasJoined) return;
    const stored = getStoredPlayerName();
    if (stored) {
      setPlayerName(stored);
      joinRoom(roomId, stored);
      setHasJoined(true);
    }
  }, [socket, hasJoined, joinRoom, roomId]);

  // Rejoin on socket reconnect (e.g. after a tab sleep / network blip)
  useEffect(() => {
    if (!socket) return;
    const handleReconnect = () => {
      const name = getStoredPlayerName();
      if (name) joinRoom(roomId, name);
    };
    socket.on('connect', handleReconnect);
    return () => { socket.off('connect', handleReconnect); };
  }, [socket, joinRoom, roomId]);

  // Navigate home when kicked
  useEffect(() => {
    if (wasRemoved) {
      clearWasRemoved();
      router.push('/');
    }
  }, [wasRemoved, clearWasRemoved, router]);

  // Reset game-over dismissal on new game
  useEffect(() => {
    if (room?.phase === 'playing') setGameOverDismissed(false);
  }, [room?.phase]);

  const handleJoin = () => {
    if (!playerName.trim()) return;
    storePlayerName(playerName.trim());
    joinRoom(roomId, playerName.trim());
    setHasJoined(true);
  };

  const handleLeaveRoom = useCallback(() => {
    setShowLeaveDialog(false);
    leaveRoom();
    router.push('/');
  }, [leaveRoom, router]);

  const handleStepAway = useCallback(() => {
    setShowLeaveDialog(false);
    stepAway();
    router.push('/');
  }, [stepAway, router]);

  const handleRestartGame = useCallback(() => {
    restartGame();
    setGameOverDismissed(false);
  }, [restartGame]);

  const copyRoomUrl = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  // Keybindings — card selection only in online mode
  useKeyBindings({
    onSelectCard: selectCard,
    onNewGame: () => {},
    onRevealHint: () => {},
    onAddCards: () => {},
    onTogglePause: () => {},
    boardSize: room?.gameState?.board.length ?? 12,
  });

  // ── Name prompt (first visit via shared link) ──────────────────────────────
  if (!room || !hasJoined) {
    return (
      <main className="flex flex-col items-center justify-center gap-6 p-6">
        <div className="flex items-center gap-4 self-start">
          <Link href="/"><Button variant="ghost" size="sm">← Home</Button></Link>
          <h1 className="text-3xl font-bold">
            Join Room{' '}
            <span className="font-mono text-muted-foreground">{roomId}</span>
          </h1>
        </div>

        <div className="flex flex-col gap-3 w-64">
          <input
            className="border border-border rounded px-3 py-2 text-sm bg-background"
            placeholder="Your name"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            autoFocus
            maxLength={20}
          />
          <Button onClick={handleJoin} disabled={!playerName.trim() || !socket?.connected}>
            Join Game
          </Button>
        </div>
      </main>
    );
  }

  // ── Lobby ──────────────────────────────────────────────────────────────────
  if (room.phase === 'lobby') {
    return (
      <Lobby
        room={room}
        sessionToken={sessionToken}
        onStart={startGame}
        onLeave={handleLeaveRoom}
        onKick={kickPlayer}
      />
    );
  }

  // ── Game (playing or over) ─────────────────────────────────────────────────
  const { gameState } = room;
  if (!gameState) return null;

  // Map sessionToken → color key ('p1'…'p4') by position in players array
  const playerColorMap: Record<string, string> = Object.fromEntries(
    room.players.map((p, i) => [p.sessionToken, `p${i + 1}`])
  );

  // Build Player[] for components that need it
  const players: Player[] = room.players.map(p => ({
    id: p.sessionToken,
    name: p.name,
    score: gameState.foundSets.filter(fs => fs.playerId === p.sessionToken).length,
  }));

  const totalTime = Math.floor((Date.now() - gameState.startedAt) / 1000);

  // Split players for left/right panels
  const leftPlayers  = room.players.filter((_, i) => i % 2 === 0);
  const rightPlayers = room.players.filter((_, i) => i % 2 === 1);

  return (
    <main className="flex flex-col items-center gap-4 p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 self-start">
        <Button variant="ghost" size="sm" onClick={() => setShowLeaveDialog(true)}>← Home</Button>
        <h1 className="text-3xl font-bold tracking-tight">SET — Online</h1>
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-muted-foreground font-mono text-sm">Room: {room.id}</span>
          <button
            onClick={copyRoomUrl}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
            title="Copy room link"
          >
            {urlCopied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        {/* Left column: players 0, 2 */}
        {leftPlayers.length > 0 && (
          <div className="flex flex-col gap-4">
            {leftPlayers.map(p => {
              const globalIndex = room.players.indexOf(p);
              return (
                <PlayerPanel
                  key={p.sessionToken}
                  player={players[globalIndex]}
                  foundSets={gameState.foundSets}
                  selectionCount={gameState.selections[p.sessionToken]?.length ?? 0}
                  colorIndex={globalIndex}
                  isMe={p.sessionToken === sessionToken}
                  dimmed={!p.connected}
                />
              );
            })}
          </div>
        )}

        {/* Board + stats */}
        <div className="flex flex-col gap-4 items-center">
          <ScoreBoard state={gameState} players={players} horizontal />
          <Board
            board={gameState.board}
            selections={gameState.selections}
            hintIndices={null}
            onCardClick={selectCard}
            isPaused={false}
            playerColorMap={playerColorMap}
            myColorKey={playerColorMap[sessionToken]}
          />
        </div>

        {/* Right column: players 1, 3 */}
        {rightPlayers.length > 0 && (
          <div className="flex flex-col gap-4">
            {rightPlayers.map(p => {
              const globalIndex = room.players.indexOf(p);
              return (
                <PlayerPanel
                  key={p.sessionToken}
                  player={players[globalIndex]}
                  foundSets={gameState.foundSets}
                  selectionCount={gameState.selections[p.sessionToken]?.length ?? 0}
                  colorIndex={globalIndex}
                  isMe={p.sessionToken === sessionToken}
                  dimmed={!p.connected}
                />
              );
            })}
          </div>
        )}
      </div>

      <GameOverDialog
        open={room.phase === 'over' && !gameOverDismissed}
        foundSets={gameState.foundSets}
        players={players}
        totalTime={totalTime}
        onNewGame={handleRestartGame}
        onClose={handleRestartGame}
        playerColorMap={playerColorMap}
      />

      {/* Leave game dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent showCloseButton={false} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Leave game?</DialogTitle>
            <DialogDescription>
              Step Away keeps you in the room so you can rejoin later. Leave Room removes you permanently.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="destructive" onClick={handleLeaveRoom}>Leave Room</Button>
            <Button variant="secondary" onClick={handleStepAway}>Step Away</Button>
            <Button variant="ghost" onClick={() => setShowLeaveDialog(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
