# Cosmic Avatar
## Master Game Design Document (MGDD)

| Field | Value |
|-------|-------|
| Version | 0.4 |
| Status | Living Document |
| Author | Jorge Carlos Quevedo |
| Purpose | Single source of truth for game vision, systems, mechanics, and world. |

---

## 1. Game Overview

### Working Title

**Cosmic Avatar**

Possible future titles:
- The Higher Self Protocol
- Dreamwalker
- Awakening Simulation
- Ascension Engine

### Genre

- 2D Top-Down Consciousness RPG
- Behavioral Puzzle Simulation
- Narrative Adventure

### Elevator Pitch

*"You start with full control — in a dream. Then you wake up and lose everything. The whole game is about finding your way back."*

A consciousness RPG where you play as a Higher Self intelligence guiding an AI-driven avatar through their daily life. The avatar lives in a world designed to keep them unconscious — distraction, comfort loops, fear, entropy. You can't control them directly. You can only send subtle signals: dreams, intuitions, synchronicities. As they become more aware, your connection strengthens. Eventually they realize the voice guiding them was always themselves.

### Platform

**Primary Target:** Web Browser

**Future Ports:**
- Desktop
- Mobile

### Engine (Finalized)

**Phaser (Primary Engine)**

- JavaScript-based framework
- Native fit for web deployment
- Integrates seamlessly with Node.js backend
- Compatible with AI-assisted development (Cursor)
- Lightweight and fast for MVP iteration

**Architecture Overview:**

```
Phaser (frontend game)
→ Node.js backend (game logic + AI bridge)
→ Local LLM (via Ollama / Hermes or similar)
```

The frontend never directly controls AI decisions.
All decision logic flows through the backend.

### Core Fantasy

The player is a **Higher Self intelligence** guiding a human avatar living inside a simulated reality designed to test consciousness.

- The avatar initially believes it is simply a human being.
- The player communicates through **dreams**, **intuition**, **synchronicities**, and **symbolic signals**.
- As the avatar's consciousness level rises, the connection strengthens.
- Eventually the avatar realizes the guiding intelligence is itself.
- The player and avatar merge into a fully conscious being capable of navigating all layers of reality.

---

## 2. Core Player Experience

The player experiences the journey from:

> **Unconscious Life → Awakening → Alignment → Mastery → Transcendence**

**The emotional arc:**

The game opens in the dream — the player has full control, full power, full awareness. Then the avatar wakes up and everything is taken away. The rest of the game is the journey back to what was briefly, fully felt at the very beginning. The player isn't chasing something abstract. They're chasing something they already experienced once.

**Player progression:**

1. Dream — full direct control, discover traits and abilities
2. Wake — lose control, observe only
3. Send subtle signals, build consciousness
4. Dream abilities unlock in waking world as player influence tools
5. Gain direct control during dream visits
6. Maintain consciousness against constant entropy pressure
7. Dream and waking merge — full integration

---

## 3. Core Design Pillars

1. **Awakening Through Gameplay** — Spiritual concepts are experienced through mechanics rather than explanation.
2. **Increasing Agency** — Player control evolves over time. Every ability earned can be lost.
3. **Symbolic Worlds** — Game environments represent archetypal psychological and cosmic structures.
4. **Discovery & Curiosity** — Players uncover hidden rules governing reality.
5. **Entropy Never Stops** — Consciousness is a practice, not a destination. The game always pushes back.

---

## 4. Core Gameplay Loop

### Early Game

```
Open in dream → player has full control
        ↓
Learn traits, abilities, world through direct play
        ↓
Avatar wakes up → player loses control
        ↓
Observe avatar's unconscious behavior
        ↓
Send subtle signals (dream message, intuition pulse)
        ↓
Consciousness score rises slowly
        ↓
First dream ability unlocks in waking world
```

### Mid Game

```
Guide avatar through waking zones
        ↓
Insight chains unlock new actions and spaces
        ↓
Archons apply entropy pressure through environment
        ↓
Avatar sleeps → player enters dream layer
        ↓
Discover new dream zone, unlock new ability
        ↓
Wake → ability available in waking world
        ↓
Consciousness regression risk if entropy builds
```

### Late Game

```
High consciousness → player has near-direct control
        ↓
Dream and waking world begin to visually merge
        ↓
Entropy pressure intensifies — Archon boss encounters
        ↓
Player must actively maintain consciousness level
        ↓
Ability loss on regression creates constant stakes
        ↓
Full integration — dream and waking merge permanently
        ↓
Player has full control in the real world
        ↓
New objective: help other avatars awaken
```

---

## 5. Player Role

The player begins as a **Higher Self consciousness**. Abilities unlock as the avatar's consciousness level rises. Abilities are lost when consciousness falls.

| Stage | Abilities |
|-------|-----------|
| Early | Dream Message, Intuition Pulse, Synchronicity Trigger |
| Mid | Clarity Burst, Probability Influence, Symbolic Vision |
| Late | Reality Layer Vision, Time Perception Shift, Dimensional Navigation |

Full ability system documented in section 5.2.

---

## 5.1 The Two Layers

The game operates on two distinct layers that the player moves between throughout the entire game.

### The Dream Layer — Direct Control

The Dream Layer is where the player has **full direct control** of the avatar.

- Top-down movement and direct interaction
- Active use of consciousness abilities
- Symbolic, surreal environments representing the avatar's inner world
- Combat or puzzle mechanics against archetypal enemies (Archon Shadows)
- No needs pressure — the dream is outside time

The Dream Layer serves three functions:
1. **Tutorial and onboarding** — the player learns the avatar's traits and capabilities
2. **Ability discovery** — new abilities are found and practiced here first
3. **End game** — as consciousness rises, the player spends more time here with full power

### The Waking Layer — Indirect Control

The Waking Layer is where the avatar lives its daily life as an AI-driven autonomous agent.

- Player cannot move the avatar directly
- Player sends signals: dreams, intuitions, synchronicities
- Avatar makes its own decisions based on traits, needs, and consciousness level
- Entropy pressure from Archons operates here
- Consciousness score governs how much influence the player has

### The Bridge

Every time the avatar goes to sleep, the player enters the Dream Layer.
Every time the avatar wakes up, the player returns to observer mode in the Waking Layer.

As consciousness rises, the boundary blurs:
- Dream imagery bleeds into waking environments
- Waking decisions begin to feel dream-like (player influence increases)
- At Level 5 — the layers merge completely

---

## 5.2 Player Ability System

Abilities unlock as consciousness rises. **Abilities are lost when consciousness falls below the unlock threshold.** This creates permanent stakes at every level of the game.

Each ability exists in two forms — a Dream form (direct, used during dream layer play) and a Waking form (indirect signal, used as Higher Self influence).

| Ability | Dream Form | Waking Form | Unlocked At |
|---------|-----------|-------------|-------------|
| Perception Burst | See hidden objects, read NPC emotional state | Synchronicity Trigger — reveal hidden patterns | Level 0 (first dream) |
| Dream Message | Send a vision to sleeping NPCs | Plant a thought in the avatar's next sleep | Level 1 |
| Intuition Pulse | Feel the right direction in any space | Nudge the avatar toward a specific action | Level 1 |
| Clarity Burst | Clear confusion, reveal true nature of obstacles | Temporarily raise avatar's perception trait | Level 2 |
| Emotional Read | See full emotional state of any character | Help the avatar connect with an NPC | Level 2 |
| Time Slow | Slow environment to observe and react | Increase likelihood of a specific action | Level 3 |
| Shadow Confrontation | Face and absorb an Archon fragment | Temporarily reduce an Archon's pressure | Level 3 |
| Reality Anchor | Lock a space in place, prevent distortion | Slow consciousness regression for one cycle | Level 4 |
| Dimensional Navigation | Move between layers of the same space | See waking world overlaid with dream symbols | Level 4 |
| Full Presence | Complete embodiment — dream IS reality | Direct Control — player takes over avatar | Level 5 |

### Ability Cost

Signal and influence abilities consume **Awareness Energy** — a secondary resource that regenerates slowly and replenishes during dreams. At low consciousness levels every signal costs more because the connection is weak. At high levels, signals flow freely.

### Regression Mechanic

When consciousness drops below a level threshold, the ability associated with that level is lost immediately. It returns when the score rises back above the threshold — but getting there requires work, and the Archons know which abilities the player is trying to recover.

---

## 5.3 The Dream Layer — Full Design

### Dream Entry

The avatar enters the dream when they go to sleep, when a Dream Message ability triggers mid-rest, or when a major insight occurs. The player takes direct control on entry.

### First Dream — Character Introduction

The first dream is the tutorial and character reveal. The player wakes up inside the dream world already in control. The environment reflects the avatar's Cosmic Blueprint — visual elements correspond to dominant traits.

The first dream teaches movement, interaction, the avatar's dominant traits (revealed through what's possible and what's difficult), and the first ability (always Perception Burst). It ends when the player finds the Dream Gate. The avatar wakes up. The player loses control for the first time.

This moment — the loss of control — is the emotional hook of the entire game.

### Dream Zones

| Dream Zone | Sephira | Consciousness Level | Symbolic Theme |
|------------|---------|-------------------|----------------|
| The Room (inner) | Malkuth | 0 | The self as it is — habit, comfort, repetition |
| The Threshold | Yesod | 1 | The edge of awareness — something stirs |
| The Mirror Maze | Hod | 2 | Logic and self-reflection — patterns revealed |
| The Garden | Netzach | 3 | Emotion, connection, beauty, longing |
| The Temple | Tiphareth | 4 | Soul alignment — the Higher Self visible |
| The Archive | Binah | 4–5 | Wisdom, understanding, the full map |
| The Void | Kether | 5 | Unity — the separation dissolves |

### Archon Shadows

Each Archon appears in the Dream Layer as a shadow — faced, understood, and integrated. They cannot be defeated by force.

| Archon Shadow | How It's Faced |
|---------------|----------------|
| Shadow of Distraction | Hold focus without moving for a sustained period |
| Shadow of Fear | Walk directly toward the expanding darkness |
| Shadow of Desire | Observe the beautiful mirage fully without following |
| Shadow of Doubt | Stand before the distorted mirror and not look away |
| Shadow of Control | Stop trying to find the door and simply wait |

Facing a Shadow permanently reduces that Archon's entropy pressure in the waking world.

---

## 6. Avatar System (AI-Driven)

The avatar is an **AI-driven autonomous agent**.

It is NOT controlled directly by the player.

Instead, the avatar:

- receives influence from the player (Higher Self)
- processes internal psychological state
- makes decisions using an LLM

---

### Dual-Layer Model

**1. Mind Layer (LLM)**
- interprets state
- evaluates internal conflict
- selects intention and action

**2. Body Layer (Game Engine)**
- executes movement
- performs interactions
- handles physics and animations

---

### Decision Model

The avatar operates on **episodic decision-making**, not continuous control.

At key moments:

1. Game builds state snapshot
2. Sends structured input to LLM
3. LLM returns decision (JSON)
4. Game executes action fully
5. Next decision only after completion or interruption

---

### Example Decision Output

```json
{
  "intent": "seek_distraction",
  "action": "check_phone",
  "reason": "The avatar feels mild anxiety and prefers an easy dopamine activity over introspection.",
  "emotion": "restless",
  "priority": 0.72,
  "interruptible": true
}
```

---

## 6.1 AI Decision System

The avatar's behavior is driven by an LLM-based decision engine.

---

### Decision Triggers

The LLM is only called when:

- avatar wakes up
- current action completes
- strong stimulus appears
- player sends signal
- internal state changes significantly

---

### Backend vs LLM (no raw numbers to the model)

The **browser** posts structured game state to `POST /api/decision`. The **server** converts needs and traits into natural language (plus optional trait *tension* from the Cosmic Blueprint placement breakdown), selects the system prompt from **consciousness level** (0–5), and only then calls the LLM.

**The LLM never receives raw numbers.** It does not see consciousness score, trait values, need meters, or any game-system vocabulary. It receives prose fields such as `needs_description` and `traits_description`, a list of allowed action IDs, and optional narrative context.

**Request payload (Phaser → backend)** — typical shape:

```json
{
  "consciousnessLevel": 1,
  "needs": {
    "hunger": 41,
    "thirst": 38,
    "fatigue": 52,
    "boredom": 72,
    "stress": 45,
    "connection_need": 36,
    "hygiene_need": 25
  },
  "traits": {
    "courage": 56,
    "discipline": 48,
    "expressiveness": 52,
    "logic": 73,
    "intuition": 59,
    "curiosity": 62,
    "empathy": 55,
    "desire": 60,
    "introspection": 50,
    "resilience": 48,
    "imagination": 45,
    "perception": 65
  },
  "traitTensions": null,
  "availableActions": ["check_phone", "look_out_window"],
  "playerSignal": null,
  "recentActions": ["sit_on_couch"],
  "significantMemory": null
}
```

`traitTensions` is optional: when present (from chart breakdown), the server describes personality **conflict** (dead-zone scores with high opposing contributions) instead of flattening everything to a single score line.

### Output Schema (backend → Phaser)

```json
{
  "action": "look_out_window",
  "thought": "first-person inner monologue",
  "reason": "one short sentence why this action",
  "unease": "optional, level 1",
  "pattern_noticed": "optional, level 2",
  "signal_response": "optional, level 3",
  "guidance": "optional, level 4",
  "state": "optional one word, level 5"
}
```

The full object should be stored in the run log for replay and UI.

### Execution Flow

```
LLM chooses action
↓
Game validates action
↓
Game executes full behavior
↓
System waits
↓
Next decision trigger
```

### Interruption Types

- Soft — ignored
- Hard — stops action
- Internal — psychological override

### Design Principle

The avatar should feel like:

- a human with habits
- partially unconscious
- influenced but not controlled

---

## 6.2 AI Architecture

The game uses a local AI model for decision-making.

---

### Stack

- Phaser (frontend)
- Node.js (backend)
- Ollama (LLM runtime)
- Hermes / Llama / Mistral (model options)

---

### Flow

```
Phaser → /api/decision → Node → Ollama → Response → Phaser
```

---

### Reasoning

- Keeps game deterministic
- Allows structured control
- Enables local/offline play
- Avoids browser limitations

---

### Note

LLM is used ONLY for:

- decision-making
- psychological reasoning

NOT for:

- movement
- physics
- rendering

---

## 7. Awareness Meter & Consciousness Progression

### 7.1 Two Distinct Systems

Before defining the meter, a critical naming distinction:

**Entropy** — a force, not a meter. Entropy is the pressure applied by Archons,
repetitive loops, avoidance behavior, and disconnection from self. It is invisible.
You observe its effects. It is never displayed directly to the player.

**The Awareness Meter** — what entropy acts on. This is the progression bar.
It measures how present and conscious the avatar is within their current level.
Entropy drains it. Insight events and genuine choices fill it.

### 7.2 The Awareness Meter

Each of the 6 consciousness levels (0–5) has its own independent Awareness Meter,
scored 0–100.

```
0 ────────────────────── 50 ────────────────────── 100
CRITICAL STATE           START                  LEVEL UP
```

Universal Rules

- Always starts at 50 — entering a level for the first time, leveling up,
  or regressing back to a level. No exceptions. 50 is always the entry point.
- Fills toward 100 — consciousness events, insight moments, genuine choices,
  player signals landing, dream completions
- Drains toward 0 — entropy pressure, repetitive loops, avoidance,
  Archon activity, stagnation
- 100 — level up threshold. Cutscene fires. New level begins at 50
- 0 — critical state begins. No immediate consequence. A sustained timer starts

The meter always spans 0–100. What changes is how much a given event fills it.

Looking out the window at Level 1: +10 points
Looking out the window at Level 4: +1 point

Growth requires increasingly deeper engagement at higher levels.

### 7.3 The Six Levels

| Level | Name | Fill difficulty | Notes |
|-------|------|----------------|-------|
| 0 | Asleep | Tutorial only | Completed by finishing the first dream. Fast by design |
| 1 | Curious | Light | First real waking loop |
| 2 | Seeking | Moderate | Requires insight chains, not just actions |
| 3 | Awakening | Hard | Rarer events needed. Shadow confrontations count |
| 4 | Alignment | Very hard | Dream completions, major insight only |
| 5 | Integration | Endgame grind | Extremely rare events. The final stretch |

### 7.4 What Fills the Meter

Major fills (insight events)

- Insight chain completes (e.g. bird → go outside thought unlocked)
- New action unlocked through insight
- Dream zone completed
- Archon Shadow faced and integrated
- NPC awakening assisted
- First time an action is taken consciously after previously doing it automatically

Minor fills (genuine choice events)

- Avatar breaks a repetitive loop with a novel action
- Player signal lands and the avatar acts on it
- Avatar produces a `pattern_noticed` response (level 2+)
- Avatar produces a `signal_response` response (level 3+)
- Need genuinely resolved rather than numbed (eating when actually hungry vs
  eating for the third time as avoidance behavior)

Passive fills

- Time spent in dream layer (passive trickle while player is in dream)
- Consecutive decisions with novel actions (no repetition in last 5)

### 7.5 What Drains the Meter

Repetition penalty (primary drain source)
Same action taken consecutively within the recent action window

```
1st time:   no drain
2nd time:   -2 points
3rd time:   -5 points
4th time:   -10 points
5th+ time:  -15 points per repeat
```

Entropy is not about what you do. It is about the pattern and quality of engagement.
The phone once is not entropy. The phone five times because you cannot choose otherwise is entropy.

Avoidance drain
When the LLM `reason` field indicates clear avoidance behavior (escaping a feeling rather than moving toward something), a small drain fires.
This requires backend analysis of the `reason` field at decision time.

Archon pressure
Each active Archon applies a passive drain rate based on the avatar's trait vulnerabilities.
Drain rate increases the longer the Archon is active without the player breaking its influence.

Stagnation drain
If the avatar cycles through the same 2–3 actions for an extended period without any novel decision or player signal landing, a slow passive drain begins.
This represents the world applying entropy as default.

Critical state amplification
Once the meter hits 0 and critical state begins, if the player fails to pull the meter back above 0, the drain rate accelerates.
The longer the critical state is sustained, the harder it becomes to recover.

### 7.6 The Critical State

When the Awareness Meter hits 0, the avatar enters Critical State.
This is not immediately a level loss — it is a warning with a sustained timer.

What happens at Critical State

- The game does not pause. The avatar continues making decisions.
- Core mechanical requirement is defined below:

Core mechanics

- A regression timer starts when the meter hits 0
- If the player manages to pull the meter above 0 before the regression timer expires, critical state ends and no level loss occurs
- If the regression timer expires while the meter remains at 0, regression fires into a level down event

Recovery window
If the player pulls the meter back above 0 before regression resolves, critical state ends.
The meter begins climbing from wherever it recovered.

The recovery window duration scales with level

- Level 1: short window — roots aren't deep, regression comes fast
- Level 4: longer window — genuine integration takes longer to dissolve

### 7.7 Level Up Event

When the meter reaches 100, a level up event fires.

The game stops. A cutscene plays — likely involving the dream layer, a symbolic visual shift, or a moment of genuine realization for the avatar.

After the cutscene, the new level begins at 50.
A new dream zone becomes accessible.
New player abilities unlock (see section 5.2).

Transition cutscenes

| Transition | Cutscene theme |
|------------|------------------|
| 0 → 1 | First dream contact — something unnamed shifts on waking |
| 1 → 2 | The avatar notices their own loop for the first time |
| 2 → 3 | Something is clearly guiding them — they can feel it |
| 3 → 4 | The avatar begins to trust the guidance |
| 4 → 5 | The separation dissolves — dream and waking merge |

### 7.8 Level Down Event

When the regression timer expires during critical state, a level down event fires.

The game stops. A cutscene plays — something dims or contracts.
An ability goes dark. The avatar returns to an earlier way of being.

After the cutscene, the previous level begins at 50.
The lost ability is unavailable until the level is regained.

### 7.9 Level 0 — Special Case

Level 0 starts at 50 like all others but has no regression.
You cannot fall below level 0. There is no lower level.

At level 0, critical state still begins when the meter hits 0, but the regression timer never resolves into a level loss.
The avatar stays in critical state until the player finds a way to break the loop and start filling the meter again.

Level 0 to Level 1 is completed by finishing the dream tutorial.
The tutorial completion fires +50 points directly, pushing from 50 to 100.
The tutorial is the onboarding, not the game.

### 7.10 Trait Influence on the Awareness Meter

Traits affect how the meter moves, not where it starts.

| Trait | Effect on meter |
|-------|------------------|
| Resilience | Larger recovery window before regression fires — harder to delevel |
| Discipline | Meter drains slower passively — stagnation drain reduced |
| Intuition | Player signals fill the meter more efficiently when they land |
| Imagination | At higher levels, harder to gain points without it — can't conceive the next step |
| Perception | Detects entropy patterns sooner — repetition penalty fires slightly later |
| Introspection | Pattern breaks (novel decisions after loops) give slightly more fill |

### 7.11 Meter Fill Rate by Level

The same event fills less meter at higher levels.
This is the primary mechanic that makes higher levels a genuine grind.

```javascript
const meterFillMultiplier = {
  0: 2.0,   // tutorial — events fill double
  1: 1.5,   // early game — generous
  2: 1.0,   // baseline
  3: 0.6,   // requires deliberate play
  4: 0.3,   // significant events only
  5: 0.15   // endgame grind
}

// Applied to every fill event:
actualFill = baseFill * meterFillMultiplier[consciousnessLevel]
```

The drain rate does NOT scale — entropy pressure is constant regardless of level.
Only the fill rate decreases.

### 7.12 Summary

```
Game starts
    ↓
Level 0 at 50
    ↓
Dream tutorial → +50 → Level 0 hits 100
    ↓
LEVEL UP CUTSCENE
    ↓
Level 1 at 50
    ↓
Waking world loop — entropy and insight compete
    ↓
Meter fills toward 100 → LEVEL UP CUTSCENE → next level at 50
    ↓          ↓
    (or)    Meter drains toward 0 → CRITICAL STATE
                ↓
            Recovery window — player fights to pull it back
                ↓              ↓
            Recovered      Timer expires
            (no loss)          ↓
                        LEVEL DOWN CUTSCENE
                            ↓
                        Previous level at 50
                        Lost ability goes dark
```

The player is never safe. Consciousness is a practice, not a destination.
The game always pushes back.

---

## 8. Archon Pressure System

The Archons are the active entropy force in the game world.
They do not simply exist — they continuously apply targeted pressure
to specific character traits in order to keep the consciousness meter low.

Each Archon exploits specific traits:

| Archon | Primary Target Traits | Method |
|--------|----------------------|--------|
| Distraction | curiosity, impulsiveness | Floods the environment with stimuli |
| Fear | courage, anxiety, stability | Exaggerates threat signals |
| Desire | desire, comfort_seeking | Amplifies reward loops |
| Doubt | intuition, logic, perception | Distorts and confuses incoming signals |
| Control | discipline, courage | Enforces rigid systems that punish deviation |

When entropy pressure from Archons exceeds the player's consciousness-building influence,
the consciousness score drops and the avatar regresses toward automatic behavior.

### The Regression Mechanic

**When consciousness drops below a level threshold, the ability associated with that level is lost.**

This is immediate, not gradual. The player had Clarity Burst. Entropy built. Score dropped from 38 to 31. Clarity Burst is gone. It returns when the score rises back above the threshold — but the Archons know which abilities the player is trying to recover.

This creates **permanent stakes at every level of the game.** Even at Level 4 with most abilities unlocked, a bad run can strip two or three of them in a single session. Consciousness is a practice, not a destination.

### Entrapment State

When the consciousness score drops below 20 and the avatar has been in an entropy loop for an extended period, an **Entrapment** state activates.

In Entrapment:
- Insight-capable actions are nearly impossible (score ×0.01)
- Loop-reinforcing actions dominate (score ×1.6)
- Player signals have minimal effect
- Dreams are fragmented and brief

Entrapment requires something unexpected to escape — a very specific vulnerability in the loop. Escape requires the right signal at the right moment, not force.

> The full Archon system is documented in section 14.

---

## 9. Cosmic Blueprint System

See `src/systems/CosmicBlueprintSystem.md` for the full specification.

<!--
Each avatar possesses a **Cosmic Blueprint** — an astrological natal chart
that defines their innate psychological tendencies as starting trait values.

This system translates planetary placements into the 12 character traits
that feed into the Consciousness Level system throughout the game.

---

## 9.1 Core Structure

```
Planet × Sign → Dignity → Weighted Trait Deltas → Starting Trait Scores
```

Every avatar starts with all traits at baseline **50**.
Planetary placements push each trait up or down from there.

---

## 9.2 Trait System

All placements contribute to **12 core traits**, organized by elemental domain.
Every trait starts at a baseline of **50**.
Traits are not inherently positive or negative — each is a dial with different
gameplay implications at low, mid, and high values.

---

### 🔥 Fire — Action / Will

| Trait | Description | Mechanical Role |
|-------|-------------|-----------------|
| Courage | Willingness to act despite discomfort or risk | Enables breaking inertia |
| Discipline | Ability to sustain action over time | Overrides impulses and habit loops |
| Impulsiveness | Tendency to act immediately without reflection | Fast response but unstable under entropy |

---

### 💨 Air — Mind / Perception

| Trait | Description | Mechanical Role |
|-------|-------------|-----------------|
| Logic | Analytical thinking, structure, reasoning | Pattern recognition, puzzle solving |
| Intuition | Sensitivity to subtle signals | Primary channel for player influence |
| Curiosity | Drive to explore, question, and learn | Consciousness growth trigger |

---

### 💧 Water — Emotion / Inner State

| Trait | Description | Mechanical Role |
|-------|-------------|-----------------|
| Empathy | Emotional connection to others | NPC interactions, relational quests |
| Anxiety | Baseline unease / anticipation of negative outcomes | Interacts with Archon of Fear |
| Desire | Pull toward pleasure, reward, attachment | Primary entropy loop trigger |

---

### 🌍 Earth — Stability / Grounding

| Trait | Description | Mechanical Role |
|-------|-------------|-----------------|
| Stability | Ability to remain grounded under change | Determines how long consciousness gains hold |
| Comfort-Seeking | Behavioral tendency to avoid discomfort | Passive entropy reinforcement |
| Perception | Environmental and self-awareness, pattern recognition | Determines how quickly avatar detects entropy traps |

---

### Trait Score Range

All traits are scored **0–100**.

- `0–20` — trait is severely underdeveloped
- `50` — neutral baseline (everyone starts here)
- `80–100` — trait strongly dominates behavior

Every trait can realistically reach both low and high values depending on chart configuration.

---

## 9.3 Planet Weights

Every avatar has all 10 standard planetary placements plus Nodes and Chiron.
Planets do not add base trait values directly — they control **how strongly**
each sign's deltas express, modulated by dignity.

| Planet | Domain | Weight |
|--------|--------|--------|
| Sun | Core identity / will | `1.0` |
| Moon | Emotional patterns | `0.9` |
| Mercury | Thinking / communication | `0.7` |
| Venus | Attraction / relationships | `0.7` |
| Mars | Action / drive | `0.8` |
| Jupiter | Expansion / beliefs | `0.6` |
| Saturn | Discipline / restriction | `0.8` |
| Uranus | Change / disruption | `0.5` |
| Neptune | Imagination / illusion | `0.6` |
| Pluto | Transformation / power | `0.7` |

Nodes and Chiron use separate rules — see section 9.6.

---

## 9.4 Sign Deltas

Signs define **signed deltas** applied to traits from the baseline of 50.

**Structure per sign:**
- Exactly **4 positive** and **4 negative** deltas
- 1 primary strength (`+12`), 2 secondary (`+8`, `+6`), 1 supporting (`+4`)
- 1 primary liability (`-8`), 2 secondary (`-6`, `-4`), 1 supporting (`-4`)
- Derived from each sign's **core psychological tension**, not elemental stereotype

Every trait can reach both high and low values across different chart configurations.

---

```javascript
export const signDeltas = {

  // Core tension: pure initiating will vs inability to sustain or consider others
  aries: {
    courage:       +12,
    impulsiveness:  +8,
    desire:         +6,
    curiosity:      +4,
    discipline:     -8,
    stability:      -6,
    empathy:        -4,
    perception:     -4
  },

  // Core tension: mastery of physical reality vs total resistance to change
  taurus: {
    stability:        +12,
    comfort_seeking:   +8,
    desire:            +6,
    discipline:        +4,
    curiosity:         -8,
    impulsiveness:     -6,
    intuition:         -4,
    anxiety:           -4
  },

  // Core tension: brilliant connective thinking vs inability to go deep or stay still
  gemini: {
    curiosity:      +12,
    impulsiveness:   +8,
    logic:           +6,
    anxiety:         +4,
    stability:       -8,
    discipline:      -6,
    empathy:         -4,
    intuition:       -4
  },

  // Core tension: profound emotional attunement vs fear-based withdrawal
  cancer: {
    empathy:          +12,
    intuition:         +8,
    comfort_seeking:   +6,
    anxiety:           +4,
    courage:           -8,
    discipline:        -6,
    logic:             -4,
    perception:        -4
  },

  // Core tension: radiant self-expression vs ego-driven need for validation
  leo: {
    courage:     +12,
    desire:       +8,
    empathy:      +6,
    stability:    +4,
    perception:   -8,
    discipline:   -6,
    anxiety:      -4,
    logic:        -4
  },

  // Core tension: extraordinary analytical ability vs self-critical perfectionism
  virgo: {
    logic:            +12,
    discipline:        +8,
    perception:        +6,
    anxiety:           +4,
    desire:            -8,
    courage:           -6,
    impulsiveness:     -4,
    comfort_seeking:   -4
  },

  // Core tension: relational attunement and fairness vs chronic indecision
  libra: {
    empathy:        +12,
    perception:      +8,
    logic:           +6,
    anxiety:         +4,
    courage:         -8,
    impulsiveness:   -6,
    discipline:      -4,
    desire:          -4
  },

  // Core tension: penetrating depth and transformation vs obsession and intensity
  scorpio: {
    intuition:        +12,
    perception:        +8,
    desire:            +6,
    discipline:        +4,
    comfort_seeking:   -8,
    impulsiveness:     -6,
    curiosity:         -4,
    anxiety:           -4
  },

  // Core tension: expansive philosophical freedom vs avoidance of depth and commitment
  sagittarius: {
    curiosity:        +12,
    courage:           +8,
    intuition:         +6,
    desire:            +4,
    discipline:        -8,
    stability:         -6,
    empathy:           -4,
    comfort_seeking:   -4
  },

  // Core tension: extraordinary discipline and mastery vs emotional suppression
  capricorn: {
    discipline:    +12,
    stability:      +8,
    perception:     +6,
    courage:        +4,
    empathy:        -8,
    curiosity:      -6,
    intuition:      -4,
    impulsiveness:  -4
  },

  // Core tension: visionary systemic perception vs emotional detachment
  aquarius: {
    logic:            +12,
    perception:        +8,
    curiosity:         +6,
    intuition:         +4,
    empathy:           -8,
    anxiety:           -6,
    comfort_seeking:   -4,
    desire:            -4
  },

  // Core tension: boundless compassion and mystical intuition vs dissolution
  pisces: {
    intuition:        +12,
    empathy:           +8,
    perception:        +6,
    comfort_seeking:   +4,
    stability:         -8,
    discipline:        -6,
    logic:             -4,
    courage:           -4
  }
}
```

---

## 9.5 Planetary Dignities

A planet's **dignity** modifies how its sign deltas express.
The same sign hits differently depending on which planet occupies it.

### The Four Dignity States

| State | Meaning | Positive Deltas | Negative Deltas |
|-------|---------|-----------------|-----------------|
| **Domicile** | Planet in its ruling sign | `× 1.25` | `× 0.90` |
| **Exaltation** | Planet in its best sign | `× 1.15` | `× 0.75` |
| **Neutral** | No special relationship | `× 1.00` | `× 1.00` |
| **Detriment** | Opposite of domicile | `× 0.75` | `× 1.20` |
| **Fall** | Opposite of exaltation | `× 0.60` | `× 1.35` |

> Dignity applies **per trait delta**, not to the planet as a whole.
> A planet in fall still contributes — it expresses through shadow.

---

### Full Dignity Table

```javascript
export const dignities = {
  sun:     { domicile: ['leo'],                    exaltation: ['aries'],
             detriment: ['aquarius'],               fall: ['libra'] },

  moon:    { domicile: ['cancer'],                 exaltation: ['taurus'],
             detriment: ['capricorn'],              fall: ['scorpio'] },

  mercury: { domicile: ['gemini', 'virgo'],        exaltation: ['virgo'],
             detriment: ['sagittarius', 'pisces'],  fall: ['pisces'] },

  venus:   { domicile: ['taurus', 'libra'],        exaltation: ['pisces'],
             detriment: ['aries', 'scorpio'],       fall: ['virgo'] },

  mars:    { domicile: ['aries', 'scorpio'],       exaltation: ['capricorn'],
             detriment: ['taurus', 'libra'],        fall: ['cancer'] },

  jupiter: { domicile: ['sagittarius', 'pisces'],  exaltation: ['cancer'],
             detriment: ['gemini', 'virgo'],        fall: ['capricorn'] },

  saturn:  { domicile: ['capricorn', 'aquarius'],  exaltation: ['libra'],
             detriment: ['cancer', 'leo'],          fall: ['aries'] },

  uranus:  { domicile: ['aquarius'],               exaltation: ['scorpio'],
             detriment: ['leo'],                    fall: ['taurus'] },

  neptune: { domicile: ['pisces'],                 exaltation: ['cancer'],
             detriment: ['virgo'],                  fall: ['capricorn'] },

  pluto:   { domicile: ['scorpio'],                exaltation: ['aries'],
             detriment: ['taurus'],                 fall: ['libra'] }
}
```

---

### Dignity Functions

```javascript
export function getDignity(planet, sign) {
  const d = dignities[planet]
  if (!d) return 'neutral'
  if (d.domicile.includes(sign))   return 'domicile'
  if (d.exaltation.includes(sign)) return 'exaltation'
  if (d.detriment.includes(sign))  return 'detriment'
  if (d.fall.includes(sign))       return 'fall'
  return 'neutral'
}

export function applyDignityToDeltas(deltas, dignity) {
  const modified = {}
  Object.entries(deltas).forEach(([trait, delta]) => {
    let m = 1.0
    if (dignity === 'domicile')   m = delta > 0 ? 1.25 : 0.90
    if (dignity === 'exaltation') m = delta > 0 ? 1.15 : 0.75
    if (dignity === 'detriment')  m = delta > 0 ? 0.75 : 1.20
    if (dignity === 'fall')       m = delta > 0 ? 0.60 : 1.35
    modified[trait] = delta * m
  })
  return modified
}
```

---

## 9.6 Nodes & Chiron

The Nodes and Chiron are not classical planets.
They follow different rules that reflect their astrological nature.
No dignity is applied to any of them.

---

### ☋ South Node — Overdeveloped Patterns

Represents default unconscious momentum and overdeveloped behavioral patterns.
These traits come too easily — they are the avatar's gravity, not its growth.

Sign deltas amplified `× 1.3`. All deltas expressed (overdevelopment has shadow sides too).

```javascript
export function southNodeContributions(sign) {
  const result = {}
  Object.entries(signDeltas[sign] ?? {}).forEach(([trait, delta]) => {
    result[trait] = delta * 1.3
  })
  return result
}
```

---

### ☊ North Node — Underdeveloped Territory

Represents the growth direction — traits the avatar has not yet built.
Its sign describes where the soul is headed, not where it already stands.

Sign deltas **inverted** at `× 0.4`. Where the sign normally gives, the North Node
creates a gap instead. These traits start lower because they are unfamiliar.

```javascript
export function northNodeContributions(sign) {
  const result = {}
  Object.entries(signDeltas[sign] ?? {}).forEach(([trait, delta]) => {
    result[trait] = delta * -0.4
  })
  return result
}
```

> The North Node gap is intentional — it represents potential not yet realized.
> As the Consciousness Level rises, North Node traits become progressively easier to develop.

---

### ⚷ Chiron — The Wound

Defines where the avatar carries psychological sensitivity.
The sign determines the flavor of the wound — not a fixed penalty,
but a reduction in that sign's full expression.

Sign deltas at `× 0.5`. No fixed values.

```javascript
export function chironContributions(sign) {
  const result = {}
  Object.entries(signDeltas[sign] ?? {}).forEach(([trait, delta]) => {
    result[trait] = delta * 0.5
  })
  return result
}
```

---

## 9.7 Final Calculation

### Formula

```
final_trait = clamp(50 + Σ contributions, 0, 100)
```

For each standard planet:
```javascript
dignity      = getDignity(planet, sign)
modDeltas    = applyDignityToDeltas(signDeltas[sign], dignity)
contribution = modDeltas[trait] × planetWeights[planet]
```

For Nodes and Chiron, use their dedicated functions (no weights, no dignities).

---

### Full Implementation

```javascript
export function calculateTraits(chart) {
  const allTraits = [
    'courage', 'discipline', 'impulsiveness',
    'logic', 'intuition', 'curiosity',
    'empathy', 'anxiety', 'desire',
    'stability', 'comfort_seeking', 'perception'
  ]

  const deltas = {}
  allTraits.forEach(t => deltas[t] = 0)

  chart.forEach(({ planet, sign }) => {
    let contributions = {}

    if (planet === 'southNode') {
      contributions = southNodeContributions(sign)
    } else if (planet === 'northNode') {
      contributions = northNodeContributions(sign)
    } else if (planet === 'chiron') {
      contributions = chironContributions(sign)
    } else {
      const weight   = planetWeights[planet]
      const dignity  = getDignity(planet, sign)
      const modified = applyDignityToDeltas(signDeltas[sign] ?? {}, dignity)
      Object.entries(modified).forEach(([trait, delta]) => {
        contributions[trait] = (contributions[trait] ?? 0) + delta * weight
      })
    }

    Object.entries(contributions).forEach(([trait, val]) => {
      if (allTraits.includes(trait)) deltas[trait] += val
    })
  })

  const scores = {}
  allTraits.forEach(t => {
    scores[t] = Math.min(100, Math.max(0, 50 + deltas[t]))
  })

  return {
    fire:  { courage: scores.courage, discipline: scores.discipline, impulsiveness: scores.impulsiveness },
    air:   { logic: scores.logic, intuition: scores.intuition, curiosity: scores.curiosity },
    water: { empathy: scores.empathy, anxiety: scores.anxiety, desire: scores.desire },
    earth: { stability: scores.stability, comfort_seeking: scores.comfort_seeking, perception: scores.perception }
  }
}
```

---

## 9.8 Trait Range Validation

All 12 traits are mathematically reachable across the full meaningful range:

| Trait | Min | Max |
|-------|-----|-----|
| Courage | 0 | 100 |
| Discipline | 10 | 100 |
| Impulsiveness | 0 | 100 |
| Logic | 21 | 100 |
| Intuition | 17 | 100 |
| Curiosity | 28 | 100 |
| Empathy | 18 | 100 |
| Anxiety | 5 | 94 |
| Desire | 17 | 100 |
| Stability | 0 | 100 |
| Comfort-Seeking | 13 | 100 |
| Perception | 25 | 100 |

Most real charts will land between 20–80 on most traits.

---

## 9.9 Trait Influence on Consciousness Meter

Traits determine how easily the Consciousness meter moves in each direction.

**Traits that help the player push the meter toward Consciousness:**

| Trait | Effect |
|-------|--------|
| Intuition | Efficiency of player signal reception |
| Perception | Speed at which avatar detects entropy patterns |
| Curiosity | Natural pull toward growth content |
| Courage | Ability to break inertia at decision moments |
| Discipline | How long consciousness gains hold before entropy erodes them |

**Traits that help Archons push the meter toward Entropy:**

| Trait | Effect |
|-------|--------|
| Comfort-Seeking | Passive entropy drift — slow and constant |
| Anxiety | Amplifies Archon of Fear pressure |
| Desire | Amplifies Archon of Desire pressure |
| Low Stability | Consciousness gains dissolve faster |
| Low Perception | Avatar doesn't notice entropy traps until already in them |

---

## 9.10 Node Design Intent

The nodal axis creates the primary dramatic tension of each avatar's journey.

- **South Node** — overdeveloped default. What the avatar collapses into under entropy pressure.
  Strong at the start, but reinforces unconscious loops.
- **North Node** — underdeveloped potential. Where the highest growth rewards live.
  Weak at the start, but strengthens as Consciousness Level rises.

The gap between South Node strength and North Node weakness
is the core psychological conflict of the avatar's story.

---

## 9.11 Example Profiles

### Chart A — Sun Libra / Moon Taurus

```json
{
  "fire":  { "courage": 62.0, "discipline": 55.1, "impulsiveness": 41.7 },
  "air":   { "logic": 76.0,   "intuition": 55.6,  "curiosity": 64.6 },
  "water": { "empathy": 59.7, "anxiety": 49.5,    "desire": 52.4 },
  "earth": { "stability": 53.2, "comfort_seeking": 56.3, "perception": 66.3 }
}
```

> Grounded logic and perception with real courage. Intuition present but not dominant —
> the growth gap (North Node Pisces) means deep intuitive perception is what this avatar
> is here to develop, not what it arrives with. South Node Virgo overdevelops logic
> and discipline as default patterns.

---

### Chart B — Sun Pisces / Moon Sagittarius

```json
{
  "fire":  { "courage": 50.5, "discipline": 22.0, "impulsiveness": 59.4 },
  "air":   { "logic": 86.6,   "intuition": 64.7,  "curiosity": 87.6 },
  "water": { "empathy": 63.8, "anxiety": 39.0,    "desire": 50.0 },
  "earth": { "stability": 11.7, "comfort_seeking": 43.0, "perception": 68.1 }
}
```

> High curiosity and logic, strong intuition and perception, but near-zero stability
> and very low discipline. High ideas, low execution. Responds well to expansive
> and conceptual player signals. Hard to guide through slow sustained effort.

---

## 9.12 Design Principle

This system is **NOT** meant to be astrologically perfect.

It **IS** meant to:
- create meaningful psychological variation between avatars
- make behavioral patterns feel coherent and readable
- ensure every trait can be genuinely high or low for different charts
- give the LLM a consistent, expressive character foundation to reason from
- make each playthrough feel like a distinct human story

---
-->

## 10. Avatar Needs System

The **Needs System** is the real-time physiological and psychological substrate
that drives avatar behavior between player signals.

Traits define *who the avatar is*.
The Consciousness Level defines *how awake it is*.
Needs define *what it is experiencing right now*.

Every LLM decision is made against the current needs state.
Archons exploit needs. Player signals compete with them.

---

## 10.1 The Seven Core Needs

All needs are scored **0–100**.

```javascript
needs = {
  hunger:          30,  // physical — rises over time
  thirst:          20,  // physical — rises faster than hunger
  fatigue:         40,  // physical — rises over time (higher = more tired)
  boredom:         50,  // psychological — the primary entropy gateway
  stress:          40,  // psychological — driven by cross-influences each tick
  connection_need: 30,  // psychological — need for connection
  hygiene_need:    25   // physical/comfort — need to feel clean
}
```

---

### 🍔 Hunger
- Rises passively over time
- Pushes toward food-related actions at high values
- Critical threshold: **80+** — overrides most other action priorities

### 💧 Thirst
- Rises passively (faster than hunger)
- Lower urgency early, critical when high
- Critical threshold: **70+** — stress and fatigue cross-effects increase

### 😴 Fatigue
- Rises passively over time (higher = more tired)
- High fatigue pushes toward rest and sleep behaviors
- Cross-effects: high thirst and high stress also increase fatigue
- Critical threshold: **65+** — tired/exhausted behaviors dominate

### 🎮 Boredom *(most important)*
- Fastest passive buildup
- The primary fork between entropy and growth
- At high values the avatar **will** seek stimulation — what stimulation depends on traits
- High curiosity → builds slower (finds own engagement)
- High impulsiveness → builds faster (needs constant novelty)
- Critical threshold: **65+** — distraction actions become dominant unless player intervenes

### 😵 Stress
- Not a passive decay — **updated each tick** via cross-influences
- Rises when: hunger high, thirst high, fatigue high, boredom high, connection_need high, hygiene_need high
- Pushes toward: avoidance, comfort behaviors, familiar loops
- Critical threshold: **80+** — avatar defaults to most entrenched comfort pattern

### 🧍 Connection Need
- Rises passively over time (isolation pressure)
- At high values: increases emotional pressure (stress) and worsens boredom
- Critical threshold: **65+** — emotional urgency and restlessness

### 🚿 Hygiene Need
- Rises passively over time
- At high values: increases discomfort via subtle stress cross-effects
- Critical threshold: **65+** — pushes self-care actions (shower/sink)

---

## 10.2 Passive Base Drift

All needs follow the unified model (0 = satisfied, 100 = critical).

Base drift is applied per **game-time minute**.
Time model: 30 real minutes = 1 in-game day.

```javascript
const BASE_DRIFT = {
  hunger:          +3.0,
  thirst:          +4.0,
  fatigue:         +2.0,
  connection_need: +1.5,
  hygiene_need:    +1.0,
  boredom:         +1.0,
  stress:          +0.5
}
```

---

## 10.3 Cross-influence Dynamics

Stress is updated inside the same `updateNeeds()` loop as every other need.
The system is directional and stable: small coefficients, then a final clamp.

```javascript
function updateNeeds(needs, deltaMinutes = 1) {
  const n = { ...needs }

  // 1. Base drift
  for (const key in BASE_DRIFT) {
    n[key] += BASE_DRIFT[key] * deltaMinutes
  }

  // 2. Cross influences
  n.stress  += n.hunger          * 0.05 * deltaMinutes
  n.boredom += n.hunger          * 0.02 * deltaMinutes

  n.fatigue += n.thirst          * 0.04 * deltaMinutes
  n.stress  += n.thirst          * 0.03 * deltaMinutes

  n.stress  += n.fatigue         * 0.06 * deltaMinutes
  n.boredom += n.fatigue         * 0.05 * deltaMinutes

  n.boredom += n.boredom         * 0.04 * deltaMinutes  // boredom compounds

  n.fatigue += n.stress          * 0.03 * deltaMinutes

  n.stress  += n.boredom         * 0.04 * deltaMinutes

  n.stress  += n.connection_need * 0.04 * deltaMinutes
  n.boredom += n.connection_need * 0.03 * deltaMinutes

  n.stress  += n.hygiene_need    * 0.03 * deltaMinutes

  // 3. Clamp (0 satisfied, 100 critical)
  for (const key in n) {
    n[key] = Math.min(100, Math.max(0, n[key]))
  }

  return n
}
```

---

## 10.4 Threshold Effects

When needs cross thresholds, they modify action weights in the LLM decision input.
Higher needs = stronger pressure = harder to override with player signals.

### Hunger

| Threshold | Label | Decision Effect |
|-----------|-------|-----------------|
| 40+ | Peckish | Food actions +0.2 weight |
| 65+ | Hungry | Food actions +0.4, focus reduced |
| 85+ | Starving | Food actions +0.7, overrides most other actions |

### Thirst

| Threshold | Label | Decision Effect |
|-----------|-------|-----------------|
| 50+ | Thirsty | Drink actions +0.2 |
| 75+ | Parched | Drink actions +0.5, stress rate increases |

### 😴 Fatigue

| Threshold | Label | Decision Effect |
|-----------|-------|-----------------|
| 40+ | Tired | Active actions -0.2, rest +0.2 |
| 65+ | Exhausted | Sleep actions +0.5, discipline checks -20 |
| 85+ | Crashing | Sleep regardless of player signals |

### Boredom

| Threshold | Label | Decision Effect |
|-----------|-------|-----------------|
| 40+ | Restless | Distraction actions +0.2 |
| 65+ | Bored | Phone/TV +0.35, window available if curiosity > 55 |
| 85+ | Deeply Bored | Any stimulation heavily weighted, player signals directly compete |

### Stress

| Threshold | Label | Decision Effect |
|-----------|-------|-----------------|
| 40+ | Tense | Avoidance behaviors +0.15 |
| 65+ | Stressed | Comfort behaviors +0.3, courage checks -15 |
| 85+ | Overwhelmed | Avatar defaults to most familiar comfort loop |

### 🧍 Connection Need

| Threshold | Label | Decision Effect |
|-----------|-------|-----------------|
| 60+ | Lonely | Connection actions +0.2 (minimal in MVP) |
| 80+ | Isolated | Emotional pressure increases, stress amplifies faster |

### 🚿 Hygiene Need

| Threshold | Label | Decision Effect |
|-----------|-------|-----------------|
| 50+ | Dirty | Shower/sink actions +0.2 |
| 65+ | Filthy | Shower/sink actions +0.4, discomfort increases |

---

## 10.5 Action Effects on Needs

Each action restores or modifies specific needs when executed.

```javascript
const actionEffects = {
  go_back_to_sleep:  { fatigue: -25, boredom: -10, hunger: +5,  stress: -10 },
  check_phone:       { boredom: -30, stress: +5,   connection_need: -10, fatigue: +2 },
  watch_tv:          { boredom: -25, stress: -5,   fatigue: +5,  connection_need: -5 },
  sit_on_bed:        { fatigue: -5,  stress: -5,   boredom: +5 },
  go_to_bathroom:    { stress: -5 },
  browse_internet:   { boredom: -20, stress: +5,   fatigue: +5 },
  read_book:         { boredom: -15, stress: -8,   fatigue: +8 },
  look_out_window:   { boredom: -20, stress: -10,  connection_need: -5 },
  // future actions
  meditate:          { stress: -25, fatigue: -10,  boredom: -10 },
  exercise:          { fatigue: -20, stress: -20,  boredom: -15, hunger: +10 },
  eat:               { hunger: -40, stress: -5,    fatigue: -5 },
  drink_water:       { thirst: -50 },
  take_shower:       { hygiene_need: -60, stress: -10 },
  use_sink:          { hygiene_need: -20, stress: -3 }
}
```

> Note: `check_phone` relieves boredom but adds stress and is socially hollow.
> `look_out_window` relieves both boredom and stress and doesn't add stress.
> This asymmetry is intentional — it's the mechanical expression of the game's central theme.

---

## 10.6 The Boredom Fork

**Boredom is the most important need for consciousness mechanics.**

At boredom 65+, the avatar **will** seek stimulation. What stimulation it seeks
depends entirely on traits. This is the primary decision fork between entropy and growth.

```javascript
function getBoredomWeights(boredom, traits) {
  if (boredom < 40) return {}  // no pressure yet

  const curiosity       = traits.curiosity / 100
  const impulsiveness   = traits.impulsiveness / 100
  const comfort_seeking = traits.comfort_seeking / 100
  const perception      = traits.perception / 100

  return {
    phone:    comfort_seeking * 0.5 + impulsiveness * 0.3,
    tv:       comfort_seeking * 0.4,
    window:   curiosity * 0.4 + perception * 0.2,
    book:     curiosity * 0.3 - impulsiveness * 0.2,
    computer: impulsiveness * 0.3
  }
}
```

### Example — Boredom at 70

**Chart 1** (curiosity 62, impulsiveness 33, comfort_seeking 44):
```
window   0.38  ← slight preference for growth action
phone    0.32
tv       0.18
book     0.12
computer 0.10
```

**Chart 2** (curiosity 100, impulsiveness 68, comfort_seeking 47):
```
window   0.55  ← strong pull toward growth (curiosity dominant)
phone    0.44  ← but impulsiveness makes phone a real competitor
computer 0.21
tv       0.19
book     0.16
```

The player's signal can shift these weights based on the current Consciousness Level.
At Level 0, the weights are nearly absolute. At Level 3+, a well-timed player signal
can tip the avatar toward the window even when phone is weighted higher.

---

## 10.7 LLM Input Schema — Updated

Needs and traits are still **computed in the game**, but the **LLM prompt** is built on the server after conversion to natural language. The consciousness **level** (0–5) picks the system prompt; numerical consciousness score is not exposed to the model.

**Backend receives** (among other fields): raw `needs`, `traits` (flat or grouped — grouped is flattened server-side), optional `traitTensions` from Cosmic Blueprint breakdown, `consciousnessLevel`, `availableActions`, optional `playerSignal`, `recentActions`, and (from level 2+) `significantMemory`.

**The model sees** assembled prose (e.g. `needs_description`, `traits_description`) and a list of action IDs — never the raw meters or trait integers.

| Setting | Value |
|--------|--------|
| Default model | `gpt-4.1-mini` (`LLM_MODEL`; set to any id your project allows) |
| Local dev | `USE_LOCAL_LLM=true` → Ollama at `OLLAMA_HOST` |
| Temperature | 0.85 |
| Max tokens | 200 |
| Response | JSON object mode |

---

## 10.8 Design Principles

**Needs create constant pressure.** The avatar is never in a neutral state.
Something is always building, always competing with player influence.

**Needs and traits interact.** The same need state produces different behavior
in different avatars. Chart 1 and Chart 2 respond differently to boredom
because their traits point them toward different stimulation.

**Cross-influences compound.** High fatigue raises stress. High stress raises fatigue. High boredom raises stress. The system self-reinforces — which is exactly what a real entropy trap does.

**Archons exploit needs.** The Archon of Distraction amplifies boredom pressure.
The Archon of Fear amplifies stress. The Archon of Desire amplifies hunger and comfort-seeking.
They don't create new needs — they make existing needs harder to manage.

**The player competes with needs, not controls them.** A player signal at Consciousness Level 1
is a nudge against real physiological and psychological pressure. Raising consciousness
means gaining more leverage over this pressure — not eliminating it.

**Boredom is the game.** It builds the fastest, it has the most interesting decision fork,
and it's the primary battleground between entropy (phone, TV) and growth (window, book).
Everything else is substrate.

---

## 11. Tree of Life Progression

The Tree of Life acts as the **consciousness progression map**.
Each Sephira corresponds to a Consciousness Level tier and unlocks new mechanics.

| Sephira | Domain | Consciousness Level |
|---------|--------|-------------------|
| Malkuth | Physical reality | 0 — Asleep |
| Yesod | Dreams and subconscious | 1 — Curious |
| Hod | Logic and pattern recognition | 2 — Seeking |
| Netzach | Emotion and relationships | 2 — Seeking |
| Tiphareth | Soul alignment | 3 — Awakening |
| Binah | Wisdom and system understanding | 4 — Alignment |
| Kether | Unity and transcendence | 5 — Integration |

---

## 12. World Structure

The game world resembles Earth but is structured symbolically.

**Zones may include:**
- Physical city environments
- Dream realms
- Symbolic archetypal landscapes
- Celestial navigation spaces
- Consciousness layers

Each zone represents a psychological or spiritual stage.
Access to deeper zones unlocks as the Consciousness Level rises.

---

## 13. NPC System

NPCs represent different Consciousness Levels.

**Types include:**
- Unaware humans (Level 0)
- Seekers (Level 1–2)
- Teachers (Level 3–4)
- Archetypal beings (Level 4–5)
- Cosmic intelligences (Level 5)

Later in the game, the player can help NPCs raise their own Consciousness Level.
NPC awakening is a key source of consciousness growth for the avatar.

---

## 14. The Archons

Archons are **agents of entropy**. They maintain systems designed to keep avatars
at Consciousness Level 0–1. Each Archon represents a distortion of a fundamental human faculty
and targets specific character traits to keep the consciousness meter suppressed.

### The Five Primary Archons

#### 1. The Archon of Distraction
- **Domain:** Attention
- **Target Traits:** curiosity (scattered), impulsiveness (hijacked)
- **Purpose:** Prevents sustained focus and reflection.
- **Mechanics:** Interrupts meditation, floods environments with noise, hides important signals.
- **Environment:** Hyperstimulating entertainment districts.
- **Boss Mechanic:** Player must stabilize attention to reveal hidden patterns.

#### 2. The Archon of Fear
- **Domain:** Survival Instinct
- **Target Traits:** courage (suppressed), anxiety (amplified), stability (eroded)
- **Purpose:** Keeps avatars trapped in safety loops.
- **Mechanics:** Exaggerates threats, discourages exploration, causes hesitation.
- **Environment:** Nightmare dream landscapes and dark cities.
- **Boss Mechanic:** Player must calm the avatar's nervous system.

#### 3. The Archon of Desire
- **Domain:** Craving
- **Target Traits:** desire (amplified), comfort_seeking (reinforced)
- **Purpose:** Traps avatars in endless pursuit of pleasure.
- **Mechanics:** Reward addiction loops, temptation events, dopamine traps.
- **Environment:** Consumer labyrinths and pleasure realms.
- **Boss Mechanic:** Player must break craving cycles.

#### 4. The Archon of Doubt
- **Domain:** Mind
- **Target Traits:** intuition (distorted), logic (confused), perception (obscured)
- **Purpose:** Weakens intuition and self-trust.
- **Mechanics:** Reduces clarity, distorts signals, confuses patterns.
- **Environment:** Fragmented knowledge libraries.
- **Boss Mechanic:** Player must restore mental coherence.

#### 5. The Archon of Control
- **Domain:** Authority
- **Target Traits:** courage (suppressed), discipline (weaponized against growth)
- **Purpose:** Maintains rigid systems of power.
- **Mechanics:** Suppresses freedom, enforces obedience, blocks awakening.
- **Environment:** Massive institutional structures.
- **Boss Mechanic:** Player must reveal hidden truths.

---

## 15. Visual Direction

**Possible visual styles:**
- Painterly mystical environments
- Stylized pixel art
- Minimal geometric symbolism

**Visual themes:**
- Sacred geometry
- Cosmic symbolism
- Dreamlike lighting
- Celestial architecture

---

## 16. MVP Prototype

### Core Features

- [ ] Room scene (top-down)
- [ ] Basic movement system
- [ ] Interactive objects
- [ ] Avatar trait system (from Cosmic Blueprint)
- [ ] Consciousness Level meter
- [ ] Decision trigger system
- [ ] LLM integration (local)
- [ ] Action execution system
- [ ] Player influence system
- [ ] Window event (first consciousness level gain)

---

### Target Experience

A 10–15 minute playable loop where:

- the avatar behaves autonomously at Consciousness Level 0
- the player influences subtly through dreams and intuition pulses
- the avatar eventually breaks a habit loop
- the first consciousness level gain occurs (Level 0 → Level 1)

---

## 16.1 MVP Level — The Room

### Concept

A closed environment representing the avatar's internal life.
The avatar starts at **Consciousness Level 0 (Asleep)** with a score of ~15.

---

### Objects

- Bed → comfort / avoidance
- Phone → distraction
- TV → passive consumption
- Computer → productivity or escape
- Treadmill → discipline
- Books → knowledge
- Notebook → reflection
- Bathroom → basic needs
- Window → awakening

---

### First Objective

**Get the avatar to look out the window.**

---

### Initial State

```json
{
  "consciousness_level": 0,
  "consciousness_score": 15,
  "traits": {
    "fire":  { "courage": 62, "discipline": 55, "impulsiveness": 42 },
    "air":   { "logic": 76, "intuition": 56, "curiosity": 65 },
    "water": { "empathy": 60, "anxiety": 50, "desire": 52 },
    "earth": { "stability": 53, "comfort_seeking": 56, "perception": 66 }
  }
}
```

### Available Actions (Initial)

```
go_back_to_sleep
check_phone
watch_tv
sit_on_bed
go_to_bathroom
browse_internet
read_book
look_out_window
```

### Expected Behavior

**Default (no player influence):**
- check phone
- go back to sleep

**Player Influence:**
- dream symbols
- intuition pulse
- synchronicity (light/sound)

### Success Condition

Avatar chooses: `look_out_window`

**Result:**
- consciousness score increases (+8)
- comfort_seeking decreases slightly
- curiosity increases slightly
- avatar reaches Consciousness Level 1 (Curious)

### First Awakening Moment

Avatar observes a bird outside.

This represents:
- first conscious deviation from habit
- first point on the Consciousness meter
- Level 0 → Level 1 transition

---

## 17. Development Philosophy

- Start small.
- Prototype systems before assets.
- Use placeholder graphics initially.
- Focus on clarity of mechanics.
- Improve visuals later.

---

## 18. Future Systems

Possible future expansions:
- Meditation mini-games
- Planetary transit effects on trait modifiers
- NPC awakening mechanics
- Multiplayer consciousness interaction
- Dynamic trait modification through behavior over time

---

## 19. Long-Term Vision

A symbolic interactive experience exploring consciousness through gameplay.

> **Unconscious Life → Awakening → Alignment → Mastery → Transcendence**

The player's journey mirrors the avatar's journey.
Guiding a consciousness to awakening is itself an act of awakening.

---

## 20. Entropy Space & Insight Systems

This section defines how game spaces, insights, and action unlocking work together to create the core gameplay experience.

---

## 20.1 Entropy Space Design

Each playable area (room, environment, or zone) is designed as a **closed entropy system**.

An Entropy Space is not just a location — it is a **behavioral trap** structured to keep the avatar operating within unconscious loops.

### Core Properties

Every Entropy Space contains:

* **Interactive Objects**
  Items the avatar can engage with (phone, TV, bed, etc.)

* **Available Actions**
  Actions the avatar can currently perform based on its awareness and unlocked thought-space

* **Hidden Actions**
  Actions that are physically possible in the environment but are not yet mentally accessible

* **Archon Pressures**
  Environmental influences tied to one or more Archons

* **Insight Triggers**
  Conditions that can generate new thoughts and unlock progression

---

### Design Principle

> The environment is not the prison — the avatar's current thought-space is.

Even if an exit exists (e.g., a door), the avatar cannot use it until the corresponding **thought** is unlocked.

---

### Archon Mapping

Each space should contain elements influenced by one or more Archons:

| Archon      | Example Objects       | Behavioral Effect                        |
| ----------- | --------------------- | ---------------------------------------- |
| Distraction | Phone, Computer       | Scattered attention, endless engagement  |
| Fear        | TV (news), dark areas | Avoidance, hesitation                    |
| Desire      | Bed, comfort zones    | Pleasure loops, stagnation               |
| Doubt       | Computer, Notebook    | Overthinking, paralysis                  |
| Control     | Desk, routines        | Rigid behavior, suppression of deviation |

Objects may map to multiple Archons depending on context.

---

## 20.2 Insight System

Insights are the primary mechanism for progression.

An **Insight** is a spontaneous realization generated by the avatar — not directly controlled by the player, but influenced by them.

---

### Insight Definition

An Insight is triggered by a combination of:

* Environmental observation
* Avatar needs (e.g., boredom, stress, social depletion)
* Avatar traits (e.g., curiosity, intuition, awareness)
* Player influence (dreams, intuition pulses, synchronicities)
* Current consciousness level

---

### Insight Flow

```
Observation → Interpretation → Thought → Action Unlock
```

---

### Example (MVP Room)

1. Avatar looks out the window
2. Notices a bird
3. Internal interpretation occurs
4. Insight emerges:
   **"I should go outside"**
5. New action unlocks: `use_door`

---

### Design Principles

* Insights must feel **earned, not forced**
* The player cannot inject thoughts directly — only influence conditions
* Insights represent **expansion of awareness**
* Multiple insights may exist per space
* Some insights may be missed or delayed depending on avatar state

---

### Insight Types (Future Expansion)

* Behavioral (e.g., "I should go outside")
* Emotional (e.g., "This isn't making me feel good")
* Cognitive (e.g., "This pattern repeats")
* Existential (e.g., "Something is guiding me")

---

## 20.3 Action Unlock System

The avatar's capabilities are not limited by the environment, but by its **available thought-space**.

---

### Action States

Every possible interaction in a space exists in one of two states:

#### 1. Available Actions

Actions the avatar can currently choose from during decision-making.

Examples:

* `check_phone`
* `watch_tv`
* `sleep`

#### 2. Hidden Actions

Actions that exist physically but are not yet mentally accessible.

Examples:

* `use_door`
* `turn_off_tv`
* `go_outside`
* `sit_in_silence`

---

### Unlock Mechanism

Hidden actions become available when:

* A relevant Insight is triggered
* Consciousness level reaches a threshold (optional)
* Certain conditions are met (needs, traits, environment)

---

### Key Principle

> The avatar cannot act on what it cannot think.

Unlocking actions represents an expansion of the avatar’s **internal possibility space**, not just gameplay progression.

---

### Action Persistence

Actions can be:

* **Local** — only available in the current space
* **Global** — carried across spaces (future system)

Examples:

| Action          | Type   |
| --------------- | ------ |
| use_door        | Local  |
| meditate        | Global |
| observe_pattern | Global |

---

## 20.4 System Interaction

These systems operate together as the core gameplay loop:

```
Avatar exists within Entropy Space
        ↓
Engages in default behavior loops
        ↓
Player applies subtle influence
        ↓
Insight conditions are met
        ↓
Insight is generated
        ↓
New action becomes available
        ↓
Avatar performs new action
        ↓
Progression occurs (new space, higher consciousness, etc.)
```

---

## 20.5 MVP Implementation — The Room

### Default State

* Avatar is trapped in loops:

  * phone
  * TV
  * bed
  * computer

* `use_door` is a hidden action

---

### Insight Trigger

Conditions:

* Avatar looks out window
* Bird is visible
* Sufficient boredom / social depletion / curiosity

---

### Result

* Insight: **"I should go outside"**
* Action unlocked: `use_door`

---

### Progression

* Avatar can now exit the room
* Consciousness score increases
* Player gains stronger influence

---

## 20.6 Design Philosophy

This system replaces traditional progression mechanics:

* No keys → **Insights**
* No ability trees → **Thought expansion**
* No forced puzzles → **Behavioral realization**

---

### Core Idea

> The game is not about solving external puzzles.
> It is about expanding the range of thoughts the avatar is capable of having.

---

This system forms the foundation of all future levels, zones, and progression mechanics.


This master file remains the core reference document.