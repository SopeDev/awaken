---
## 9. Cosmic Blueprint System

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
| Courage | Acts toward discomfort — approaches difficulty, breaks inertia | Enables breaking inertia |
| Discipline | Follows through consistently — sustained action under pressure | Overrides impulses and habit loops |
| Expressiveness | Initiates outwardly — communicates, acts, seeks presence | Social presence and outward momentum |

---
### 💨 Air — Mind / Perception

| Trait | Description | Mechanical Role |
|-------|-------------|-----------------|
| Logic | Reasons analytically — seeks coherence, patterns become visible | Pattern recognition, puzzle solving |
| Intuition | Detects hidden patterns — primary channel for player signals | Primary channel for player influence |
| Curiosity | Seeks the new — exploration and growth actions | Consciousness growth trigger |

---
### 💧 Water — Emotion / Inner State

| Trait | Description | Mechanical Role |
|-------|-------------|-----------------|
| Empathy | Responds to others' emotional states | NPC interactions, relational quests |
| Desire | Pursues pleasure intensely — high drive | Primary entropy loop trigger |
| Introspection | Notices own patterns — catches the loop, generates pattern_noticed | Self-observation and loop awareness |

---
### 🌍 Earth — Stability / Grounding

| Trait | Description | Mechanical Role |
|-------|-------------|-----------------|
| Resilience | Stays with discomfort without escaping | Determines how long consciousness gains hold |
| Imagination | Conceives alternatives to current situation | Enables insight and viable "otherwise" paths |
| Perception | Notices environmental details | Determines how quickly avatar detects entropy traps |

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

### Trait Set

```
🔥 Fire:   courage, discipline, expressiveness
💨 Air:    logic, intuition, curiosity
💧 Water:  empathy, desire, introspection
🌍 Earth:  resilience, imagination, perception
```

> Note: `impulsiveness`, `anxiety`, `comfort_seeking`, and `stability`
> have been retired. Their behavioral roles are now covered by:
> - impulsiveness → low resilience + low discipline (emergent)
> - anxiety → low courage + low resilience + high desire (emergent)
> - comfort_seeking → low courage + high desire (emergent)
> - stability → resilience (renamed and clarified)

---
### Primary Assignment (one defining trait per sign)

| Sign | Primary Trait |
|------|--------------|
| ♈ Aries | Courage |
| ♉ Taurus | Resilience |
| ♊ Gemini | Curiosity |
| ♋ Cancer | Empathy |
| ♌ Leo | Expressiveness |
| ♍ Virgo | Discipline |
| ♎ Libra | Introspection |
| ♏ Scorpio | Desire |
| ♐ Sagittarius | Imagination |
| ♑ Capricorn | Perception |
| ♒ Aquarius | Logic |
| ♓ Pisces | Intuition |

---
### Sign Deltas

```javascript
export const signDeltas = {

  // Core tension: fearless initiating will vs inability to sustain or consider others
  aries: {
    courage:        +12,
    expressiveness:  +8,
    desire:          +6,
    curiosity:       +4,
    resilience:      -8,
    introspection:   -6,
    discipline:      -4,
    intuition:       -4
  },

  // Core tension: deep endurance and groundedness vs total resistance to change
  taurus: {
    resilience:      +12,
    discipline:       +8,
    perception:       +6,
    desire:           +4,
    curiosity:        -8,
    imagination:      -6,
    expressiveness:   -4,
    empathy:          -4
  },

  // Core tension: brilliant connective thinking vs inability to go deep or stay still
  gemini: {
    curiosity:       +12,
    imagination:      +8,
    expressiveness:   +6,
    logic:            +4,
    resilience:       -8,
    discipline:       -6,
    empathy:          -4,
    intuition:        -4
  },

  // Core tension: profound emotional attunement vs fear-based withdrawal
  cancer: {
    empathy:         +12,
    intuition:        +8,
    introspection:    +6,
    resilience:       +4,
    courage:         -8,
    logic:            -6,
    perception:       -4,
    expressiveness:   -4
  },

  // Core tension: radiant self-expression vs ego-driven need for validation
  leo: {
    expressiveness:  +12,
    courage:          +8,
    desire:           +6,
    intuition:        +4,
    introspection:    -8,
    discipline:       -6,
    resilience:       -4,
    perception:       -4
  },

  // Core tension: extraordinary analytical precision vs self-critical perfectionism
  virgo: {
    discipline:      +12,
    logic:            +8,
    perception:       +6,
    resilience:       +4,
    desire:           -8,
    imagination:      -6,
    courage:          -4,
    expressiveness:   -4
  },

  // Core tension: seeing all sides with clarity vs chronic indecision and people-pleasing
  libra: {
    introspection:   +12,
    empathy:          +8,
    logic:            +6,
    resilience:       +4,
    courage:         -8,
    desire:          -6,
    discipline:      -4,
    imagination:     -4
  },

  // Core tension: penetrating depth and transformation vs obsession and intensity
  scorpio: {
    desire:          +12,
    intuition:        +8,
    perception:       +6,
    introspection:    +4,
    resilience:       -8,
    expressiveness:   -6,
    curiosity:        -4,
    imagination:      -4
  },

  // Core tension: expansive philosophical vision vs avoidance of depth and commitment
  sagittarius: {
    imagination:     +12,
    curiosity:        +8,
    courage:          +6,
    intuition:        +4,
    discipline:       -8,
    resilience:       -6,
    introspection:    -4,
    empathy:          -4
  },

  // Core tension: extraordinary discipline and mastery vs emotional suppression
  capricorn: {
    perception:      +12,
    discipline:       +8,
    resilience:       +6,
    logic:            +4,
    empathy:          -8,
    imagination:      -6,
    expressiveness:   -4,
    intuition:        -4
  },

  // Core tension: visionary systemic perception vs emotional detachment
  aquarius: {
    logic:           +12,
    imagination:      +8,
    curiosity:        +6,
    perception:       +4,
    empathy:          -8,
    desire:           -6,
    resilience:       -4,
    introspection:    -4
  },

  // Core tension: boundless compassion and mystical intuition vs dissolution
  pisces: {
    intuition:       +12,
    empathy:         +8,
    imagination:      +6,
    introspection:    +4,
    discipline:       -8,
    perception:       -6,
    logic:            -4,
    courage:          -4
  }
}
```

---
### Delta Range Reference

| Position | Range |
|----------|-------|
| Primary positive | +12 |
| Mid positive | +8, +6 |
| Low positive | +4 |
| Main negative | -8 |
| Mid negative | -6 |
| Low negative | -4, -4 |

---
### Net Coverage Per Trait

How each trait trends across all 12 signs combined.
Positive net = most avatars trend above 50. Negative net = most trend below 50.

| Trait | Net | Interpretation |
|-------|-----|---------------|
| Courage | +2 | Roughly balanced — varies widely by chart |
| Resilience | -8 | Slightly negative — most avatars struggle to stay with discomfort |
| Curiosity | +18 | Positive — most avatars have some curiosity |
| Empathy | 0 | Perfectly balanced — pure chart-dependent |
| Expressiveness | +4 | Slight positive — social tendency in most |
| Discipline | -8 | Slightly negative — most avatars find sustained effort hard |
| Introspection | +4 | Slight positive — some self-awareness is common |
| Desire | +8 | Positive — wanting is a default human state |
| Imagination | +8 | Positive — some imaginative capacity is common |
| Perception | +20 | Positive — awareness tends to be a strength |
| Logic | +24 | Positive — rational capacity is widespread |
| Intuition | +24 | Positive — intuitive sensing is widespread |

> Resilience and discipline trending slightly negative is intentional —
> the game is built around the difficulty of sustained conscious effort.
> Most avatars will naturally escape discomfort and fail to follow through,
> which is exactly the entropy pressure the player must work against.

---
### Behavioral Descriptions Per Trait

What high and low values produce in terms of LLM-readable avatar behavior.
Courage and resilience are intentionally adjacent but distinct — courage governs
the decision to *start* facing discomfort, resilience governs the capacity to *continue*.

| Trait | High (80–100) | Low (0–20) |
|-------|--------------|------------|
| **Courage** | Acts toward discomfort — approaches difficulty, breaks inertia | Avoids exposure — retreats to safety before even trying |
| **Resilience** | Stays with discomfort without escaping — endures pressure | Escapes discomfort quickly — collapses into comfort at first resistance |
| **Curiosity** | Seeks the new — natural pull toward exploration and growth actions | Stays with the familiar — resists anything outside the current loop |
| **Empathy** | Responds to others' emotional states — NPC interactions land | Self-contained — others' states don't register, isolation doesn't hurt |
| **Expressiveness** | Initiates outwardly — communicates, acts, seeks presence | Passive and non-initiating — observes but doesn't reach out or start |
| **Discipline** | Follows through consistently — intentions translate to sustained action | Intentions don't translate — effort starts but doesn't accumulate |
| **Introspection** | Notices own patterns — catches the loop, generates pattern_noticed | Unaware of own behavior — same loop endlessly, no self-observation |
| **Desire** | Pursues pleasure intensely — high drive, strongly motivated by reward | Low drive — indifferent to reward, not pulled strongly by anything |
| **Imagination** | Conceives alternatives to current situation — insight triggers fire easily | Concrete and literal — stays in the immediate, can't envision otherwise |
| **Perception** | Notices environmental details — reads what's actually there, catches synchronicities | Misses what's happening around them — synchronicities go unnoticed |
| **Logic** | Reasons analytically — seeks coherence, patterns become visible | Avoids structured thinking — goes by habit and feeling, contradictions ignored |
| **Intuition** | Detects hidden patterns — primary channel for player signals | Relies only on surface — player signals don't land, depth inaccessible |

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

  venus:   { domicile: ['taurus', 'libra'],       exaltation: ['pisces'],
             detriment: ['aries', 'scorpio'],        fall: ['virgo'] },

  mars:    { domicile: ['aries', 'scorpio'],      exaltation: ['capricorn'],
             detriment: ['taurus', 'libra'],         fall: ['cancer'] },

  jupiter: { domicile: ['sagittarius', 'pisces'], exaltation: ['cancer'],
             detriment: ['gemini', 'virgo'],         fall: ['capricorn'] },

  saturn:  { domicile: ['capricorn', 'aquarius'], exaltation: ['libra'],
             detriment: ['cancer', 'leo'],           fall: ['aries'] },

  uranus:  { domicile: ['aquarius'],              exaltation: ['scorpio'],
             detriment: ['leo'],                    fall: ['taurus'] },

  neptune: { domicile: ['pisces'],                exaltation: ['cancer'],
             detriment: ['virgo'],                  fall: ['capricorn'] },

  pluto:   { domicile: ['scorpio'],               exaltation: ['aries'],
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
    'courage', 'discipline', 'expressiveness',
    'logic', 'intuition', 'curiosity',
    'empathy', 'desire', 'introspection',
    'resilience', 'imagination', 'perception'
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
    fire:  { courage: scores.courage, discipline: scores.discipline, expressiveness: scores.expressiveness },
    air:   { logic: scores.logic, intuition: scores.intuition, curiosity: scores.curiosity },
    water: { empathy: scores.empathy, desire: scores.desire, introspection: scores.introspection },
    earth: { resilience: scores.resilience, imagination: scores.imagination, perception: scores.perception }
  }
}
```

---
## 9.8 Trait Range Validation

All 12 traits are scored **0–100** and are mathematically reachable within that clamp.
The sign delta design (positive/negative structure per sign) ensures every dial can become a
player-facing strength or a chart-driven friction.

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

| Factor | Effect |
|--------|--------|
| Desire | Amplifies Archon of Desire pressure |
| Low Resilience | Consciousness gains dissolve faster |
| Low Perception | Avatar doesn't notice entropy traps until already in them |
| Low Courage | Decisions are avoided; loop inertia wins |

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
## 9.11 Design Principle

This system is **NOT** meant to be astrologically perfect.

It **IS** meant to:
- create meaningful psychological variation between avatars
- make behavioral patterns feel coherent and readable
- ensure every trait can be genuinely high or low for different charts
- give the LLM a consistent, expressive character foundation to reason from
- make each playthrough feel like a distinct human story

---

