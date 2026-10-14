# Agent Instructions

Cosmic Avatar (repo: `awaken`) is a 2D top-down consciousness RPG. The player is a Higher Self who
influences an LLM-driven avatar through soft signals; the avatar makes every decision itself.

## Development workflow

Before implementing a substantial new feature:

- Review PROJECT_DECISIONS.md and PROJECT_PROGRESS.md, plus the relevant system spec in `specs/`.
- Identify only ambiguities that materially affect implementation.
- Ask the user only questions whose answers would significantly change the implementation.
- Do not ask for confirmation of information already established in the project.
- Do not create planning or process artifacts unless they provide durable project value.
- After implementation, run the project's verification checks (see below).
- Update PROJECT_DECISIONS.md only for durable decisions.
- Update PROJECT_PROGRESS.md with completed work and the next planned slice.
- When a change alters system behavior, update the matching spec in `specs/`.
- Do not stage, commit, or push Git changes. The user always handles Git staging, commits, and pushes.
- Target desktop browsers with keyboard input (WASD / Space / E). Don't design for mobile or touch
  unless the user asks.

## Project map

- Stack: Phaser 3 (game) + React 18 (HUD/UI overlay) + Vite. Plain JavaScript, no TypeScript.
- LLM: OpenAI `gpt-4.1-mini`, called only from the server via `POST /api/decision`.
  - Handler: `server/decisionHandler.js`
  - Dev: served by the Vite middleware in `vite.config.js` (reads `.env.local`)
  - Prod: Vercel serverless wrapper in `api/decision.js`
- Runtime decision loop, needs, awareness, signals, and discoveries all meet in
  `src/systems/character/characterEngine.js`. It's large; read the relevant section rather than
  the whole file.
- Systems: `src/systems/*` (needs, awareness, entropy, playerSignals, cosmicBlueprint, llm, decision).
- Static game data: `src/data/*` (object types, actions, room layout, discovery chains).
- Scenes: `src/scenes/Room.js` (level 0 room), `src/scenes/Game.js` (outside).

## Specs and source of truth

- `specs/awaken.md` is the master design doc; `specs/*System.md` describe each system.
- Specs use two layers: **Player-Friendly View** first, **Developer Notes** second. Keep that
  structure when editing them.
- If a spec and the code disagree, the code (`src/systems/**`, `server/**`) is the source of truth.
  Fix the spec rather than "fixing" the code toward it, unless the user says otherwise.

## Design invariants

These are core to the game. Don't break them without the user's explicit decision:

- **The LLM never receives raw numbers or game-system vocabulary.** Needs, traits, awareness, and
  signals are converted to prose on the server (`src/systems/llm/*`) before they reach the model.
- **The avatar doesn't know it's being guided.** Player signals only make options more salient (for
  example `salientActionIds`, `*` markers, injected felt thoughts). They never pick the action.
- **The avatar can't act on what it can't think.** Progression unlocks actions through discoveries and
  insights, not keys or menus. Exits exist physically before they exist mentally.
- Stuck-loop detection stays behavioral (derived from recent actions and outcomes), not an LLM
  judgment call.

## Verification

- `npm run build` is the verification check. There is no test suite or linter yet.
- For pure logic in `src/systems/**`, a quick `node` script against the module is fine when it adds
  real confidence. Don't add a test framework without asking.
- Live decision loops call OpenAI and cost money. Don't run the game against the real API just to
  verify a change; the user does exploratory playtesting.

## Tool usage

Use available development tools only when they materially improve accuracy or verification.

### Library documentation

For Phaser 3, Vite, React, or OpenAI SDK APIs, check version-matched docs (Context7 or
`node_modules`) instead of relying on memory, especially for Phaser, whose APIs changed across 3.x
releases. Don't look up docs for ordinary JavaScript, game logic, or copy.

### Browser verification

Do not run Playwright or browser automation automatically during normal implementation.

Assume the user will perform manual exploratory testing during development.

Use Playwright/browser tooling only when:

- the user explicitly asks for automated browser verification,
- the user says a feature or development slice is ready for final testing,
- reproducing or diagnosing a browser-specific issue requires it,
- or an existing automated browser test needs to be updated or fixed.

When browser verification is requested, focus on the smallest set of important flows and edge cases
needed to validate the change. Avoid exhaustive browser testing unless explicitly requested.
