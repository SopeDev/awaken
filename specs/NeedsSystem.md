# Avatar Needs System

## 1) What the needs system means in play

The avatar is always dealing with pressure from daily needs.  
Those pressures shape what feels appealing, urgent, or avoidant in each moment.

- All needs run from `0` to `100`
- `0` means handled
- `100` means critical

Current needs:
- hunger
- thirst
- fatigue
- dirtiness
- boredom
- stress
- loneliness

### Dev Notes
- Source files: `src/systems/needs/needsState.js`, `src/systems/needs/constants.js`
- Initial values come from `INITIAL_NEEDS`

## 2) How needs rise over time

As in-game time passes, needs naturally increase.  
This keeps the avatar from staying in a static state and creates real tradeoffs.

Base drift per in-game minute:
- hunger `+3.0`
- thirst `+4.0`
- fatigue `+2.0`
- dirtiness `+1.0`
- boredom `+2.0`
- stress `+1.0`
- loneliness `+3.0`

Then needs also influence each other. Example: strong thirst can increase fatigue, and high fatigue can feed stress.

### Dev Notes
- Update entrypoint: `needsState.tick(gameMinutes, ...)`
- Tick order: base drift -> cross-influences -> clamp to `[0, 100]`
- Cross-influences use fixed coefficients and threshold checks in `needsState.js`

## 3) How actions change needs

Each action has need effects.  
Some effects help immediately, others have costs.

Example of intended feel:
- `drink_water` strongly helps thirst
- `scroll_phone` can ease boredom but may increase other pressure over time

Effects are applied gradually while the action is happening, not all at once.

For direct bodily-care actions (hunger, thirst, fatigue, dirtiness), the action ends early as soon as that bodily need is fully satisfied (`0`).

### Dev Notes
- Effects map: `ACTION_EFFECTS[actionId]`
- On action start, engine prepares pending deltas
- During action, deltas are applied linearly via `applyPendingNeedDeltas(deltaMs)`
- Action duration controls pacing of this linear application
- If the active action has a bodily target and that target reaches `0`, the interaction is finished immediately

## 4) Habituation (repeating the same fix works less)

If the avatar repeats the same action too often for the same need, that action can lose impact.  
This prevents one cheap behavior from solving everything forever.

Sleep partially restores sensitivity, so repeated patterns can cool down over time.

### Dev Notes
- Action metadata keys: `habituationRate`, `habituationNeeds`
- Counter key shape: `actionId:needKey`
- Effective delta: `baseDelta * (habituationRate ^ useCount)` when eligible
- Counters increment on action completion
- `go_to_sleep` reduces counters with `floor(current * 0.70)`

## 5) Attune interaction with needs

When Attune successfully interrupts an action, only the helpful part is kept.  
Relief is applied, but negative side effects are not carried through in that interrupt path.

### Dev Notes
- On Attune success, engine flushes only negative pending deltas
- Positive pending deltas are discarded in this path

## 6) What the decision model receives

The decision model does not see raw need numbers directly.  
It receives natural language descriptions like "pretty thirsty" or "very stressed".

At consciousness level `0`, only stronger needs (r2 and above) are described.

### Dev Notes
- Conversion logic: `src/systems/llm/needsLanguage.js`
- Builder: `buildNeedsDescription()`
- Band filtering uses `minBand = 'r2'` at level 0, `r1` otherwise

