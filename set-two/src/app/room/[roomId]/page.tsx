'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Copy, Check, Maximize2, Minimize2 } from 'lucide-react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);

  // Connect socket on mount
  useEffect(() => { connect(); }, [connect]);

  // Fullscreen support detection + change listener
  useEffect(() => {
    setFullscreenSupported(!!document.fullscreenEnabled);
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

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

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

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
    <main className="flex flex-col items-center gap-3 p-3 lg:gap-4 lg:p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 lg:gap-3 self-start w-full">
        <Button variant="ghost" size="sm" onClick={() => setShowLeaveDialog(true)}>← Home</Button>
        <h1 className="text-xl lg:text-3xl font-bold tracking-tight">SET — Online</h1>
        <div className="flex items-center gap-1 ml-1">
          <span className="text-muted-foreground font-mono text-xs lg:text-sm">Room: {room.id}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={copyRoomUrl}
            title="Copy room link"
          >
            {urlCopied ? <Check size={14} /> : <Copy size={14} />}
          </Button>
        </div>
        {fullscreenSupported && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7 text-muted-foreground"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        )}
      </div>

      <div className="flex gap-3 lg:gap-4 items-start">
        {/* Mobile compact scores (all players stacked) — hidden on desktop */}
        <div className="flex lg:hidden flex-col gap-1.5">
          {room.players.map((p, i) => (
            <div
              key={p.sessionToken}
              className="flex flex-col items-center bg-card rounded-lg px-2 py-1.5 min-w-[3.5rem]"
              style={{ opacity: p.connected ? 1 : 0.4 }}
            >
              <span
                className="text-[0.6rem] font-semibold leading-tight w-full text-center truncate"
                style={{ color: `var(--color-p${i + 1})` }}
              >
                {p.name}{p.sessionToken === sessionToken ? ' ★' : ''}
              </span>
              <span className="text-xl font-black tabular-nums leading-tight">
                {gameState.foundSets.filter(fs => fs.playerId === p.sessionToken).length}
              </span>
            </div>
          ))}
        </div>

        {/* Desktop left column: players 0, 2 — hidden on mobile */}
        {leftPlayers.length > 0 && (
          <div className="hidden lg:flex flex-col gap-4">
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
        <div className="flex flex-col gap-3 lg:gap-4 items-center">
          <ScoreBoard state={gameState} players={players} horizontal />
          <div className="overflow-x-auto max-w-[calc(100vw-6rem)] lg:max-w-none">
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
        </div>

        {/* Desktop right column: players 1, 3 — hidden on mobile */}
        {rightPlayers.length > 0 && (
          <div className="hidden lg:flex flex-col gap-4">
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
