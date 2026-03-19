/**
 * Sign → trait deltas (9.4).
 * Each sign: 4 positive (+12, +8, +6, +4) and 4 negative (-8, -6, -4, -4).
 * Contribution = signDelta × dignity modifier × planet weight (or Node/Chiron multiplier).
 */

/** @type {Record<string, Record<string, number>>} */
export const signDeltas = {
  aries: {
    courage: +12,
    impulsiveness: +8,
    desire: +6,
    curiosity: +4,
    discipline: -8,
    stability: -6,
    empathy: -4,
    perception: -4
  },
  taurus: {
    stability: +12,
    comfort_seeking: +8,
    desire: +6,
    discipline: +4,
    curiosity: -8,
    impulsiveness: -6,
    intuition: -4,
    anxiety: -4
  },
  gemini: {
    curiosity: +12,
    impulsiveness: +8,
    logic: +6,
    anxiety: +4,
    stability: -8,
    discipline: -6,
    empathy: -4,
    intuition: -4
  },
  cancer: {
    empathy: +12,
    intuition: +8,
    comfort_seeking: +6,
    anxiety: +4,
    courage: -8,
    discipline: -6,
    logic: -4,
    perception: -4
  },
  leo: {
    courage: +12,
    desire: +8,
    empathy: +6,
    stability: +4,
    perception: -8,
    discipline: -6,
    anxiety: -4,
    logic: -4
  },
  virgo: {
    logic: +12,
    discipline: +8,
    perception: +6,
    anxiety: +4,
    desire: -8,
    courage: -6,
    impulsiveness: -4,
    comfort_seeking: -4
  },
  libra: {
    empathy: +12,
    perception: +8,
    logic: +6,
    anxiety: +4,
    courage: -8,
    impulsiveness: -6,
    discipline: -4,
    desire: -4
  },
  scorpio: {
    intuition: +12,
    perception: +8,
    desire: +6,
    discipline: +4,
    comfort_seeking: -8,
    impulsiveness: -6,
    curiosity: -4,
    anxiety: -4
  },
  sagittarius: {
    curiosity: +12,
    courage: +8,
    intuition: +6,
    desire: +4,
    discipline: -8,
    stability: -6,
    empathy: -4,
    comfort_seeking: -4
  },
  capricorn: {
    discipline: +12,
    stability: +8,
    perception: +6,
    courage: +4,
    empathy: -8,
    curiosity: -6,
    intuition: -4,
    impulsiveness: -4
  },
  aquarius: {
    logic: +12,
    perception: +8,
    curiosity: +6,
    intuition: +4,
    empathy: -8,
    anxiety: -6,
    comfort_seeking: -4,
    desire: -4
  },
  pisces: {
    intuition: +12,
    empathy: +8,
    perception: +6,
    comfort_seeking: +4,
    stability: -8,
    discipline: -6,
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
