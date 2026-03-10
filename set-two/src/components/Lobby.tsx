'use client';

import { useState } from 'react';
import type { OnlineRoom } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface LobbyProps {
  room: OnlineRoom;
  sessionToken: string;
  onStart: () => void;
  onLeave: () => void;
  onKick: (sessionToken: string) => void;
}

export function Lobby({ room, sessionToken, onStart, onLeave, onKick }: LobbyProps) {
  const isHost = room.hostToken === sessionToken;
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/room/${room.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex flex-col items-center justify-center gap-6 p-6">
      <div className="flex items-center gap-4 self-start w-full max-w-sm">
        <Button variant="ghost" size="sm" onClick={onLeave}>← Home</Button>
        <h1 className="text-2xl font-bold tracking-tight">Online Lobby</h1>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        {/* Room code */}
        <div className="bg-muted rounded-xl p-4 w-full text-center">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Room Code</p>
          <p className="text-5xl font-mono font-black tracking-widest mb-2">{room.id}</p>
          <p className="text-xs text-muted-foreground break-all mb-2">{shareUrl}</p>
          <Button variant="secondary" size="sm" className="w-full" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Invite Link'}
          </Button>
        </div>

        {/* Player list */}
        <div className="bg-card border border-border rounded-xl p-4 w-full">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            Players ({room.players.length}/4)
          </h2>
          <ul className="flex flex-col gap-2">
            {room.players.map(p => (
              <li key={p.sessionToken} className="flex items-center gap-2 text-sm">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    p.connected ? 'bg-green-500' : 'bg-muted-foreground'
                  }`}
                />
                <span className="font-medium">{p.name}</span>
                <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                  {p.sessionToken === room.hostToken && <span>host</span>}
                  {p.sessionToken === sessionToken && <span>(you)</span>}
                  {/* Host can kick other non-self players */}
                  {isHost && p.sessionToken !== sessionToken && (
                    <button
                      onClick={() => onKick(p.sessionToken)}
                      className="text-destructive hover:underline text-xs"
                    >
                      Kick
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Start / waiting */}
        {isHost ? (
          <Button className="w-full" size="lg" onClick={onStart}>
            Start Game
          </Button>
        ) : (
          <p className="text-muted-foreground text-sm text-center">
            Waiting for the host to start the game…
          </p>
        )}
      </div>
    </main>
  );
}
