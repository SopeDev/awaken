/**
 * Cosmic Blueprint — constants and canonical definitions.
 * Aligns with awaken-v0.3.md Section 9 (Cosmic Blueprint System).
 */

export const TRAIT_IDS = [
  'courage',
  'discipline',
  'expressiveness',
  'logic',
  'intuition',
  'curiosity',
  'empathy',
  'desire',
  'introspection',
  'resilience',
  'imagination',
  'perception'
]

/** All traits at 50 — for testing a balanced character. */
export const BALANCED_TRAIT_SHEET = Object.fromEntries(TRAIT_IDS.map((id) => [id, 50]))

export const TRAIT_META = {
  courage: { element: 'fire', description: 'Acts toward discomfort — approaches difficulty and breaks inertia' },
  discipline: { element: 'fire', description: 'Follows through consistently — sustained action under pressure' },
  expressiveness: { element: 'fire', description: 'Initiates outwardly — communicates, acts, seeks presence' },

  logic: { element: 'air', description: 'Reasons analytically — seeks coherence and visible patterns' },
  intuition: { element: 'air', description: 'Detects hidden patterns — primary channel for player signals' },
  curiosity: { element: 'air', description: 'Seeks the new — exploration and growth actions' },

  empathy: { element: 'water', description: 'Responds to others emotional states — relational resonance' },
  desire: { element: 'water', description: 'Pursues pleasure intensely — strongly motivated by reward' },
  introspection: { element: 'water', description: 'Notices own patterns — catches the loop and names it' },

  resilience: { element: 'earth', description: 'Stays with discomfort without escaping — endures pressure' },
  imagination: { element: 'earth', description: 'Conceives alternatives — insight triggers possibilities' },
  perception: { element: 'earth', description: 'Notices environmental details — reads what is actually there' }
}

export const PLANETS = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'northNode',
  'southNode',
  'chiron'
]

export const SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
]

/** Planet weights (9.3) — standard planets only. Nodes and Chiron use separate rules (9.6). */
export const PLANET_WEIGHTS = {
  sun: 1.0,
  moon: 0.9,
  mercury: 0.7,
  venus: 0.7,
  mars: 0.8,
  jupiter: 0.6,
  saturn: 0.8,
  uranus: 0.5,
  neptune: 0.6,
  pluto: 0.7
}

/** Default trait score when chart has no net effect (add/subtract from this). */
export const BASELINE_TRAIT_SCORE = 50

/** Clamp final trait scores to this range (9.2, 9.6). */
export const TRAIT_MIN = 0
export const TRAIT_MAX = 100
