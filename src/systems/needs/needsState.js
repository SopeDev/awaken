/**
 * Needs state: mutable needs object, tick with game-time, action effects.
 *
 * Implements the canonical 0–100 needs model:
 * 0 = satisfied, 100 = critical
 */

import { NEED_KEYS, INITIAL_NEEDS, BASE_DRIFT, ACTION_EFFECTS } from './constants.js'

const MIN = 0
const MAX = 100

function clamp(v) {
  return Math.max(MIN, Math.min(MAX, v))
}

function updateNeeds(needs, deltaMinutes = 1) {
  const n = { ...needs }

  // 1. Base drift (neutral environment baseline)
  for (const key in BASE_DRIFT) {
    n[key] += BASE_DRIFT[key] * deltaMinutes
  }

  // 2. Cross-influences (directional, stable coefficients)
  // 🍔 Hunger
  n.stress += n.hunger * 0.05 * deltaMinutes
  n.boredom += n.hunger * 0.02 * deltaMinutes

  // 💧 Thirst
  n.fatigue += n.thirst * 0.04 * deltaMinutes
  n.stress += n.thirst * 0.03 * deltaMinutes

  // 😴 Fatigue
  n.stress += n.fatigue * 0.06 * deltaMinutes
  n.boredom += n.fatigue * 0.05 * deltaMinutes

  // 😐 Boredom
  n.stress += n.boredom * 0.04 * deltaMinutes

  // 😰 Stress
  n.fatigue += n.stress * 0.03 * deltaMinutes

  // 🧍 Connection Need
  n.stress += n.connection_need * 0.04 * deltaMinutes
  n.boredom += n.connection_need * 0.03 * deltaMinutes

  // 🚿 Hygiene Need
  n.stress += n.hygiene_need * 0.03 * deltaMinutes

  // 3. Clamp & stability
  for (const key of NEED_KEYS) {
    n[key] = clamp(n[key])
  }

  return n
}

/**
 * Create a needs state object. Mutates the returned needs in place when tick() or applyActionEffects() are called.
 */
export function createNeedsState(initial = null) {
  const needs = { ...(initial || INITIAL_NEEDS) }
  NEED_KEYS.forEach(k => {
    if (needs[k] == null) needs[k] = INITIAL_NEEDS[k]
    needs[k] = clamp(needs[k])
  })

  return {
    getNeeds() {
      return needs
    },

    /**
     * Advance needs by gameMinutes.
     * `traits` + `activeArchon` are accepted for signature compatibility (currently unused in MVP).
     */
    tick(gameMinutes, traits = null, activeArchon = null) {
      const deltaMinutes = typeof gameMinutes === 'number' ? gameMinutes : 1
      const updated = updateNeeds(needs, deltaMinutes)
      NEED_KEYS.forEach(key => {
        needs[key] = updated[key]
      })
    },

    applyActionEffects(actionId) {
      const effects = ACTION_EFFECTS[actionId]
      if (!effects) return
      for (const [key, delta] of Object.entries(effects)) {
        if (NEED_KEYS.includes(key)) {
          needs[key] = clamp(needs[key] + delta)
        }
      }
    }
  }
}
