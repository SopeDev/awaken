# Player Ability System

This spec reflects the *current* mechanics implemented in code (as of the latest build).

## What the player can (and cannot) do

The player does **not** directly control the avatar’s movement or action execution.

Instead, the player triggers **signals** that:

1. Add first-person narrative text (`playerSignalNote`) to the LLM prompt (sometimes, depending on consciousness level).
2. Provide **salience markers** by sending `salientActionIds` to the decision backend. In the LLM user message, those action IDs are marked with `*`.
3. Optionally affect **Awareness** when the LLM decision includes a marked action and the LLM reports `decision_factors.player_signal_used` as `true`.

## Current abilities (signals)

There are three player abilities surfaced by the UI:

1. Directional Pull
2. Intuition Pulse
3. Synchronicity

Cooldown durations come from `src/systems/playerSignals/constants.js`.

### 1) Directional Pull

Activation:
- Keys: `W / A / S / D`
- Cooldown: `DIRECTIONAL_PULL_COOLDOWN_MS`
- Allowed phases: `awaiting` and `walking`
- Blocked during: `performing`

Mechanics:
- On activation, the engine computes a cardinal sector around the avatar and derives **action IDs** that correspond to objects in that sector.
- Those action IDs are stored as the decision’s `salientActionIds` (so the LLM user message marks them with `*`).
- Narrative note injection:
  - If `consciousnessLevel > 0`, the engine sets a short directional note (first-person line).
  - If `consciousnessLevel === 0`, no directional narrative note is injected (so the `*` cue does the work).

Awareness link:
- When the LLM returns a decision that includes any marked/salient action, the backend reads `decision_factors.player_signal_used` and applies an awareness bump or penalty accordingly.

Visual cue:
- The Room briefly outlines the objects corresponding to the sector targets, and clears outlines as soon as an interaction starts.
- The highlight is a subtle yellow stroke outline (Room sets `setStrokeStyle(3, 0xffe066, 0.85)`), and it is cleared when any action begins.

### 2) Intuition Pulse

Activation:
- Key: `Space`
- Cooldown: `INTUITION_PULSE_COOLDOWN_MS`
- Allowed phases: all phases, but decisions are requested immediately only from `awaiting`

Mechanics:
- The engine inspects the surrounding 3x3 neighborhood (adjacent object types) and maps nearby object types to action IDs.
- Hidden-depth (“deep”) objects:
  - Attuned state is applied for deep objects.
  - Those deep objects’ actions are included in `salientActionIds`.
  - A felt first-person intuition note may be injected when deep objects are attuned.
- Shallow objects:
  - No attunement.
  - Dismissive flicker feedback may be triggered for shallow-only neighborhoods.

Decision scheduling:
- If the avatar is `walking`, the engine cancels the walk and requests a new decision.
- If the avatar is `awaiting`, it requests a new decision only when the LLM decision loop is not already in flight.

Awareness link:
- As with directional pull: if the LLM chooses an action contained in `salientActionIds`, awareness bump/penalty depends on `decision_factors.player_signal_used`.

### 3) Synchronicity

Activation:
- Key: `E`
- Cooldown: `SYNCHRONICITY_COOLDOWN_MS`
- Allowed phase: `performing` only

Mechanics:
- The engine reads the action currently being executed (`room._interactionActionId`) and its `objectTypeId`.
- Preconditions:
  - The object type must have hidden depth.
  - The object type must be attuned (deep-sync requires prior intuition attunement).
- Notice roll:
  - It computes `primed` when any of the following is true:
    - `perception > SYNCHRONICITY_NOTICE_PERCEPTION_THRESHOLD`
    - `boredom > SYNCHRONICITY_NOTICE_BOREDOM_THRESHOLD`
    - `consciousnessLevel >= SYNCHRONICITY_NOTICE_LEVEL_MIN`
  - It sets `noticeP`:
    - `SYNCHRONICITY_NOTICE_PRIMED_CHANCE` when `primed === true`
    - `SYNCHRONICITY_NOTICE_BASE_CHANCE` otherwise
  - It then rolls `noticed` as `Math.random() < noticeP`
- If the ability is blocked (not hidden depth, or not attuned), the engine returns without applying the synchronicity success path.
- On success (`noticed === true`):
  - Ends the ongoing interaction early and flushes pending **negative** need deltas (relief-only semantics).
  - Sets a new first-person synchronicity note.
  - Applies tutorial/discovery logic: if synchronicity matches a discovery step, it unlocks new actions in the Room for future decisions.
  - Adds newly unlocked actions (only, on first unlock) into `salientActionIds` for LLM star-marking.

Awareness link:
- Awareness bump/penalty occurs via the same `salientActionIds` + `decision_factors.player_signal_used` mechanism.

## Salience markers (`*`) and LLM contract

The decision prompt uses `*` markers in the **available action list** to represent “active cue targets”.

The meaning of `*` is defined in `src/systems/llm/systemPrompts.js` via:
- a level-specific cue line for levels 0–4
- and a corresponding JSON schema requirement that the model returns `action` without the `*`.

On the backend:
- the returned `action` is normalized by stripping trailing `*` characters before validation.

