/**
 * Planetary dignities (9.5).
 * Modifies how sign deltas express: domicile/exaltation strengthen, detriment/fall soften positives and amplify negatives.
 */

/** @type {Record<string, { domicile: string[], exaltation: string[], detriment: string[], fall: string[] }>} */
export const dignities = {
  sun:     { domicile: ['leo'],                    exaltation: ['aries'],            detriment: ['aquarius'],               fall: ['libra'] },
  moon:    { domicile: ['cancer'],                exaltation: ['taurus'],           detriment: ['capricorn'],              fall: ['scorpio'] },
  mercury: { domicile: ['gemini', 'virgo'],       exaltation: ['virgo'],            detriment: ['sagittarius', 'pisces'],   fall: ['pisces'] },
  venus:   { domicile: ['taurus', 'libra'],       exaltation: ['pisces'],           detriment: ['aries', 'scorpio'],        fall: ['virgo'] },
  mars:    { domicile: ['aries', 'scorpio'],      exaltation: ['capricorn'],        detriment: ['taurus', 'libra'],         fall: ['cancer'] },
  jupiter: { domicile: ['sagittarius', 'pisces'], exaltation: ['cancer'],           detriment: ['gemini', 'virgo'],         fall: ['capricorn'] },
  saturn:  { domicile: ['capricorn', 'aquarius'], exaltation: ['libra'],            detriment: ['cancer', 'leo'],          fall: ['aries'] },
  uranus:  { domicile: ['aquarius'],              exaltation: ['scorpio'],           detriment: ['leo'],                    fall: ['taurus'] },
  neptune: { domicile: ['pisces'],                exaltation: ['cancer'],           detriment: ['virgo'],                  fall: ['capricorn'] },
  pluto:   { domicile: ['scorpio'],               exaltation: ['aries'],            detriment: ['taurus'],                 fall: ['libra'] }
}

const DIGNITY_MULTIPLIERS = {
  domicile:   { positive: 1.25, negative: 0.90 },
  exaltation: { positive: 1.15, negative: 0.75 },
  neutral:    { positive: 1.00, negative: 1.00 },
  detriment:  { positive: 0.75, negative: 1.20 },
  fall:       { positive: 0.60, negative: 1.35 }
}

/**
 * Get dignity state for a planet in a sign.
 * @param {string} planet - e.g. 'sun', 'mars'
 * @param {string} sign - e.g. 'aries', 'libra'
 * @returns {'domicile'|'exaltation'|'neutral'|'detriment'|'fall'}
 */
export function getDignity(planet, sign) {
  const d = dignities[planet]
  if (!d) return 'neutral'
  if (d.domicile.includes(sign)) return 'domicile'
  if (d.exaltation.includes(sign)) return 'exaltation'
  if (d.detriment.includes(sign)) return 'detriment'
  if (d.fall.includes(sign)) return 'fall'
  return 'neutral'
}

/**
 * Apply dignity multipliers to sign deltas (per trait).
 * @param {Record<string, number>} deltas - sign deltas for one sign
 * @param {string} dignity - result of getDignity(planet, sign)
 * @returns {Record<string, number>} modified deltas
 */
export function applyDignityToDeltas(deltas, dignity) {
  const mult = DIGNITY_MULTIPLIERS[dignity] ?? DIGNITY_MULTIPLIERS.neutral
  const modified = {}
  for (const [trait, delta] of Object.entries(deltas)) {
    const m = delta > 0 ? mult.positive : mult.negative
    modified[trait] = delta * m
  }
  return modified
}
