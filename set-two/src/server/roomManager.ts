import { type OnlineRoom, type GameState } from '../lib/types';
import { createInitialState, addColumnToBoard } from '../lib/game';
import { findFirstSet } from '../lib/validator';

// ── In-memory state ────────────────────────────────────────────────────────

interface StoredRoom extends OnlineRoom {
  emptyAt: number | null;
}

// sessionToken → { socketId, roomId }
const sessions = new Map<string, { socketId: string; roomId: string }>();
// roomId → StoredRoom
const rooms = new Map<string, StoredRoom>();

// ── Helpers ────────────────────────────────────────────────────────────────

// Omit visually ambiguous chars (0/O, 1/I/L)
const ROOM_ID_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateRoomId(): string {
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += ROOM_ID_CHARS[Math.floor(Math.random() * ROOM_ID_CHARS.length)];
  }
  return rooms.has(id) ? generateRoomId() : id;
}

// ── Public API ─────────────────────────────────────────────────────────────

export function createRoom(sessionToken: string, playerName: string): OnlineRoom {
  const id = generateRoomId();
  const room: StoredRoom = {
    id,
    hostToken: sessionToken,
    players: [{ sessionToken, name: playerName, connected: true }],
    phase: 'lobby',
    gameState: null,
    emptyAt: null,
  };
  rooms.set(id, room);
  return room;
}

export function getRoom(roomId: string): StoredRoom | undefined {
  return rooms.get(roomId);
}

export function getSessionSocketId(sessionToken: string): string | undefined {
  return sessions.get(sessionToken)?.socketId;
}

export function joinRoom(
  roomId: string,
  sessionToken: string,
  playerName: string,
): OnlineRoom | { error: string } {
  const room = rooms.get(roomId);
  if (!room) return { error: 'Room not found.' };
  if (room.players.length >= 4) return { error: 'Room is full (max 4 players).' };

  // Reconnect existing player
  const existing = room.players.find(p => p.sessionToken === sessionToken);
  if (existing) {
    existing.connected = true;
    room.emptyAt = null;
    return room;
  }

  // New player joining (lobby or mid-game)
  room.players.push({ sessionToken, name: playerName, connected: true });
  room.emptyAt = null;

  // If game is already in progress, add the new player to game state selections
  if (room.phase === 'playing' && room.gameState) {
    room.gameState = {
      ...room.gameState,
      selections: { ...room.gameState.selections, [sessionToken]: [] },
    };
  }

  return room;
}

export function setSession(sessionToken: string, socketId: string, roomId: string): void {
  sessions.set(sessionToken, { socketId, roomId });
}

export function disconnectPlayer(
  sessionToken: string,
): { roomId: string; room: OnlineRoom } | null {
  const session = sessions.get(sessionToken);
  if (!session) return null;
  sessions.delete(sessionToken);

  const room = rooms.get(session.roomId);
  if (!room) return null;

  const player = room.players.find(p => p.sessionToken === sessionToken);
  if (player) player.connected = false;

  if (!room.players.some(p => p.connected)) {
    room.emptyAt = Date.now();
  }

  return { roomId: session.roomId, room };
}

/**
 * Permanently remove a player from a room (voluntary leave or host kick).
 * Returns the updated room and the removed player's socket ID, or null if not found.
 */
export function removePlayer(
  roomId: string,
  targetToken: string,
): { room: OnlineRoom; removedSocketId: string | null } | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  const removedSocketId = sessions.get(targetToken)?.socketId ?? null;
  sessions.delete(targetToken);

  room.players = room.players.filter(p => p.sessionToken !== targetToken);

  // Remove from game state selections if game is in progress
  if (room.gameState) {
    const { [targetToken]: _removed, ...rest } = room.gameState.selections;
    room.gameState = { ...room.gameState, selections: rest };
  }

  // Transfer host if the removed player was host
  if (room.hostToken === targetToken && room.players.length > 0) {
    room.hostToken = room.players[0].sessionToken;
  }

  // If room is now empty, start cleanup countdown
  if (room.players.length === 0) {
    room.emptyAt = Date.now();
  }

  return { room, removedSocketId };
}

export function startGame(roomId: string): OnlineRoom | null {
  const room = rooms.get(roomId);
  if (!room || room.phase !== 'lobby') return null;

  const players = room.players.map(p => ({ id: p.sessionToken, name: p.name, score: 0 }));
  let gameState = createInitialState(players);

  // Auto-add cards until a set exists (edge case on initial deal)
  while (findFirstSet(gameState.board) === null && gameState.deckCursor < gameState.deck.length) {
    gameState = addColumnToBoard(gameState);
  }

  room.phase = 'playing';
  room.gameState = gameState;
  return room;
}

export function updateGameState(roomId: string, gameState: GameState): void {
  const room = rooms.get(roomId);
  if (!room) return;
  room.gameState = gameState;
  if (gameState.phase === 'over') room.phase = 'over';
}

export function restartGame(roomId: string): OnlineRoom | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.phase = 'lobby';
  room.gameState = null;
  return room;
}

// ── Cleanup interval ───────────────────────────────────────────────────────

const EMPTY_TTL_MS = 60_000;

setInterval(() => {
  const now = Date.now();
  for (const [id, room] of rooms) {
    if (room.emptyAt !== null && now - room.emptyAt > EMPTY_TTL_MS) {
      rooms.delete(id);
      console.log(`[RoomManager] Removed empty room ${id}`);
    }
  }
}, 10_000);
