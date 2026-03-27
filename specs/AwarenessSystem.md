# Awareness System

## 1) What awareness means for the player

Awareness is the `0-100` HUD meter showing how clear or trapped the avatar feels.

- higher awareness = clearer, more aligned choices
- lower awareness = more automatic and stuck choices

### Dev Notes
- Displayed value is `awareness`
- Main code: `src/systems/awareness/*`, `src/systems/character/characterEngine.js`

## 2) Base awareness comes from life pressure

Needs pressure sets the background state for awareness.  
When needs are overloaded, clarity is harder to sustain.

This base shifts smoothly over time so the meter does not jitter.

### Dev Notes
- Base value: `baselineAwareness` (`0-50`)
- Built by `computeBaselineAwarenessBreakdown(needs)`
- Key weights emphasize stress/loneliness/fatigue
- Smoothed in `syncBaselineAwarenessFromNeeds(deltaMs)` with `BASELINE_AWARENESS_SMOOTH_TAU_MS = 180`

## 3) Completed actions push awareness up or down

After each action finishes, awareness changes based on the action's orientation.

- grounded/constructive moves can raise awareness
- avoidant/looping moves can reduce awareness

If behavior is judged as a stuck repetition that is not helping, extra penalty applies.

### Dev Notes
- Orientation value: `decision_factors.mode`
- Mode deltas (`MODE_BASE_AWARENESS_DELTAS`):
  - `need_relief`: `+1`
  - `comfort_seeking`: `-2`
  - `avoidance`: `-4`
  - `stimulation_seeking`: `-1`
  - `exploration`: `+3`
  - `self_regulation`: `+2`
  - `insight_following`: `+5`
- Stuck-loop add-on: `UNCONSCIOUS_LOOP_BASE_AWARENESS_DELTA = -4`
- Combined delta is scaled by `baselineAwareness / 50`

## 4) Player influence affects awareness at decision time

When your abilities highlight options for the avatar, the game checks if your influence actually landed.

- landed influence: awareness bump
- ignored influence: small penalty
- landed influence + chosen option was highlighted: extra bump

### Dev Notes
- Applied only when highlighted choices were present and LLM decision was used
- Signal flag: `decision.decision_factors.player_signal_used`
- Constants:
  - `PLAYER_SIGNAL_USED_AWARENESS_BONUS = 3`
  - `PLAYER_SIGNAL_SALIENT_CHOICE_OVERLAP_BONUS = 2`
  - `PLAYER_SIGNAL_IGNORED_AWARENESS_PENALTY = -2`
- Delta scaled by `baselineAwareness / BASELINE_AWARENESS_MAX`

## 5) How stuck-loop is determined

A stuck loop is not a vibe check. It is derived from actual behavior patterns:

- repetition is present
- same action has recently failed the current primary need
- unless it is valid direct bodily care for a bodily primary

### Dev Notes
- Derived on server by `deriveUnconsciousLoop`
- Uses recent actions, recent completion evaluations, chosen action, primary need, and `bodilyTargets`
- Result is returned as `decision_factors.unconscious_loop`

## 6) UI threshold flags

The UI also labels two high-level states:

- very low awareness (`entrapped`)
- very high awareness (`clear`)

### Dev Notes
- `isEntrapped` when `awareness <= 20`
- `isClear` when `awareness >= 80`
- These are UI flags, not automatic level transition logic

## 7) Awareness vs consciousness level

Consciousness level changes the decision framing.  
Awareness tracks current state movement from needs and decisions.

They influence each other, but they are not the same value.

### Dev Notes
- `consciousnessLevel` controls prompt/context selection
- Awareness meter math is driven by:
  - needs -> `baselineAwareness`
  - decision mode + loop flag -> `awarenessDynamicBuffer`

