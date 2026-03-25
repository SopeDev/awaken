# Avatar System (AI-Driven)

The avatar is an **AI-driven autonomous agent**.

It is **not** directly controlled by the player. The player only influences the avatar by sending **signals** (directional pull, intuition pulse, synchronicity). From there, the avatar:
- processes internal psychological state (needs, habituation effects, etc.)
- builds a structured input payload
- asks the server/LLM what to do next
- executes the chosen action in the game world

Other specs define the supporting systems:
- Needs: `NeedsSystem.md`
- Awareness: `AwarenessSystem.md`
- Player signals: `PlayerAbilitySystem.md`
- Cosmic Blueprint: `CosmicBlueprintSystem.md`

## Episodic decision-making (not continuous control)

Decisions happen in discrete ticks. The engine does **not** continuously choose actions every frame.

At each decision tick:
1. The engine collects a decision snapshot (player note, salience targets, felt-outcome line).
2. The engine requests a decision from the LLM via `POST /api/decision`.
3. The engine executes the selected action via `scene.executeAction(actionId)`.
4. The next decision only runs after the scheduling logic allows it (and the action is no longer executing).

### Decision tick gating

The decision tick runner (`_runDecisionTick`) refuses to call the LLM if:
- the scene is missing or the loop token doesn’t match
- AI is suppressed until some future time
- the scene is currently executing an action
- a previous decision is still in flight

When it *does* run, it schedules the next attempt using:
- `AI_DECISION_INTERVAL_MS = 5000 / TEST_SPEED_MULTIPLIER`

## Decision snapshot (what the LLM sees as “player influence”)

Before calling the backend, the engine snapshot:
- `note`: injected first-person text (only when present)
- `salientActionIds`: action IDs selected by player signals (used for `*` marking)
- `feltOutcomeLine`: optional context line derived from post-action evaluation

After snapshotting, these values are cleared until new signals arrive.

## Action space: alphabetical, and discovery gating

The LLM decision always operates on an action list built from the game’s action registry:
- `getAvailableActionIdsForDecision()` returns a list in **A–Z alphabetical order**
- when in the Room and a tutorial/discovery chain is active, some actions are locked and removed from the decision set

Important: the engine does not do heuristic scoring or weighted ordering for the LLM prompt. The action list order is deterministic (alphabetical).

## LLM prompt contract: `*` marks salience targets

Player signals produce `salientActionIds`. The client sends them to the server as `salientActionIds`.

On the backend, `buildUserPromptContent` appends a ` *` marker to any action ID present in `salientActionIds`. The system prompt defines the meaning of `*` at the selected consciousness level.

When the LLM responds, the backend normalizes the returned `action` by stripping trailing `*` characters before validating it.

## API contract (Phaser → backend → LLM → Phaser)

### Request payload: `chooseNextActionAsync`

The browser posts to `POST /api/decision` with (key fields):
- `consciousnessLevel`
- `needs`: raw numeric needs state
- `traits`: default trait set
- `traitTensions`: optional (Cosmic Blueprint breakdown)
- `availableActions`: action IDs (alphabetical at the client)
- `salientActionIds`: deduped + filtered at the server
- `playerSignal`: usually `null` from this decision loop unless another call path provides it
- `playerSignalNote`: the snapshot note (or `null`)
- `feltOutcomeLine`: optional context (or `null`)
- `recentFeltOutcomes`: last N felt outcome lines
- `loopHint`: short hint derived from recent actions
- `patternSummaries`: short memory summaries
- `recentActions`: last actions (count depends on consciousness level)
- `significantMemory`: only for higher consciousness levels

`recentActions` window size depends on consciousness level:
- level `<= 0`: 3
- level `== 1`: 5
- level `>= 4`: 10
- otherwise: 8

### Backend normalization: sorting + stripping `*`

On the server:
- `availableActions` is sorted alphabetically before building the prompt
- `salientActionIds` is filtered to be within the allowed `availableActions`
- the returned `action` has trailing `*` stripped before validation
- if the returned `action` is invalid, fallback is `availableActions[0]` (the first alphabetically)

### Response payload: backend → game

The normalized decision object includes:
- `action` (string action ID, no `*`)
- `thought` and `reason` (strings)
- `decision_factors` with fields like `mode` and `player_signal_used`

The engine stores the last decision for downstream awareness updates and reasoning UI.

## Fallback behavior (what happens when LLM fails)

Two different fallbacks exist:

### 1) Client-side fetch failure (no LLM result)

If the request to `/api/decision` fails (HTTP/network/throw):
- the engine chooses an action with `pickUniformRandomActionId()` over the allowed action list
- it also sets reasoning text to indicate “Fallback (no LLM)”

This fallback is **uniform random**, not weighted.

### 2) Server-side invalid LLM output (bad `action`)

If the LLM returns an action that doesn’t validate:
- the backend falls back to `availableActions[0]` after sorting

## Awareness + UI side-effects of a decision

The decision influences other systems immediately:
- If the decision includes player influence (`decision_factors.player_signal_used`) and the chosen action intersects any `salientActionIds`, the engine applies a player-signal awareness bump/penalty at decision time.
- On action completion, the engine applies the LLM’s `decision_factors.mode` to update `awarenessDynamicBuffer`.

UI receives reasoning text and cooldown display via `room-ui-state`.

## Execution flow (end-to-end)

```text
Decision tick
  ↓
Snapshot note + salience targets
  ↓
POST /api/decision
  ↓
LLM returns JSON (normalized: strip `*`, validate/fallback)
  ↓
Execute action in the Room
  ↓
Action completes → update awareness via decision_factors.mode
```

