// Each card attribute is one of three values
export type Attribute = 0 | 1 | 2;

// Cards are encoded as integers 0–80.
// Decoding (base 3): digit 0 = color, 1 = fill, 2 = shape, 3 = count.
export type CardId = number;

export interface Card {
  id: CardId;
  color: Attribute;   // 0=red    1=green   2=purple
  fill: Attribute;    // 0=full   1=striped 2=empty
  shape: Attribute;   // 0=oval   1=diamond 2=squiggle
  count: Attribute;   // 0=one    1=two     2=three
}

// Image filename fragments matching the existing assets
export const COLOR_CODES = ['r', 'g', 'p'] as const;
export const FILL_CODES  = ['f', 'h', 'e'] as const;
export const SHAPE_CODES = ['o', 'd', 's'] as const;

export interface FoundSet {
  cardIds: [CardId, CardId, CardId];
  playerId: string;
  elapsedSeconds: number;
  setsOnBoard: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
}

export type GamePhase = 'playing' | 'paused' | 'over';

export interface GameState {
  // The full shuffled deck; immutable after game start
  deck: CardId[];
  // How many cards have been dealt from the deck
  deckCursor: number;
  // Fixed-length slot array; null means the slot is empty (only during removal animation)
  board: (CardId | null)[];
  // Board indices selected by each player, keyed by player id
  selections: Record<string, number[]>;
  foundSets: FoundSet[];
  phase: GamePhase;
  startedAt: number;    // Date.now()
  lastSetAt: number;    // Date.now()
}

export interface Room {
  id: string;
  players: Player[];
  state: GameState;
  mode: 'solo' | 'local' | 'online';
}

// ── Socket.io typed events ────────────────────────────────────────────────────

export interface ClientToServerEvents {
  JOIN_ROOM:   (payload: { roomId: string; playerName: string }) => void;
  SELECT_CARD: (payload: { boardIndex: number }) => void;
  NEW_GAME:    () => void;
  ADD_CARDS:   () => void;
  REVEAL_SET:  () => void;
}

export interface ServerToClientEvents {
  ROOM_STATE:    (room: Room) => void;
  VALID_SET:     (payload: { playerId: string; boardIndices: [number, number, number] }) => void;
  INVALID_SET:   (payload: { playerId: string }) => void;
  GAME_OVER:     (payload: { scores: Record<string, number> }) => void;
  PLAYER_JOINED: (player: Player) => void;
  PLAYER_LEFT:   (payload: { playerId: string }) => void;
  ERROR:         (payload: { message: string }) => void;
}
