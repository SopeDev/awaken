/**
 * Needs system constants — per awaken.md section 10.
 * All needs follow the unified rule:
 * 0 = satisfied, 100 = critical
 *
 * Rates are per "game minute" as passed into `updateNeeds(..., deltaMinutes)`.
 */

import { NEEDS_EFFECTS_BY_ACTION_ID } from '../../data/objectTypes.js'

export const NEED_KEYS = [
  'hunger',
  'thirst',
  'fatigue',
  'dirtiness',
  'boredom',
  'stress',
  'loneliness'
]

export const INITIAL_NEEDS = {
  hunger: 55,
  thirst: 55,
  fatigue: 20,
  dirtiness: 40,
  boredom: 20,
  stress: 30,
  loneliness: 40
}

/**
 * Passive base drift per minute (neutral environment baseline).
 */
export const BASE_DRIFT = {
  hunger: 3.0,
  thirst: 4.0,
  fatigue: 2.0,
  dirtiness: 1.0,
  loneliness: 3.0,

  // special:
  boredom: 2.0,
  stress: 1.0
}

/**
 * Action id -> delta per need (applied when action completes).
 * Deltas push needs toward 0 (restoring satisfaction).
 */
export const ACTION_EFFECTS = NEEDS_EFFECTS_BY_ACTION_ID
