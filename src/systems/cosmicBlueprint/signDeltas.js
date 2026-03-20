/**
 * Sign → trait deltas (Cosmic Blueprint System — v2).
 * Each sign: 4 positive (+12, +8, +6, +4) and 4 negative (-8, -6, -4, -4).
 * Contribution = signDelta × dignity modifier × planet weight (or Node/Chiron multiplier).
 */

/** @type {Record<string, Record<string, number>>} */
export const signDeltas = {
  // One defining trait per sign.
  // (Retired traits from v1 are covered by emergent rules at the usage layer.)

  aries: {
    courage: +12,
    expressiveness: +8,
    desire: +6,
    curiosity: +4,
    resilience: -8,
    introspection: -6,
    discipline: -4,
    intuition: -4
  },

  taurus: {
    resilience: +12,
    discipline: +8,
    perception: +6,
    desire: +4,
    curiosity: -8,
    imagination: -6,
    expressiveness: -4,
    empathy: -4
  },

  gemini: {
    curiosity: +12,
    imagination: +8,
    expressiveness: +6,
    logic: +4,
    resilience: -8,
    discipline: -6,
    empathy: -4,
    intuition: -4
  },

  cancer: {
    empathy: +12,
    intuition: +8,
    introspection: +6,
    resilience: +4,
    courage: -8,
    logic: -6,
    perception: -4,
    expressiveness: -4
  },

  leo: {
    expressiveness: +12,
    courage: +8,
    desire: +6,
    intuition: +4,
    introspection: -8,
    discipline: -6,
    resilience: -4,
    perception: -4
  },

  virgo: {
    discipline: +12,
    logic: +8,
    perception: +6,
    resilience: +4,
    desire: -8,
    imagination: -6,
    courage: -4,
    expressiveness: -4
  },

  libra: {
    introspection: +12,
    empathy: +8,
    logic: +6,
    resilience: +4,
    courage: -8,
    desire: -6,
    discipline: -4,
    imagination: -4
  },

  scorpio: {
    desire: +12,
    intuition: +8,
    perception: +6,
    introspection: +4,
    resilience: -8,
    expressiveness: -6,
    curiosity: -4,
    imagination: -4
  },

  sagittarius: {
    imagination: +12,
    curiosity: +8,
    courage: +6,
    intuition: +4,
    discipline: -8,
    resilience: -6,
    introspection: -4,
    empathy: -4
  },

  capricorn: {
    perception: +12,
    discipline: +8,
    resilience: +6,
    logic: +4,
    empathy: -8,
    imagination: -6,
    expressiveness: -4,
    intuition: -4
  },

  aquarius: {
    logic: +12,
    imagination: +8,
    curiosity: +6,
    perception: +4,
    empathy: -8,
    desire: -6,
    resilience: -4,
    introspection: -4
  },

  pisces: {
    intuition: +12,
    empathy: +8,
    imagination: +6,
    introspection: +4,
    discipline: -8,
    perception: -6,
    logic: -4,
    courage: -4
  }
}

/**
 * Get sign delta for a trait. Unlisted = 0.
 */
export function getSignDelta(sign, trait) {
  const deltas = signDeltas[sign]
  if (!deltas) return 0
  return trait in deltas ? deltas[trait] : 0
}
