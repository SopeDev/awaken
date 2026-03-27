# Avatar System (AI-Driven)

## 1) What this system is in gameplay terms

The avatar is autonomous.  
You influence it, but you do not directly command it.

### Dev Notes
- Core runner: `src/systems/character/characterEngine.js`
- Supporting specs: `NeedsSystem.md`, `AwarenessSystem.md`, `PlayerAbilitySystem.md`, `CosmicBlueprintSystem.md`

## 2) How a decision cycle feels to the player

The avatar operates in short decision cycles:
1. it gathers current context
2. it considers your active influence
3. it picks one action
4. it performs that action before deciding again

This creates behavior that feels intentional, not twitchy.

### Dev Notes
- Decision loop uses discrete ticks, not per-frame choice
- Tick scheduler in `_runDecisionTick`
- Next decision waits for gating conditions and current action status

## 3) When the avatar is allowed to ask for a new decision

The avatar will not request a new decision if:
- an action is already being performed
- a decision request is still in flight
- AI is temporarily suppressed

### Dev Notes
- Gating checks happen before `chooseNextActionAsync`
- Interval base: `AI_DECISION_INTERVAL_MS = 5000 / TEST_SPEED_MULTIPLIER`

## 4) How player influence enters the decision

Your abilities can contribute:
- a short internal note
- highlighted options in the action list
- recent felt context from prior outcomes

These are inputs, not hard commands.

### Dev Notes
- Snapshot fields include `playerSignalNote`, `salientActionIds`, `feltOutcomeLine`
- Snapshot is collected then cleared for future cycles
- Highlighted options are represented with `*` in prompt action list

## 5) What choices the avatar can pick from

The avatar only chooses from currently available actions.  
Order is stable and alphabetical so there is no hidden weighting by position.

### Dev Notes
- Source list: `getAvailableActionIdsForDecision()`
- Ordering: A-Z deterministic
- Discovery/tutorial gating can remove locked actions from available set

## 6) Request and response flow

The client sends a decision request to the backend, then receives a normalized action decision.

### Dev Notes
- Endpoint: `POST /api/decision`
- Request includes needs, traits, available actions, highlighted actions, and recent history context
- Response includes `action`, `thought`, `reason`, and `decision_factors`
- Backend strips trailing `*` from returned action before validation

## 7) Fallback behavior if decision fails

There are two safety paths:
- if the request fails entirely, avatar picks a random allowed action
- if model output is invalid, backend picks the first valid action alphabetically

### Dev Notes
- Client fallback: `pickUniformRandomActionId()`
- Server invalid-action fallback: `availableActions[0]` after sorting

## 8) How this links to awareness and UI

A decision immediately affects awareness logic and reasoning display:
- landed player influence can bump awareness
- ignored influence can penalize
- action orientation and stuck-loop status apply on completion

### Dev Notes
- Decision-time awareness uses `decision_factors.player_signal_used`
- Completion-time awareness uses `decision_factors.mode` + server-derived `decision_factors.unconscious_loop`
- UI updates through `room-ui-state` plus in-world thinking indicator

