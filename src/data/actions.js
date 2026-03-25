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
    habituationNeeds: ['boredom', 'loneliness']
  },
  go_to_sleep: {
    objectTypeId: 'bed',
    durationMs: 75000,
    label: 'go to sleep',
    loopReinforcing: false,
    repetitionRisk: 'medium',
    avoidancePositive: true,
    habituationRate: 0.90,
    habituationNeeds: ['fatigue', 'stress']
  },
  go_outside: {
    objectTypeId: 'door',
    durationMs: 3500,
    label: 'go outside',
    loopReinforcing: false,
    repetitionRisk: 'low',
    habituationRate: 1.0,
    habituationNeeds: []
  },
  look_out_window: {
    objectTypeId: 'window',
    durationMs: 2500,
    label: 'look out the window',
    insightCapable: true,
    loopReinforcing: false,
    repetitionRisk: 'low',
    habituationRate: 0.98,
    habituationNeeds: ['boredom', 'loneliness']
  },
  watch_tv: {
    objectTypeId: 'tv',
    durationMs: 18750,
    label: 'watch TV',
    loopReinforcing: true,
    repetitionRisk: 'high',
    habituationRate: 0.75,
    habituationNeeds: ['boredom', 'loneliness']
  },
  browse_internet: {
    objectTypeId: 'computer',
    durationMs: 37500,
    label: 'browse the internet',
    loopReinforcing: true,
    repetitionRisk: 'medium',
    archonTags: ['distraction', 'doubt'],
    habituationRate: 0.70,
    habituationNeeds: ['boredom', 'loneliness']
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
    habituationRate: 0.92,
    habituationNeeds: ['stress', 'fatigue']
  },
  drink_water: { objectTypeId: 'water_dispenser', durationMs: 6250, label: 'get some water', loopReinforcing: false, repetitionRisk: 'low', habituationRate: 1.0, habituationNeeds: [] },
  take_shower: { objectTypeId: 'shower', durationMs: 15000, label: 'take a shower', loopReinforcing: false, repetitionRisk: 'low', habituationRate: 0.96, habituationNeeds: ['stress'] },
  use_sink: { objectTypeId: 'sink', durationMs: 10000, label: 'use the sink', loopReinforcing: false, repetitionRisk: 'low', habituationRate: 0.98, habituationNeeds: ['stress'] },
}

export const AVAILABLE_ACTION_IDS = Object.keys(ACTIONS)

/** A–Z for LLM prompts and any non-LLM fallback (not `Object.keys` order). */
export const AVAILABLE_ACTION_IDS_ALPHABETICAL = [...AVAILABLE_ACTION_IDS].sort((a, b) =>
  a.localeCompare(b, undefined, { sensitivity: 'base' })
)

/** When the decision API cannot be used — uniform random, not score-weighted. */
export function pickUniformRandomActionId(allowedIds) {
  const list =
    Array.isArray(allowedIds) && allowedIds.length
      ? [...allowedIds]
      : [...AVAILABLE_ACTION_IDS_ALPHABETICAL]
  return list[Math.floor(Math.random() * list.length)]
}

/** Duration (ms) to tween avatar to target. */
export const MOVE_DURATION = 600

/** Default duration (ms) when an action has no durationMs. */
export const INTERACTION_DURATION = 800

export function getActionLabel(actionId) {
  const a = ACTIONS[actionId]
  return a ? a.label : actionId.replace(/_/g, ' ')
}

/** Past-tense first verb for activity diary lines (e.g. "watch TV" → "watched TV"). */
const IRREGULAR_PAST_VERB = {
  go: 'went',
  get: 'got',
  sit: 'sat',
  take: 'took',
  read: 'read',
}

export function imperativeLabelToPastPhrase(imperativeLabel) {
  const s = String(imperativeLabel || '').trim()
  if (!s) return s
  const parts = s.split(/\s+/)
  const firstRaw = parts[0]
  const first = firstRaw.toLowerCase()
  const rest = parts.slice(1)
  let past = IRREGULAR_PAST_VERB[first]
  if (!past) {
    past = first.endsWith('e') ? `${first}d` : `${first}ed`
  }
  return [past, ...rest].join(' ')
}

export function getActionPastPhrase(actionId) {
  return imperativeLabelToPastPhrase(getActionLabel(actionId))
}
