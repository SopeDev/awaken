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
  'boredom',
  'stress',
  'connection_need',
  'hygiene_need'
]

export const INITIAL_NEEDS = {
  hunger: 55,
  thirst: 55,
  fatigue: 20,
  boredom: 20,
  stress: 45,
  connection_need: 20,
  hygiene_need: 40
}

/**
 * Passive base drift per minute (neutral environment baseline).
 */
export const BASE_DRIFT = {
  hunger: 3.0,
  thirst: 4.0,
  fatigue: 2.0,
  connection_need: 1.5,
  hygiene_need: 1.0,

  // special:
  boredom: 1.0,
  stress: 1.0
}

/**
 * Action id -> delta per need (applied when action completes).
 * Deltas push needs toward 0 (restoring satisfaction).
 */
export const ACTION_EFFECTS = {
  go_back_to_sleep: { fatigue: -50 },
  check_phone: { boredom: -20, stress: 5 },
  watch_tv: { boredom: -25, stress: 5 },
  look_out_window: { boredom: -5, stress: -5, connection_need: -2.5 },
  browse_internet: { boredom: -30, stress: 5 },
  read_book: { boredom: -15, stress: -10, fatigue: 5 },
  use_treadmill: { stress: -30, fatigue: 20, hunger: 10, thirst: 20, boredom: -10, hygiene_need: 50 },
  eat_snack: { hunger: -40 },
  sit_on_couch: { fatigue: -10, stress: -5, boredom: 5 },
  drink_water: { thirst: -50 },
  take_shower: { stress: -20, hygiene_need: -60 },
  use_toilet: { hygiene_need: 5 },
  use_sink: { hygiene_need: -10 }
}
