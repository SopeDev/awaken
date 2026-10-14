# Project Progress

Last updated: 2026-10-14. This is a re-entry snapshot written from the code after a ~6-month pause
(the last commit before it was 2026-03-27).

## Built and working

- **Room (level 0)**: top-down room with bed, phone, TV, treadmill, computer, books, window, door,
  refrigerator, couch, water dispenser, and shower (`src/data/objectTypes.js`, `src/data/roomData.js`).
- **LLM decision loop**: roughly every 5 s the avatar picks its next action via `POST /api/decision`
  (OpenAI `gpt-4.1-mini`). The server turns needs and traits into prose and picks the system prompt by
  consciousness level. The reasoning text shows in the UI.
- **Needs**: hunger, thirst, fatigue, boredom, stress, loneliness, hygiene, with a perceived-relief
  model where an action can fail the need it was chosen for (`src/systems/needs/*`).
- **Awareness meter (0–100)**: a needs-driven baseline (0–50) plus a dynamic buffer moved by decision
  mode, loop detection, and whether player influence landed. `entrapped` at ≤20 and `clear` at ≥80
  are UI labels only (`src/systems/awareness/*`).
- **Stuck-loop detection**: computed on the server from repetition plus recent need failures
  (`src/systems/decision/deriveUnconsciousLoop.js`).
- **Player abilities**: Directional Pull (WASD), Intuition Pulse (Space), Attune (E, during an
  action) (`src/systems/playerSignals/*`, `src/ui/AbilityBar/`).
- **Discovery chain (tutorial)**: Attune while reading → bird passage → `look_out_window` unlocks →
  Attune at the window → bird on the sill → `go_outside` unlocks (`src/data/roomDiscovery.js`).
  Completing `go_outside` switches to the `Game` scene.
- **Cosmic Blueprint**: natal chart → planet weights, sign deltas, dignities, nodes, and Chiron → trait
  scores and trait tensions fed into the LLM prompt. It currently uses
  `src/systems/cosmicBlueprint/data/exampleChart.js`.
- **Entropy**: a pressure meter with its own UI strip. Reaching 100 ends the run in the `GameOver`
  scene.
- **In-game clock**: one in-game day lasts 15 real minutes and the clock starts at 7:00 AM.

## Partial or placeholder

- **Outside (`src/scenes/Game.js`)** is still the Kenney template scene: the player walks with the
  arrow keys, there's no avatar AI, and the start screen reads "Press Spacebar to Start". Walking onto
  the house door tile goes back to the Room.
- **Consciousness level** only changes through the debug slider in `GameUI.jsx`. Nothing in gameplay
  raises it.
- **The other hidden-depth objects** (phone, TV, computer, couch) have Attune notes that don't lead
  anywhere in the discovery chain.
- The MVP checklist in `specs/awaken.md` §16 is still all unchecked even though most items exist.

## Designed but not built

- A level-up event: reaching clarity plus completing discoveries → Level 0 → 1 (`specs/awaken.md` §7.7).
- Dream Layer (direct control while the avatar sleeps, dream messages, Archon shadows) (§5.1–5.3).
- Insight system beyond the tutorial chain, and global vs. local actions (§20).
- Later levels: outside world, city, NPCs, shadow-work fights, dream realms, perceptual layers.

## Verification

- `npm run build` passes (2026-10-14). There's no test suite.

## Next planned slice

Not chosen yet. First step: Jorge playtests the room to re-orient. Candidates:

1. **Level-up**: gate the door on clarity (≥80) plus discoveries, raise `consciousnessLevel`, and add
   a transition beat.
2. **A real outside scene** where the avatar AI and needs carry over, replacing the template.
3. **A deeper room puzzle**: make the phone/TV/computer notes branches or red herrings in the chain.
