/**
 * Needs system constants — per awaken.md section 10.
 * All needs follow the unified rule:
 * 0 = satisfied, 100 = critical
 *
 * Rates are per "game minute" as passed into `updateNeeds(..., deltaMinutes)`.
 */

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
export const ACTION_EFFECTS = {
  go_to_sleep: { fatigue: -45, stress: -5 },
  check_phone: { boredom: -18, loneliness: -6, stress: 6 },
  watch_tv: { boredom: -22, loneliness: -3, stress: 4 },
  look_out_window: { boredom: -6, stress: -6, loneliness: -8 },
  browse_internet: { boredom: -26, loneliness: -5, stress: 7 },
  read_book: { boredom: -14, stress: -12, fatigue: 4 },
  use_treadmill: { stress: -22, boredom: -12, fatigue: 18, hunger: 8, thirst: 18, dirtiness: 35 },
  eat_snack: { hunger: -40, thirst: 4 },
  sit_on_couch: { fatigue: -8, stress: -6, boredom: 4, loneliness: 2 },
  drink_water: { thirst: -45, hunger: -3 },
  take_shower: { dirtiness: -60, stress: -18 },
  use_sink: { dirtiness: -12, stress: -2 }
}
