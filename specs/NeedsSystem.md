# Avatar Needs System

This spec reflects the current needs model implemented in:
- `src/systems/needs/needsState.js`
- `src/systems/needs/constants.js`

and the current LLM-facing conversion implemented in:
- `src/systems/llm/needsLanguage.js`

## Core model

All needs are scored on a unified `0–100` scale:
- `0` = satisfied
- `100` = critical

Current need keys (`NEED_KEYS`):
- `hunger`
- `thirst`
- `fatigue`
- `dirtiness`
- `boredom`
- `stress`
- `loneliness`

Initial needs (`INITIAL_NEEDS`) define the starting values.

## Tick update (game-time minutes)

Needs are advanced by calling `needsState.tick(gameMinutes, ...)`.

Each tick applies three steps:

1. **Base drift**: adds `BASE_DRIFT[key] * deltaMinutes` for each need key.
   Base drift coefficients (per in-game minute):
   - hunger `+3.0`
   - thirst `+4.0`
   - fatigue `+2.0`
   - dirtiness `+1.0`
   - boredom `+2.0`
   - stress `+1.0`
   - loneliness `+3.0`
2. **Cross-influences** (stable coefficients):
   The cross-influences are implemented as:
   - `hunger`:
     - increases `stress` only when `hunger > 60` (coefficient `0.04`)
     - increases `boredom` continuously (`+ hunger * 0.02`)
   - `thirst`:
     - increases `fatigue` continuously (`+ thirst * 0.04`)
     - increases `stress` only when `thirst > 60` (coefficient `0.05`)
   - `fatigue`:
     - increases `stress` only when `fatigue > 60` (coefficient `0.05`)
     - increases `boredom` continuously (`+ fatigue * 0.05`)
   - `boredom`:
     - increases `stress` only when `boredom > 75` (coefficient `0.02`)
   - `stress`:
     - increases `fatigue` continuously (`+ stress * 0.03`)
   - `loneliness`:
     - increases `stress` only when `loneliness > 50` (coefficient `0.04`)
     - increases `boredom` continuously (`+ loneliness * 0.03`)
   - `dirtiness`:
     - increases `stress` only when `dirtiness > 80` (coefficient `0.02`)
3. **Clamp**: each need is clamped to `[0, 100]`.

## Action effects (pending deltas + linear application)

Each action has an `ACTION_EFFECTS[actionId]` map of per-need deltas.

When an action starts:
- the engine reads `ACTION_EFFECTS[actionId]`
- applies habituation rules (per action meta fields) to produce effective deltas
- stores them into `pendingNeedDeltas` and `pendingNeedTotalDeltas`
- sets `pendingNeedChangeTotalMs = durationMs`

While the action is progressing:
- `applyPendingNeedDeltas(deltaMs)` applies pending deltas **linearly over the action duration**.

## Habituation Rules (action meta → reduced need effects)

Some actions “habituate” over repeated use: the same action becomes less effective at moving specific needs.

For each action, `characterEngine.onActionStarted()` reads two optional meta fields from `ACTIONS[actionId]`:

- `habituationRate` (number)
- `habituationNeeds` (array of need keys)

Habituation is applied per need key while building `pendingNeedDeltas`:

1. A need key `k` is eligible for habituation only when:
   - `habituationRate < 1.0`
   - and `habituationNeeds` includes `k`
2. A per-(action, need) counter is used:
   - `counterKey = actionId + ':' + needKey`
   - `useCount = habituationCounters[counterKey] || 0`
3. The action delta is scaled:
   - `effectiveDelta = baseDelta * (habituationRate ^ useCount)`
4. If the need is not eligible (or `habituationRate >= 1.0`), then:
   - `effectiveDelta = baseDelta` (no reduction)

Counters advance only when the action actually completes:

- for every `counterKey` that was used during `onActionStarted()`, increment `habituationCounters[counterKey] += 1`

Sleep partially recovers habituation sensitivity:

- when `actionId === 'go_to_sleep'`, every habituation counter is reduced:
  - `next = floor(current * 0.70)`

## Synchronicity interrupt: relief-only flush

Successful synchronicity ends the interaction early.

The engine flushes only **negative** pending deltas (relief effects) immediately, and discards the rest:
- negative totals reduce the relevant need(s) toward satisfaction
- positive totals are dropped (no “make the need worse” during synchronicity success)

## LLM interface: how needs become prompt text

The LLM does not receive raw numeric need values.

Server-side, `buildNeedsDescription()` converts each need into a natural-language phrase:
- For each need, values are bucketed into bands based on the numeric value:
  - `<20`: omitted
  - `20–39`: `a little <adjective>`
  - `40–59`: `'<adjective>'`
  - `60–79`: `pretty <adjective>`
  - `>=80`: `very <adjective>`
- If all needs are omitted, the description becomes `fine`.

The prompt then uses this prose plus trait descriptions to decide the next action.

