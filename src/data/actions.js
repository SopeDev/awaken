/**
 * Global action registry. Actions are scene-agnostic; each targets an object type and has duration + label.
 * Used by any scene that supports interactions (e.g. Room). Needs system uses action ids for ACTION_EFFECTS.
 */

export const ACTIONS = {
  check_phone: {
    objectTypeId: 'phone',
    durationMs: 10000,
    label: 'check my phone',
    loopReinforcing: true,
    repetitionRisk: 'high',
    habituationRate: 0.70,
    habituationNeeds: ['boredom']
  },
  go_back_to_sleep: {
    objectTypeId: 'bed',
    durationMs: 75000,
    label: 'go back to sleep',
    loopReinforcing: false,
    repetitionRisk: 'medium',
    avoidancePositive: true,
    habituationRate: 0.85,
    habituationNeeds: []
  },
  look_out_window: {
    objectTypeId: 'window',
    durationMs: 2500,
    label: 'look out the window',
    insightCapable: true,
    loopReinforcing: false,
    repetitionRisk: 'low',
    habituationRate: 0.95,
    habituationNeeds: ['boredom']
  },
  watch_tv: {
    objectTypeId: 'tv',
    durationMs: 18750,
    label: 'watch TV',
    loopReinforcing: true,
    repetitionRisk: 'high',
    habituationRate: 0.7,
    habituationNeeds: ['boredom']
  },
  browse_internet: {
    objectTypeId: 'computer',
    durationMs: 37500,
    label: 'browse the internet',
    loopReinforcing: true,
    repetitionRisk: 'medium',
    archonTags: ['distraction', 'doubt'],
    habituationRate: 0.7,
    habituationNeeds: ['boredom']
  },
  read_book: {
    objectTypeId: 'books',
    durationMs: 31250,
    label: 'read a book',
    loopReinforcing: false,
    repetitionRisk: 'low',
    habituationRate: 0.95,
    habituationNeeds: ['boredom', 'stress']
  },
  use_treadmill: {
    objectTypeId: 'treadmill',
    durationMs: 18750,
    label: 'use the treadmill',
    loopReinforcing: false,
    repetitionRisk: 'medium',
    archonTags: ['control', 'discipline'],
    habituationRate: 0.95,
    habituationNeeds: ['stress', 'boredom']
  },
  eat_snack: {
    objectTypeId: 'refrigerator',
    durationMs: 12500,
    label: 'get a snack',
    loopReinforcing: false,
    repetitionRisk: 'low',
    habituationRate: 1.0,
    habituationNeeds: []
  },
  sit_on_couch: {
    objectTypeId: 'couch',
    durationMs: 18750,
    label: 'sit on the couch',
    loopReinforcing: false,
    repetitionRisk: 'low',
    habituationRate: 0.9,
    habituationNeeds: ['stress']
  },
  drink_water: { objectTypeId: 'water_dispenser', durationMs: 6250, label: 'get some water', loopReinforcing: false, repetitionRisk: 'low', habituationRate: 1.0, habituationNeeds: [] },
  take_shower: { objectTypeId: 'shower', durationMs: 15000, label: 'take a shower', loopReinforcing: false, repetitionRisk: 'low', habituationRate: 0.95, habituationNeeds: ['stress'] },
  use_toilet: { objectTypeId: 'toilet', durationMs: 6250, label: 'use the bathroom', loopReinforcing: false, repetitionRisk: 'low', habituationRate: 1.0, habituationNeeds: [] },
  use_sink: { objectTypeId: 'sink', durationMs: 10000, label: 'use the sink', loopReinforcing: false, repetitionRisk: 'low', habituationRate: 1.0, habituationNeeds: [] },
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
