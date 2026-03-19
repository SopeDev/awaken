/**
 * Global action registry. Actions are scene-agnostic; each targets an object type and has duration + label.
 * Used by any scene that supports interactions (e.g. Room). Needs system uses action ids for ACTION_EFFECTS.
 */

export const ACTIONS = {
  check_phone: {
    objectTypeId: 'phone',
    durationMs: 10000,
    label: 'check my phone',
    // Loop reinforcer: fast boredom relief but increases repetition risk
    loopReinforcing: true,
    repetitionRisk: 'high',
    // Simple meta so UI/LLM can reason without implementing Archons yet
    entropyDelta: +10
  },
  go_back_to_sleep: {
    objectTypeId: 'bed',
    durationMs: 75000,
    label: 'go back to sleep',
    loopReinforcing: false,
    repetitionRisk: 'medium',
    avoidancePositive: true,
    entropyDelta: +5
  },
  look_out_window: {
    objectTypeId: 'window',
    durationMs: 2500,
    label: 'look out the window',
    insightCapable: true,
    loopReinforcing: false,
    repetitionRisk: 'low',
    entropyDelta: -8
  },
  watch_tv: {
    objectTypeId: 'tv',
    durationMs: 18750,
    label: 'watch TV',
    loopReinforcing: true,
    repetitionRisk: 'high',
    entropyDelta: +8
  },
  sit_on_bed: {
    objectTypeId: 'bed',
    durationMs: 37500,
    label: 'sit on the bed',
    loopReinforcing: false,
    repetitionRisk: 'low',
    entropyDelta: +2
  },
  open_computer: {
    objectTypeId: 'computer',
    durationMs: 37500,
    label: 'open the computer',
    loopReinforcing: true,
    repetitionRisk: 'medium',
    entropyDelta: +7,
    // TODO: later we can split "conscious browsing" vs compulsive scrolling
    archonTags: ['distraction', 'doubt']
  },
  read_book: {
    objectTypeId: 'books',
    durationMs: 31250,
    label: 'read a book',
    loopReinforcing: false,
    repetitionRisk: 'low',
    entropyDelta: -2
  },
  use_treadmill: {
    objectTypeId: 'treadmill',
    durationMs: 18750,
    label: 'use the treadmill',
    loopReinforcing: false,
    repetitionRisk: 'medium',
    entropyDelta: -1,
    // TODO: later if "used consciously" this can become lower-entropy
    archonTags: ['control', 'discipline']
  },
  eat_snack: {
    objectTypeId: 'refrigerator',
    durationMs: 12500,
    label: 'get a snack',
    loopReinforcing: false,
    repetitionRisk: 'low',
    entropyDelta: 0
  },
  sit_on_couch: {
    objectTypeId: 'couch',
    durationMs: 18750,
    label: 'sit on the couch',
    loopReinforcing: false,
    repetitionRisk: 'low',
    entropyDelta: +1
  },
  drink_water: { objectTypeId: 'water_dispenser', durationMs: 6250, label: 'get some water', loopReinforcing: false, repetitionRisk: 'low', entropyDelta: 0 },
  take_shower: { objectTypeId: 'shower', durationMs: 15000, label: 'take a shower', loopReinforcing: false, repetitionRisk: 'low', entropyDelta: -2 },
  use_toilet: { objectTypeId: 'toilet', durationMs: 6250, label: 'use the bathroom', loopReinforcing: false, repetitionRisk: 'low', entropyDelta: 0 },
  use_sink: { objectTypeId: 'sink', durationMs: 10000, label: 'use the sink', loopReinforcing: false, repetitionRisk: 'low', entropyDelta: -1 },
  meditate: { objectTypeId: 'couch', durationMs: 25000, label: 'meditate on the couch', insightCapable: true, loopReinforcing: false, repetitionRisk: 'low', entropyDelta: -6 }
}

export const AVAILABLE_ACTION_IDS = Object.keys(ACTIONS)

/** Duration (ms) to tween avatar to target. */
export const MOVE_DURATION = 600

/** Default duration (ms) when an action has no durationMs. */
export const INTERACTION_DURATION = 800

export function getActionLabel(actionId) {
  const a = ACTIONS[actionId]
  return a ? a.label : actionId.replace(/_/g, ' ')
}
