/**
 * Generate final trait sheet (0–100) from a Cosmic Blueprint chart.
 * Aligns with awaken-v0.3.md Section 9.7.
 *
 * Standard planets: dignity → applyDignityToDeltas(signDeltas[sign], dignity) → contribution = modified × planetWeight
 * South Node: signDeltas[sign] × 1.3
 * North Node: signDeltas[sign] × -0.4
 * Chiron: signDeltas[sign] × 0.5
 * final_trait = clamp(50 + Σ contributions, 0, 100)
 */

import { TRAIT_IDS, PLANET_WEIGHTS, BASELINE_TRAIT_SCORE, TRAIT_MIN, TRAIT_MAX } from './constants.js'
import { signDeltas } from './signDeltas.js'
import { getDignity, applyDignityToDeltas } from './dignities.js'

const SOUTH_NODE_MULTIPLIER = 1.3
const NORTH_NODE_MULTIPLIER = -0.4
const CHIRON_MULTIPLIER = 0.5

const PLANET_ALIASES = {
  sun: 'sun',
  moon: 'moon',
  mercury: 'mercury',
  venus: 'venus',
  mars: 'mars',
  jupiter: 'jupiter',
  saturn: 'saturn',
  uranus: 'uranus',
  neptune: 'neptune',
  pluto: 'pluto',
  'north node': 'northNode',
  'south node': 'southNode',
  chiron: 'chiron'
}

const SIGN_ALIASES = {
  aries: 'aries',
  taurus: 'taurus',
  gemini: 'gemini',
  cancer: 'cancer',
  leo: 'leo',
  virgo: 'virgo',
  libra: 'libra',
  scorpio: 'scorpio',
  sagittarius: 'sagittarius',
  capricorn: 'capricorn',
  aquarius: 'aquarius',
  pisces: 'pisces'
}

/**
 * Get contributions for one placement (all traits).
 * @param {string} planet
 * @param {string} sign
 * @returns {Record<string, number>}
 */
export function getPlacementContributions(planet, sign) {
  const deltas = signDeltas[sign]
  if (!deltas) return {}

  if (planet === 'southNode') {
    const out = {}
    for (const [trait, delta] of Object.entries(deltas)) {
      out[trait] = delta * SOUTH_NODE_MULTIPLIER
    }
    return out
  }

  if (planet === 'northNode') {
    const out = {}
    for (const [trait, delta] of Object.entries(deltas)) {
      out[trait] = delta * NORTH_NODE_MULTIPLIER
    }
    return out
  }

  if (planet === 'chiron') {
    const out = {}
    for (const [trait, delta] of Object.entries(deltas)) {
      out[trait] = delta * CHIRON_MULTIPLIER
    }
    return out
  }

  const weight = PLANET_WEIGHTS[planet]
  if (weight == null) return {}

  const dignity = getDignity(planet, sign)
  const modified = applyDignityToDeltas(deltas, dignity)
  const out = {}
  for (const [trait, value] of Object.entries(modified)) {
    out[trait] = value * weight
  }
  return out
}

export function normalizePlanet(raw) {
  if (!raw || typeof raw !== 'string') return null
  const key = raw.trim().toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/'s\s+/, ' ')
  return PLANET_ALIASES[key] || PLANET_ALIASES[key.replace(/\s+/g, ' ')] || null
}

export function normalizeSign(raw) {
  if (!raw || typeof raw !== 'string') return null
  const key = raw.trim().toLowerCase()
  return SIGN_ALIASES[key] || null
}

export function parseChartFromText(text) {
  const placements = []
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

  for (const line of lines) {
    const match = line.match(/^[-*]?\s*(?:the\s+)?(.+?)\s+is\s+in\s+(.+?)\.?$/i)
    if (!match) continue

    let planetLabel = match[1].trim().toLowerCase().replace(/^the\s+/, '')
    const signLabel = match[2].trim()

    if (planetLabel.includes('north node')) {
      planetLabel = 'north node'
    } else if (planetLabel.includes('south node')) {
      planetLabel = 'south node'
    } else {
      planetLabel = planetLabel.replace(/'s\s+.*$/, '')
    }

    const planet = normalizePlanet(planetLabel)
    const sign = normalizeSign(signLabel)
    if (planet && sign) {
      placements.push({ planet, sign })
    }
  }

  return placements
}

/**
 * Build trait sheet from chart placements (9.7).
 * @param {Array<{ planet: string, sign: string }>} chart
 * @returns {Record<string, number>} Trait id -> 0–100 score
 */
export function generateTraitSheet(chart) {
  const raw = {}
  for (const id of TRAIT_IDS) {
    raw[id] = 0
  }

  for (const { planet, sign } of chart) {
    const contributions = getPlacementContributions(planet, sign)
    for (const [trait, value] of Object.entries(contributions)) {
      if (TRAIT_IDS.includes(trait)) {
        raw[trait] += value
      }
    }
  }

  const scores = {}
  for (const id of TRAIT_IDS) {
    const value = BASELINE_TRAIT_SCORE + raw[id]
    scores[id] = Math.round(Math.max(TRAIT_MIN, Math.min(TRAIT_MAX, value)))
  }

  return scores
}

export function generateTraitSheetFromText(chartText) {
  const chart = parseChartFromText(chartText)
  return generateTraitSheet(chart)
}

/**
 * Get a full breakdown of how each trait score was computed.
 * @param {Array<{ planet: string, sign: string }>} chart
 */
export function getTraitSheetBreakdown(chart) {
  const breakdown = {}
  for (const trait of TRAIT_IDS) {
    breakdown[trait] = { contributions: [], rawSum: 0, normalized: 0, final: 0 }
  }

  for (const { planet, sign } of chart) {
    const contributions = getPlacementContributions(planet, sign)
    for (const [trait, value] of Object.entries(contributions)) {
      if (!TRAIT_IDS.includes(trait)) continue
      let detail
      if (planet === 'southNode') {
        detail = { planet, sign, modifier: 'southNode×1.3', contribution: value }
      } else if (planet === 'northNode') {
        detail = { planet, sign, modifier: 'northNode×-0.4', contribution: value }
      } else if (planet === 'chiron') {
        detail = { planet, sign, modifier: 'chiron×0.5', contribution: value }
      } else {
        const dignity = getDignity(planet, sign)
        detail = { planet, sign, dignity, weight: PLANET_WEIGHTS[planet], contribution: value }
      }
      breakdown[trait].contributions.push(detail)
      breakdown[trait].rawSum += value
    }
  }

  for (const id of TRAIT_IDS) {
    breakdown[id].normalized = BASELINE_TRAIT_SCORE + breakdown[id].rawSum
    breakdown[id].final = Math.round(Math.max(TRAIT_MIN, Math.min(TRAIT_MAX, breakdown[id].normalized)))
  }

  return breakdown
}
