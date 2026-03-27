/**
 * Global object type registry. Same object types can appear in multiple scenes/layouts.
 * Each type has a canonical id and default grid size (used when building layout instances).
 */

/**
 * Canonical object registry.
 *
 * This file is intended to be the shared source of truth for:
 * - object geometry (`gridW/gridH`)
 * - hidden-depth flag (`hasHiddenDepth`)
 * - intuition focus wording (`intuitionFocusPhrase`)
 * - which action targets the object (`actionId`, `action` metadata including `durationMs` from `ACTION_DURATION_MS`)
 * - action effects on needs (`needsEffects`) keyed by need keys
 * - synchronicity felt text (`synchronicityNote`, only when `hasHiddenDepth` is true)
 * - `action.bodilyTargets`: bodily needs this action directly cares for (unconscious_loop exemption)
 *
 * Room-specific positioning remains in `src/data/roomData.js`.
 */

/**
 * Standard interaction lengths (ms).
 * Micro — look_out_window, go_outside, drink_water
 * Quick — eat_snack, sit_on_couch, scroll_phone
 * Medium — watch_tv, browse_internet, read_book, take_shower
 * Long — use_treadmill, go_to_sleep
 */
export const ACTION_DURATION_MS = Object.freeze({
  MICRO: 2500,
  QUICK: 5000,
  MEDIUM: 10000,
  LONG: 15000
})

export const OBJECT_TYPES = {
  bed: {
    gridW: 3,
    gridH: 2,
    interactionSide: 'top',
    actionId: 'go_to_sleep',
    action: {
      durationMs: ACTION_DURATION_MS.LONG,
      bodilyTargets: ['fatigue'],
      label: 'go to sleep',
      loopReinforcing: false,
      repetitionRisk: 'medium',
      avoidancePositive: true,
      habituationRate: 0.9,
      habituationNeeds: ['fatigue', 'stress']
    },
    needsEffects: { fatigue: -45, stress: -5 }
  },
  phone: {
    gridW: 1,
    gridH: 1,
    interactionSide: 'right',
    hasHiddenDepth: true,
    actionId: 'scroll_phone',
    action: {
      durationMs: ACTION_DURATION_MS.QUICK,
      bodilyTargets: [],
      label: 'scroll my phone',
      loopReinforcing: true,
      repetitionRisk: 'high',
      habituationRate: 0.7,
      habituationNeeds: ['boredom', 'loneliness']
    },
    needsEffects: { boredom: -18, loneliness: -6, stress: 6 },
    intuitionFocusPhrase: 'phone',
    synchronicityNote: '*Something on my phone gives me a strange feeling*'
  },
  tv: {
    gridW: 1,
    gridH: 2,
    interactionSide: 'right',
    hasHiddenDepth: true,
    actionId: 'watch_tv',
    action: {
      durationMs: ACTION_DURATION_MS.MEDIUM,
      bodilyTargets: [],
      label: 'watch TV',
      loopReinforcing: true,
      repetitionRisk: 'high',
      habituationRate: 0.75,
      habituationNeeds: ['boredom', 'loneliness']
    },
    needsEffects: { boredom: -22, loneliness: -3, stress: 4 },
    intuitionFocusPhrase: 'TV',
    synchronicityNote: '*Something on TV stops me for a moment*'
  },
  treadmill: {
    gridW: 2,
    gridH: 1,
    interactionSide: 'left',
    actionId: 'use_treadmill',
    action: {
      durationMs: ACTION_DURATION_MS.LONG,
      bodilyTargets: [],
      label: 'use the treadmill',
      loopReinforcing: false,
      repetitionRisk: 'medium',
      archonTags: ['control', 'discipline'],
      habituationRate: 0.95,
      habituationNeeds: ['stress', 'boredom']
    },
    needsEffects: {
      stress: -22,
      boredom: -12,
      fatigue: 18,
      hunger: 8,
      thirst: 18,
      dirtiness: 35
    }
  },
  computer: {
    gridW: 1,
    gridH: 2,
    interactionSide: 'left',
    hasHiddenDepth: true,
    actionId: 'browse_internet',
    action: {
      durationMs: ACTION_DURATION_MS.MEDIUM,
      bodilyTargets: [],
      label: 'browse the internet',
      loopReinforcing: true,
      repetitionRisk: 'medium',
      archonTags: ['distraction', 'doubt'],
      habituationRate: 0.7,
      habituationNeeds: ['boredom', 'loneliness']
    },
    needsEffects: { boredom: -26, loneliness: -5, stress: 7 },
    intuitionFocusPhrase: 'screen',
    synchronicityNote: '*Something on the screen catches my eye — a pattern I did not expect*'
  },
  books: {
    gridW: 2,
    gridH: 1,
    interactionSide: 'top',
    hasHiddenDepth: true,
    actionId: 'read_book',
    action: {
      durationMs: ACTION_DURATION_MS.MEDIUM,
      bodilyTargets: [],
      label: 'read a book',
      loopReinforcing: false,
      repetitionRisk: 'low',
      habituationRate: 0.95,
      habituationNeeds: ['boredom', 'stress']
    },
    needsEffects: { boredom: -14, stress: -12, fatigue: 4 },
    intuitionFocusPhrase: 'book',
    synchronicityNote: 'A passage about birds lands differently. I glance toward the window.'
  },
  window: {
    gridW: 2,
    gridH: 1,
    interactionSide: 'bottom',
    hasHiddenDepth: true,
    actionId: 'look_out_window',
    action: {
      durationMs: ACTION_DURATION_MS.MICRO,
      bodilyTargets: [],
      label: 'look out the window',
      insightCapable: true,
      loopReinforcing: false,
      repetitionRisk: 'low',
      habituationRate: 0.98,
      habituationNeeds: ['boredom', 'loneliness']
    },
    needsEffects: { boredom: -6, stress: -6, loneliness: -8 },
    intuitionFocusPhrase: 'window',
    synchronicityNote: 'A bird lands on the sill. Something about it feels important.'
  },
  door: {
    gridW: 1,
    gridH: 1,
    interactionSide: 'top',
    actionId: 'go_outside',
    action: {
      durationMs: ACTION_DURATION_MS.MICRO,
      bodilyTargets: [],
      label: 'go outside',
      loopReinforcing: false,
      repetitionRisk: 'low',
      habituationRate: 1.0,
      habituationNeeds: []
    }
  },
  refrigerator: {
    gridW: 1,
    gridH: 1,
    interactionSide: 'right',
    actionId: 'eat_snack',
    action: {
      durationMs: ACTION_DURATION_MS.QUICK,
      bodilyTargets: ['hunger'],
      label: 'get a snack',
      loopReinforcing: false,
      repetitionRisk: 'low',
      habituationRate: 1.0,
      habituationNeeds: []
    },
    needsEffects: { hunger: -40, thirst: 4 }
  },
  couch: {
    gridW: 1,
    gridH: 2,
    interactionSide: 'left',
    hasHiddenDepth: true,
    actionId: 'sit_on_couch',
    action: {
      durationMs: ACTION_DURATION_MS.QUICK,
      bodilyTargets: [],
      label: 'sit on the couch',
      loopReinforcing: false,
      repetitionRisk: 'low',
      habituationRate: 0.92,
      habituationNeeds: ['stress', 'fatigue']
    },
    needsEffects: { fatigue: -8, stress: -6, boredom: 4, loneliness: 2 },
    intuitionFocusPhrase: 'couch',
    synchronicityNote: '*A sound from outside catches my attention*'
  },
  water_dispenser: {
    gridW: 1,
    gridH: 1,
    interactionSide: 'right',
    actionId: 'drink_water',
    action: {
      durationMs: ACTION_DURATION_MS.MICRO,
      bodilyTargets: ['thirst'],
      label: 'get some water',
      loopReinforcing: false,
      repetitionRisk: 'low',
      habituationRate: 1.0,
      habituationNeeds: []
    },
    needsEffects: { thirst: -45, hunger: -3 }
  },
  shower: {
    gridW: 2,
    gridH: 1,
    interactionSide: 'bottom',
    actionId: 'take_shower',
    action: {
      durationMs: ACTION_DURATION_MS.MEDIUM,
      bodilyTargets: ['dirtiness'],
      label: 'take a shower',
      loopReinforcing: false,
      repetitionRisk: 'low',
      habituationRate: 0.96,
      habituationNeeds: ['stress']
    },
    needsEffects: { dirtiness: -60, stress: -18 }
  }
}

export const OBJECT_TYPE_IDS = Object.keys(OBJECT_TYPES)

export function getObjectType(id) {
  return OBJECT_TYPES[id] || null
}

function deriveActionDefsByActionId() {
  const out = {}
  for (const [objectTypeId, type] of Object.entries(OBJECT_TYPES)) {
    if (!type?.actionId || !type?.action) continue
    if (typeof type.action.durationMs !== 'number') {
      throw new Error(
        `objectTypes: "${objectTypeId}" action "${type.actionId}" must set action.durationMs (use ACTION_DURATION_MS.*)`
      )
    }
    out[type.actionId] = {
      objectTypeId,
      ...type.action
    }
  }
  return out
}

export const ACTION_DEFS_BY_ACTION_ID = deriveActionDefsByActionId()

export const NEEDS_EFFECTS_BY_ACTION_ID = Object.freeze(
  Object.fromEntries(
    Object.entries(OBJECT_TYPES)
      .filter(([, type]) => type?.actionId && type?.needsEffects)
      .map(([, type]) => [type.actionId, type.needsEffects])
  )
)

export const SYNCHRONICITY_NOTE_BY_ACTION_ID = Object.freeze(
  Object.fromEntries(
    Object.entries(OBJECT_TYPES)
      .filter(
        ([, type]) =>
          type?.actionId &&
          type?.synchronicityNote &&
          type?.hasHiddenDepth === true
      )
      .map(([, type]) => [type.actionId, type.synchronicityNote])
  )
)

export const BODILY_TARGETS_BY_ACTION_ID = Object.freeze(
  Object.fromEntries(
    Object.entries(OBJECT_TYPES)
      .filter(([, type]) => type?.actionId)
      .map(([, type]) => [
        type.actionId,
        Object.freeze(
          Array.isArray(type.action?.bodilyTargets) ? [...type.action.bodilyTargets] : []
        )
      ])
  )
)
