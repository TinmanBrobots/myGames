# Set Game v2 — Implementation Plan

## Decisions

| Question | Decision |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Multiplayer | Game rooms via shareable link, up to 4 players |
| Assets | Reuse existing PNGs from `../set/setshapes/` |
| Auth | Anonymous play with display names |
| Deployment | Vercel |
| Testing | Vitest |

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict) |
| UI | React + shadcn/ui |
| Styling | Tailwind CSS |
| State | Zustand |
| Real-time | Socket.io (custom Next.js server) |
| Component Library | shadcn/ui (Button, Badge, Tooltip, Dialog, Separator) |
| Testing | Vitest + React Testing Library |

---

## Project Structure

```
set-two/
  public/
    setshapes/          ← copied from ../set/setshapes/
  src/
    lib/
      types.ts          ← Card, GameState, Player, Room, events
      deck.ts           ← createDeck, shuffle, parseCard, missingCard
      validator.ts      ← isValidSet, findSet, countSets
      game.ts           ← pure state transitions (newGame, selectCard, replaceCards, addCards)
    store/
      gameStore.ts      ← Zustand store (local/solo play)
    components/
      Card.tsx
      Board.tsx
      ScoreBoard.tsx
      FoundSetsList.tsx
      Controls.tsx
      GameShell.tsx
      hooks/
        useKeyBindings.ts
    app/
      page.tsx                  ← landing / mode select
      solo/page.tsx             ← single player
      local/page.tsx            ← local 2-player (same screen)
      room/
        page.tsx                ← create / join room
        [roomId]/page.tsx       ← online multiplayer room
      api/
        socket/route.ts         ← Socket.io upgrade handler
    server/
      roomManager.ts            ← in-memory room state
      gameServer.ts             ← server-authoritative game logic
      events.ts                 ← typed Socket.io event map (shared client/server)
  tests/
    deck.test.ts
    validator.test.ts
    game.test.ts
```

---

## Data Model

```typescript
type Attribute = 0 | 1 | 2;

// Encoded as integer 0–80 (base-3: digit 0=color, 1=fill, 2=shape, 3=count)
type CardId = number;

interface Card {
  id: CardId;
  color: Attribute;    // 0=red  1=green  2=purple
  fill: Attribute;     // 0=full 1=half   2=empty
  shape: Attribute;    // 0=oval 1=diamond 2=squiggle
  count: Attribute;    // 0=1   1=2       2=3
}

interface FoundSet {
  cards: [CardId, CardId, CardId];
  foundBy: string;     // player id
  elapsedMs: number;
}

interface GameState {
  deck: CardId[];
  deckCursor: number;
  board: (CardId | null)[];   // fixed-length (12–21 slots), null = empty
  selections: Record<string, number[]>;  // playerId → board indices
  foundSets: FoundSet[];
  phase: 'playing' | 'paused' | 'over';
  startedAt: number;
  lastSetAt: number;
}

interface Player {
  id: string;
  name: string;
  score: number;
}

interface Room {
  id: string;
  players: Player[];
  state: GameState;
  mode: 'solo' | 'local' | 'online';
}
```

---

## Typed Socket.io Events

```typescript
// Client → Server
interface ClientEvents {
  JOIN_ROOM:    { roomId: string; playerName: string };
  SELECT_CARD:  { boardIndex: number };
  NEW_GAME:     {};
  ADD_CARDS:    {};
  REVEAL_SET:   {};
}

// Server → Client
interface ServerEvents {
  ROOM_STATE:   Room;
  VALID_SET:    { playerId: string; cards: [number, number, number] };
  INVALID_SET:  { playerId: string };
  GAME_OVER:    { scores: Record<string, number> };
  PLAYER_JOINED: Player;
  PLAYER_LEFT:  { playerId: string };
  ERROR:        { message: string };
}
```

---

## Phases

### Phase 1 — Scaffolding & Core Logic
- [ ] `create-next-app` with TypeScript + Tailwind + ESLint
- [ ] Copy PNG assets
- [ ] `src/lib/types.ts` — all shared types
- [ ] `src/lib/deck.ts` — `createDeck`, `shuffle` (using `lodash/shuffle`), `parseCard`, `imagePath`
- [ ] `src/lib/validator.ts` — `isValidSet`, `findSet`, `countSets`, `thirdCard`
- [ ] `src/lib/game.ts` — pure state transitions
- [ ] `tests/` — Vitest suite for all lib functions

### Phase 2 — Single Player UI
- [ ] Zustand store
- [ ] `Card` component (selection highlight, size variants)
- [ ] `Board` component (CSS Grid)
- [ ] `ScoreBoard`, `FoundSetsList`, `Controls`
- [ ] `useKeyBindings` hook
- [ ] `solo/page.tsx` wired up end-to-end
- [ ] Pause, Reveal Set, Add Cards, New Game

### Phase 3 — Local Two-Player
- [ ] Extend store for 2-player state
- [ ] `local/page.tsx` with shared board, per-player selections and panels

### Phase 4 — Online Multiplayer
- [ ] Custom Next.js server with Socket.io
- [ ] Room create/join flow (`room/page.tsx`)
- [ ] Server-authoritative game state (`roomManager`, `gameServer`)
- [ ] `room/[roomId]/page.tsx` — live game with 2–4 players
- [ ] Reconnection handling
- [ ] Disable pause/reveal-set in online mode

### Phase 5 — Polish
- [ ] Mobile-responsive layout
- [ ] Animations (Framer Motion)
- [ ] Sound effects
- [ ] Improved stats / game history

---

## Key Cleanups vs v1

| v1 Smell | v2 Fix |
|---|---|
| Global mutable vars everywhere | Zustand store + pure reducer functions |
| `deckTop` pointer into mutable array | Immutable `deckCursor` into frozen deck |
| `cardsInPlayId` / `cardsOnBoard` dual arrays | Single `board: (CardId \| null)[]` |
| `BORDERSIZE.split('px')[0]` string math | CSS variables + Tailwind utilities |
| `IMGNAMES[j][x]` indexed lookups | Named maps with typed keys |
| `findSet` function shadowed by call-site var | Unambiguous names: `findFirstSet`, `countSets` |
| DOM manipulation in game logic | Pure logic in `lib/`, DOM owned by React |
| `<table>` for board layout | CSS Grid |
| No types | Strict TypeScript throughout |
| Manual Fisher-Yates | `lodash/shuffle` |
| `select()` named like a DOM API | `handleCardClick()` / `selectCard()` |
