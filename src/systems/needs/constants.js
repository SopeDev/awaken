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
  hunger: 30,
  thirst: 20,
  fatigue: 40,
  boredom: 50,
  stress: 40,
  connection_need: 30,
  hygiene_need: 25
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
  stress: 0.5
}

/**
 * Action id -> delta per need (applied when action completes).
 * Deltas push needs toward 0 (restoring satisfaction).
 */
export const ACTION_EFFECTS = {
  // Bedroom entropy room — action effects are in "criticality space":
  // negative deltas reduce pressure (0 = satisfied), positive deltas increase it (100 = critical)
  go_back_to_sleep: { fatigue: -30, boredom: 1, hunger: 6, thirst: 6, stress: -8 },

  // Fast boredom relief + fake connection loop:
  // boredom drops hard, connection drops a little, stress rises slightly, fatigue worsens a bit
  check_phone: { boredom: -35, stress: 2, connection_need: -2, fatigue: 3 },

  // Threat-based passive engagement:
  // boredom down, stress up, connection mostly unchanged
  watch_tv: { boredom: -25, stress: 4, fatigue: 2 },

  // Soft comfort, low progression:
  // small fatigue relief + small stress relief, boredom slightly higher/neutral
  sit_on_bed: { fatigue: -8, stress: -3, boredom: 2 },

  // Special insight action:
  // negative entropy impact (boredom + stress reduced)
  look_out_window: { boredom: -15, stress: -7, connection_need: -1, fatigue: -2 },

  // Explicit games/browsing loop:
  // boredom reduced, fatigue slightly worse, stress slightly up
  open_computer: { boredom: -22, stress: 2, fatigue: 4, connection_need: -2 },

  // Healthy-ish but not a solution:
  // moderate boredom relief, slight stress relief, low entropy impact
  read_book: { boredom: -12, stress: -3, fatigue: -1 },

  // Control object (TODO: later, consciously used treadmill can behave differently)
  use_treadmill: { stress: -8, fatigue: 10, hunger: 8, boredom: -5 },

  // Simple nourishment:
  // hunger clearly down, small stress relief, fatigue slightly better/neutral
  eat_snack: { hunger: -40, stress: -2, fatigue: -1 },

  sit_on_couch: { stress: -8, boredom: -5, fatigue: -3 },
  drink_water: { thirst: -50, stress: -3 },
  take_shower: { stress: -15, fatigue: -5, hygiene_need: -45 },
  use_toilet: { stress: -5, hygiene_need: 5 },
  use_sink: { stress: -3, hygiene_need: -18 }
}
