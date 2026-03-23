/**
 * MVP Entropy System tuning constants.
 * Entropy is 0–100 (0 = stable, 100 = collapse).
 */

export const ENTROPY_MIN = 0
export const ENTROPY_MAX = 100

export const ENTROPY_START = 50

// Collapse / entrapment tuning (soft failure state).
export const COLLAPSE_THRESHOLD = 90
export const COLLAPSE_DURATION_MS = 30000
export const COLLAPSE_RECOVERY_THRESHOLD = 80

// Passive entropy drift per game minute.
// Coefficients are intentionally small so drift is gradual and tunable.
export const ENTROPY_PASSIVE_COEFFS = {
  boredom: 0.006,
  stress: 0.006,
  fatigue: 0.003,
  loneliness: 0.004,
  hunger: 0.001
}

// Player influence weakening (for future AI / signal logic).
export const SIGNAL_STRENGTH_RANGES = [
  { max: 39, multiplier: 1.0 },
  { max: 69, multiplier: 0.8 },
  { max: 89, multiplier: 0.45 },
  { max: 100, multiplier: 0.1 }
]

