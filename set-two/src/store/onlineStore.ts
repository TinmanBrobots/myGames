'use client';

import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'sonner';
import type { ClientToServerEvents, ServerToClientEvents, OnlineRoom } from '@/lib/types';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SESSION_KEY = 'set-two-session';
const NAME_KEY    = 'set-two-player-name';
const ROOM_KEY    = 'set-two-room-id';

export function getOrCreateSessionToken(): string {
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem(SESSION_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, token);
  }
  return token;
}

export function getStoredPlayerName(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(NAME_KEY) ?? '';
}

export function storePlayerName(name: string): void {
  localStorage.setItem(NAME_KEY, name);
}

export function getRejoinRoomId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ROOM_KEY);
}

export function clearRejoinRoomId(): void {
  localStorage.removeItem(ROOM_KEY);
}

interface OnlineStore {
  socket: AppSocket | null;
  sessionToken: string;
  room: OnlineRoom | null;
  wasRemoved: boolean;
  connect: () => void;
  disconnect: () => void;
  joinRoom: (roomId: string | undefined, playerName: string) => void;
  leaveRoom: () => void;
  stepAway: () => void;
  startGame: () => void;
  selectCard: (boardIndex: number) => void;
  restartGame: () => void;
  kickPlayer: (sessionToken: string) => void;
  clearWasRemoved: () => void;
}

export const useOnlineStore = create<OnlineStore>((set, get) => ({
  socket: null,
  sessionToken: '',
  room: null,
  wasRemoved: false,

  connect: () => {
    if (get().socket) return; // already connected

    const sessionToken = getOrCreateSessionToken();
    const socket: AppSocket = io();

    socket.on('room_update', room => {
      set({ room });
      localStorage.setItem(ROOM_KEY, room.id);
    });

    socket.on('error', ({ message }) => {
      toast.error(message, { duration: message === 'Room not found.' ? 3000 : 5000 });
      if (message === 'Room not found.') localStorage.removeItem(ROOM_KEY);
    });

    socket.on('removed_from_room', () => {
      toast.error('You have been kicked from the game room.');
      localStorage.removeItem(ROOM_KEY);
      set({ room: null, wasRemoved: true });
    });

    set({ socket, sessionToken });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, room: null, sessionToken: '' });
  },

  joinRoom: (roomId, playerName) => {
    const { socket, sessionToken } = get();
    if (!socket) return;
    socket.emit('join_room', { roomId, playerName, sessionToken });
  },

  leaveRoom: () => {
    const { socket } = get();
    socket?.emit('leave_room');
    localStorage.removeItem(ROOM_KEY);
    set({ room: null });
  },

  // Disconnect without permanently leaving — ROOM_KEY kept so player can rejoin.
  stepAway: () => {
    get().socket?.disconnect();
    set({ socket: null, room: null });
  },

  startGame: () => get().socket?.emit('start_game'),

  selectCard: (boardIndex: number) =>
    get().socket?.emit('select_card', { boardIndex }),

  restartGame: () => get().socket?.emit('restart_game'),

  kickPlayer: (sessionToken: string) =>
    get().socket?.emit('kick_player', { sessionToken }),

  clearWasRemoved: () => set({ wasRemoved: false }),
}));
