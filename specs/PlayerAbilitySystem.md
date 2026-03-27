# Player Ability System

## 1) What player abilities are

Player abilities are influence tools, not direct controls.

- You steer attention
- You suggest possibilities
- The avatar still makes the final choice

### Dev Notes
- Core signal system: `src/systems/playerSignals/*`
- Cooldowns/constants: `src/systems/playerSignals/constants.js`

## 2) Directional Pull

You press a direction to nudge the avatar toward things in that direction.

- Objects in that direction get a subtle yellow outline
- The outline is a quick visual cue for the player
- It clears immediately when any interaction starts

### Dev Notes
- Input keys: `W / A / S / D`
- Allowed phases: `awaiting`, `walking`
- Blocked phase: `performing`
- Highlighted choices are added to `salientActionIds`

## 3) Intuition Pulse

You send a pulse around the avatar to amplify nearby meaningful options.

- It can surface nearby objects as stronger candidates
- It can add a brief intuition-style thought to the avatar reasoning
- If used while walking, it can redirect the avatar into a fresh decision
- Revealing hidden meaning is one-time per object instance in the current run: once an object's reveal is consumed by Attune, Intuition Pulse cannot reveal that same object again

### Dev Notes
- Input key: `Space`
- Allowed in all phases
- Nearby object scan maps to actions
- Deep/attuned objects can add to `salientActionIds` and intuition note text
- Revealed objects are tracked and marked consumed after successful Attune, so they are not re-attuned again

## 4) Attune

You trigger Attune during an ongoing interaction.

- Works only in the right moment and context
- On success, the current interaction resolves early
- Can unlock new possibilities in the room
- It is only usable when the current action is tied to an object that is currently revealed/attuned

### Dev Notes
- Input key: `E`
- Allowed phase: `performing` only
- Requires hidden-depth object + attunement
- Success path can flush relief-only pending need deltas and unlock actions
- UI also disables Attune unless that current-action object is attuned

## 5) How abilities influence awareness

Player influence can change awareness if it meaningfully affects a decision.

- Influence lands -> bump
- Influence ignored -> small penalty
- Influence lands and chosen action was highlighted -> extra bump

### Dev Notes
- Highlighted choices are sent as `salientActionIds` and marked with `*` in action list
- Influence result comes from `decision_factors.player_signal_used`
- Overlap bonus applies when chosen action is also in highlighted available choices
- Backend strips trailing `*` from returned action before validation

## 6) Player wording to developer wording

- highlighted choice -> `salientActionIds` entry
- influence landed -> `decision_factors.player_signal_used === true`
- stuck repetitive pattern -> `decision_factors.unconscious_loop === true`

