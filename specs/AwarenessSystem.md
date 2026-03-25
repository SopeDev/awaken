# Awareness System

This spec reflects the current awareness implementation in code:
- `src/systems/awareness/*`
- `src/systems/character/characterEngine.js`

## What “Awareness” is

Awareness is a single `0–100` meter shown in the HUD.

Internally, it is composed of:
- `baselineAwareness` (`0–50`), derived from the current needs burden
- `awarenessDynamicBuffer` (`0–baselineAwareness`), derived from LLM decision factors
- a smoothed displayed value (`awareness`) that approaches the target using exponential smoothing

## Baseline awareness: derived from needs only

Baseline awareness is computed by `computeBaselineAwarenessBreakdown(needs)` and uses:
- a weighted burden ratio from the current needs
- asymmetric weights where stress/loneliness/fatigue dominate:
  - stress `1.25`
  - loneliness `1.2`
  - fatigue `1.15`
  - hunger `0.95`
  - thirst `0.95`
  - boredom `0.75`
  - dirtiness `0.55`

The resulting baseline is clamped to `0–50` where:
- `0` means low burden
- `50` means high burden

The displayed meter does not instantly jump when the needs-derived baseline changes.
`characterEngine.syncBaselineAwarenessFromNeeds(deltaMs)` applies exponential smoothing using:
- `BASELINE_AWARENESS_SMOOTH_TAU_MS = 180`
- `t = 1 - exp(-deltaMs / BASELINE_AWARENESS_SMOOTH_TAU_MS)`
- `_awarenessFinalSmoothed += (targetFinal - _awarenessFinalSmoothed) * t`

## Dynamic awareness: derived from decision mode

After an action completes, the engine applies the LLM’s `decision_factors.mode`.

Base deltas (`MODE_BASE_AWARENESS_DELTAS`) are:
- `need_relief`: `+1`
- `habit_relief`: `-2`
- `avoidance`: `-4`
- `stimulation_seeking`: `-1`
- `exploration`: `+2`
- `self_regulation`: `+2`
- `unconscious_loop`: `-5`
- `insight_following`: `+5`

The engine scales these by current baseline:
- `scaledDelta = baseDelta * (baselineAwareness / 50)`

It then updates:
- `awarenessDynamicBuffer = clamp(prev + scaledDelta, 0, baselineAwareness)`
- displayed awareness is recomputed from baseline + buffer

This dynamic buffer update happens on action completion (when the engine knows the LLM decision).

## Player-signal awareness: bump/penalty on decision

The engine also applies a player-signal awareness bump/penalty at **decision time**.

This happens only when:
- an LLM decision was actually used, and
- the chosen action overlaps any `salientActionIds` marked with `*` in the prompt.

Then it reads:
- `decision.decision_factors.player_signal_used` (boolean)

If `player_signal_used` is `true`:
- `+ PLAYER_SIGNAL_USED_AWARENESS_BONUS` (scaled by baseline)

If `player_signal_used` is `false`:
- `PLAYER_SIGNAL_IGNORED_AWARENESS_PENALTY` (negative, scaled by baseline)

The meter is snapped (not gradually interpolated) to the decision-time target after this bump/penalty.

## Entrapment and clarity thresholds (UI flags)

The engine maintains two boolean flags for UI:
- `isEntrapped` when `awareness <= 20`
- `isClear` when `awareness >= 80`

At the moment, these flags are primarily used for UI state (and prompt-related debugging/context), not for automatic consciousness level changes.

## Consciousness level vs awareness computation

`consciousnessLevel` selects which LLM system prompt and decision context to use.

However, the core awareness meter computation in the current code is driven by:
- needs → baseline awareness
- LLM decision factors → dynamic buffer

It is not directly a function of `consciousnessLevel`.

