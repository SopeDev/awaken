/**
 * Cosmic Blueprint — constants and canonical definitions.
 * Aligns with awaken-v0.3.md Section 9 (Cosmic Blueprint System).
 */

export const TRAIT_IDS = [
  'courage',
  'discipline',
  'impulsiveness',
  'logic',
  'intuition',
  'curiosity',
  'empathy',
  'anxiety',
  'desire',
  'stability',
  'comfort_seeking',
  'perception'
]

/** All traits at 50 — for testing a balanced character. */
export const BALANCED_TRAIT_SHEET = Object.fromEntries(TRAIT_IDS.map((id) => [id, 50]))

export const TRAIT_META = {
  courage:       { element: 'fire', description: 'Willingness to act despite discomfort or risk' },
  discipline:    { element: 'fire', description: 'Ability to sustain action over time' },
  impulsiveness: { element: 'fire', description: 'Tendency to act immediately without reflection' },
  logic:         { element: 'air',  description: 'Analytical thinking, structure, reasoning' },
  intuition:     { element: 'air',  description: 'Sensitivity to subtle signals' },
  curiosity:     { element: 'air',  description: 'Drive to explore, question, and learn' },
  empathy:       { element: 'water', description: 'Emotional connection to others' },
  anxiety:       { element: 'water', description: 'Baseline unease / anticipation of negative outcomes' },
  desire:        { element: 'water', description: 'Pull toward pleasure, reward, attachment' },
  stability:     { element: 'earth', description: 'Ability to remain grounded under change' },
  comfort_seeking: { element: 'earth', description: 'Tendency to avoid discomfort and stay safe' },
  perception:   { element: 'earth', description: 'Environmental and self-awareness, pattern recognition' }
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
