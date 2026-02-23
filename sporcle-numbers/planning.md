# Sporcle Numbers Clone — Implementation Plan

## Game Overview

A number placement puzzle where players receive random numbers one at a time and must place them in a 10-slot row. The goal is to end with all 10 numbers in ascending order; you lose if you ever receive a number that must go between two existing numbers but no empty space exists between them.

---

## Game Mechanics (Refined)

### Setup

- **Row**: 10 empty, ordered slots (positions 1–10, left to right)
- **Deck**: 10 unique random numbers from 1–100 (drawn without replacement)

### Play

1. Display one random number at a time.
2. Player assigns that number to any **unused** slot.
3. Repeat until all 10 numbers are placed (win) or placement becomes impossible (lose).

### Win Condition

- All 10 slots filled.
- Numbers are in ascending order left-to-right.

### Lose Condition

- The current number falls *between* two already-placed neighbors, but there is **no empty slot** between those neighbors.
- Example: Slots show `[_, 5, 15, 20, _, ...]` and you receive `10`. `10` must go between `5` and `15`, but the only space between them is filled by `15`. → **Lose**

---

## Tech Stack


| Layer      | Choice                                  |
| ---------- | --------------------------------------- |
| Framework  | React 18+ (functional components)       |
| UI library | MUI (Material-UI)                       |
| Build tool | Vite (fast, modern, good React support) |
| Language   | TypeScript                              |
| Styling    | MUI + custom themes                     |


---

## Phase 1: Project Setup

1. Create React + Vite + TypeScript project in `sporcle-numbers/`
2. Install MUI: `@mui/material`, `@emotion/react`, `@emotion/styled`
3. Configure basic app structure: `App.tsx`, main entry, routing (if needed)
4. Add a simple theme (light/dark optional for later)

---

## Phase 2: Core Game Logic

### State

- `slots: (number | null)[]` — length 10, `null` = empty
- `currentNumber: number | null` — number to place
- `remainingNumbers: number[]` — numbers not yet drawn
- `gameStatus: 'playing' | 'won' | 'lost'`

### Logic Functions

- `**initializeGame()`**  
  - Generate 10 unique numbers from 1–100 (Fisher–Yates shuffle or equivalent)  
  - Set `slots` to all `null`, `remainingNumbers` to the 10 numbers, `currentNumber` to first draw
- `**getValidSlots(currentNumber, slots)**`  
Returns indices where placing `currentNumber` is legal:
  - All empty slots are valid if placement doesn’t create an impossible future state
  - Or: any empty slot is valid, and we only check “game over” after placement
- `**placeNumber(slotIndex)**`  
  - Put `currentNumber` into `slots[slotIndex]`  
  - Draw next number from `remainingNumbers` → `currentNumber`  
  - Check lose condition: if `currentNumber` must go between two neighbors and no space exists → set `gameStatus = 'lost'`  
  - If no numbers left → set `gameStatus = 'won'`
- **Lose check**  
  - For each adjacent pair `(a, b)` in `slots`, if `currentNumber` is strictly between `a` and `b` and there is no empty slot between `a` and `b`, the game is lost.

---

## Phase 3: UI Components

### Layout

```
┌─────────────────────────────────────────────────────┐
│  Sporcle Numbers Clone                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Current number: [  47  ]                           │
│                                                     │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ... ┌───┐            │
│  │ _ │ │ 12│ │ _ │ │ _ │ │ 47│     │ _ │            │
│  └───┘ └───┘ └───┘ └───┘ └───┘     └───┘            │
│    1     2     3     4     5   ...   10             │
│                                                     │
│  [ Restart ]                                        │
└─────────────────────────────────────────────────────┘
```

### Components

1. `**GameBoard**` — main container, holds state and game logic
2. `**CurrentNumberDisplay**` — shows the number to place
3. `**SlotRow**` — renders 10 slots
4. `**Slot**` — single slot: empty or filled, clickable when empty and game is playing
5. `**GameStatusOverlay**` — win/lose message and restart
6. `**RestartButton**` — resets game

### Interactions

- Click an empty slot → place `currentNumber` in that slot
- Visually indicate valid vs invalid slots (optional enhancement)
- Disable slots when game is won or lost

---

## Phase 4: Polish and UX

- Clear win/lose messaging
- Optional: subtle animations (e.g., number appears in slot)
- Optional: highlight valid slots on hover
- Optional: show “numbers placed” count or progress
- Responsive layout for mobile/tablet

---

## Phase 5: Local Play and Future Publishing

### Local

- Run with `npm run dev` for local development
- Serve static build with `npm run build` + any static host (e.g., `npx serve dist`)

### Future publishing

- Deploy to Vercel, Netlify, or GitHub Pages
- No backend required for single-player
- Optional later: leaderboards, shared seeds, multiplayer (out of scope for initial plan)

---

## File Structure (Proposed)

```
sporcle-numbers/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── GameBoard.tsx
│   │   ├── CurrentNumberDisplay.tsx
│   │   ├── SlotRow.tsx
│   │   ├── Slot.tsx
│   │   └── GameStatusOverlay.tsx
│   ├── hooks/
│   │   └── useGameState.ts
│   ├── utils/
│   │   └── gameLogic.ts
│   ├── types/
│   │   └── game.ts
│   └── theme/
│       └── theme.ts
└── planning.md
```

---

## Clarifying Questions

Before implementation, please confirm or adjust the following:

### 1. Number generation

- Are all 10 numbers **unique** (drawn without replacement)?
- Is the range always **1–100**, or could it be configurable (e.g., 1–50 for easier games)?

### 2. Placement rules

- Can the player place a number in **any** empty slot, or only in slots where it is “correct” relative to neighbors?
- Our assumption: any empty slot is allowed; the lose condition triggers only when placement becomes impossible on a *future* draw. Is that correct?

### 3. Lose condition timing

- Does the loss happen **as soon** as the impossible number is drawn (before placement), or only after the player attempts an invalid placement?
- Our assumption: as soon as the impossible number is revealed. Please confirm.

### 4. UX preferences

- How should the player choose a slot: **click** on the slot, or another method (e.g., number keys 1–10)?
- Should we **highlight valid slots** to help new players, or keep it minimal?
- Any preferences for **animations** (e.g., number sliding into slot)?

### 5. Scoring and persistence

- Is the game **win/lose only**, or do you want metrics (e.g., numbers placed before losing, win rate)?
- Should we support **game history** or **persistent stats** (e.g., in `localStorage`)?

### 6. Future features

- **Shared seeds**: Allow sharing a game by URL (e.g., `?seed=12345`) so others can play the same sequence?
- **Difficulty levels**: Different ranges (1–50, 1–100, 1–200) or different slot counts?
- **Tutorial**: Optional first-time walkthrough?

---

## Implementation Order

1. **Phase 1** — Project setup
2. **Phase 2** — Game logic + unit tests (optional)
3. **Phase 3** — UI components and wiring
4. **Phase 4** — Polish and responsive layout
5. **Phase 5** — Local testing and deployment prep

---

## Next Steps

Once the clarifying questions are answered, we can proceed with Phase 1 and implement the game step by step.