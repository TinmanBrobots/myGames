'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useOnlineStore,
  getStoredPlayerName,
  storePlayerName,
  getRejoinRoomId,
} from '@/store/onlineStore';
import { Button } from '@/components/ui/button';

type Mode = 'choose' | 'create' | 'join';

export default function RoomLobbyPage() {
  const router = useRouter();
  const { socket, room, connect, joinRoom } = useOnlineStore();

  const [mode, setMode] = useState<Mode>('choose');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [rejoinRoomId, setRejoinRoomId] = useState<string | null>(null);
  // Only redirect to a room after the user explicitly creates/joins one on this page.
  const [waitingForRoom, setWaitingForRoom] = useState(false);

  useEffect(() => {
    connect();
    setName(getStoredPlayerName());
    setRejoinRoomId(getRejoinRoomId());
  }, [connect]);

  // Redirect only when we're actively waiting for a room join confirmation.
  useEffect(() => {
    if (waitingForRoom && room) router.push(`/room/${room.id}`);
  }, [waitingForRoom, room, router]);

  const handleCreate = () => {
    if (!name.trim()) return;
    storePlayerName(name.trim());
    joinRoom(undefined, name.trim());
    setWaitingForRoom(true);
  };

  const handleJoin = () => {
    if (!name.trim() || !roomCode.trim()) return;
    storePlayerName(name.trim());
    joinRoom(roomCode.trim().toUpperCase(), name.trim());
    setWaitingForRoom(true);
  };

  return (
    <main className="flex flex-col items-center justify-center gap-6 p-6">
      <div className="flex items-center gap-4 self-start">
        <Link href="/"><Button variant="ghost" size="sm">← Home</Button></Link>
        <h1 className="text-3xl font-bold tracking-tight">Online Multiplayer</h1>
      </div>

      {mode === 'choose' && (
        <div className="flex flex-col gap-3 w-48">
          <Button size="lg" onClick={() => setMode('create')}>Create Room</Button>
          <Button size="lg" variant="secondary" onClick={() => setMode('join')}>Join Room</Button>
          {rejoinRoomId && (
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push(`/room/${rejoinRoomId}`)}
            >
              Rejoin Game
            </Button>
          )}
        </div>
      )}

      {mode === 'create' && (
        <div className="flex flex-col gap-3 w-64">
          <input
            className="border border-border rounded px-3 py-2 text-sm bg-background"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
            maxLength={20}
          />
          <Button onClick={handleCreate} disabled={!name.trim() || !socket?.connected}>
            Create Room
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setMode('choose')}>Back</Button>
        </div>
      )}

      {mode === 'join' && (
        <div className="flex flex-col gap-3 w-64">
          <input
            className="border border-border rounded px-3 py-2 text-sm bg-background"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={20}
            autoFocus
          />
          <input
            className="border border-border rounded px-3 py-2 text-sm font-mono uppercase bg-background tracking-widest"
            placeholder="Room code"
            value={roomCode}
            onChange={e => setRoomCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            maxLength={6}
          />
          <Button
            onClick={handleJoin}
            disabled={!name.trim() || roomCode.trim().length !== 6 || !socket?.connected}
          >
            Join Room
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setMode('choose')}>Back</Button>
        </div>
      )}
    </main>
  );
}
