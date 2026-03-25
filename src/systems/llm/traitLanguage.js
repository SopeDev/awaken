/**
 * Traits -> natural language for LLM, scaled by consciousness level.
 *
 * Contract:
 * - Level 0: return null (traits omitted from user prompt).
 * - Level 1-2: 2-3 plain behavioral observations only.
 * - Level 3: casual conflict language (tension system, but not clinical).
 * - Level 4-5: full tension + score-band phrasing (rich current design).
 */

import { TRAIT_IDS } from '../cosmicBlueprint/constants.js'
import {
  CONFLICT_DESCRIPTIONS,
  getTraitCommunicationMode,
  TRAIT_COMMUNICATION_MODES
} from '../cosmicBlueprint/traitTension.js'
import { phraseForTraitScore } from './traitScorePhrases.js'

export function flattenTraits(traits) {
  if (!traits || typeof traits !== 'object') return {}
  const first = Object.values(traits)[0]
  if (first && typeof first === 'object' && !Array.isArray(first) && typeof first.courage !== 'number') {
    const out = {}
    for (const group of Object.values(traits)) {
      if (group && typeof group === 'object') Object.assign(out, group)
    }
    return out
  }
  return { ...traits }
}

function clampLevel(level) {
  const x = Number(level)
  if (!Number.isFinite(x)) return 5
  return Math.max(0, Math.min(5, x | 0))
}

function ensureSentenceEnd(s) {
  const t = String(s || '').trim()
  if (!t) return t
  if (/[.!?]['"]?$/u.test(t)) return t
  return `${t}.`
}

function capitalizeFirst(s) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function lowerFirst(s) {
  if (!s) return s
  return s.charAt(0).toLowerCase() + s.slice(1)
}

function buildTraitsDescriptionRich(scores, tensions) {
  const flat = flattenTraits(scores)
  const pieces = []

  for (const trait of TRAIT_IDS) {
    const score = flat[trait] ?? 50
    const tension = tensions?.[trait] ?? 0
    const mode = getTraitCommunicationMode(score, tension)

    if (mode === TRAIT_COMMUNICATION_MODES.SILENCE) continue

    const c = CONFLICT_DESCRIPTIONS[trait]
    if (mode === TRAIT_COMMUNICATION_MODES.CONFLICT_ONLY && c) {
      pieces.push(capitalizeFirst(c.high))
      continue
    }
    if (mode === TRAIT_COMMUNICATION_MODES.MILD_CONFLICT && c) {
      pieces.push(capitalizeFirst(c.mild))
      continue
    }

    const line = phraseForTraitScore(trait, score)
    if (!line) continue

    if (mode === TRAIT_COMMUNICATION_MODES.STANDARD) {
      pieces.push(capitalizeFirst(line))
      continue
    }

    if (mode === TRAIT_COMMUNICATION_MODES.STANDARD_TENSION && c) {
      pieces.push(`${capitalizeFirst(line)} Still, ${lowerFirst(c.mild)}`)
    }
  }

  if (pieces.length === 0) {
    return 'Nothing in my personality stands out sharply right now — I feel fairly ordinary in how I move through the world.'
  }

  return pieces.map(ensureSentenceEnd).join(' ')
}

function buildTraitsDescriptionLevel2(scores, tensions) {
  const flat = flattenTraits(scores)
  const t = tensions || {}

  const courage = flat.courage ?? 50
  const discipline = flat.discipline ?? 50
  const curiosity = flat.curiosity ?? 50
  const logic = flat.logic ?? 50
  const perception = flat.perception ?? 50

  const candidates = []
  const push = (trait, strength) => candidates.push({ trait, strength })

  if (logic >= 65) push('logic', logic)
  if (curiosity >= 65) push('curiosity', curiosity)
  if (perception >= 65) push('perception', perception)

  const disciplineTension = t.discipline ?? 0
  if (discipline <= 35 || disciplineTension >= 6) {
    push('discipline', (100 - discipline) + disciplineTension * 0.5)
  }

  const courageTension = t.courage ?? 0
  if (courage <= 35 || courageTension >= 6) {
    push('courage', (100 - courage) + courageTension * 0.5)
  }

  candidates.sort((a, b) => b.strength - a.strength)
  const top = candidates.slice(0, 3)

  const lines = []
  for (const { trait } of top) {
    if (trait === 'logic') lines.push('I tend to overthink things')
    else if (trait === 'discipline') lines.push('I often start something and fail to finish it')
    else if (trait === 'curiosity') lines.push('I get drawn to new things easily')
    else if (trait === 'courage') lines.push('I hold back more than I probably should')
    else if (trait === 'perception') lines.push('I notice a lot of what is around me')
  }

  if (lines.length === 0) {
    return 'Right now, nothing about me stands out — I just go with the moment.'
  }

  return lines.map(ensureSentenceEnd).join(' ')
}

function buildTraitsDescriptionLevel3(scores, tensions) {
  const flat = flattenTraits(scores)
  const t = tensions || {}

  const candidates = []
  for (const trait of TRAIT_IDS) {
    const score = flat[trait] ?? 50
    const tension = t[trait] ?? 0
    const mode = getTraitCommunicationMode(score, tension)

    if (mode === TRAIT_COMMUNICATION_MODES.SILENCE) continue
    if (tension < 6) continue

    candidates.push({ trait, tension, mode })
  }

  candidates.sort((a, b) => b.tension - a.tension)
  const top = candidates.slice(0, 4)

  const casual = {
    courage: {
      high: 'I keep wanting to step forward, but I hesitate and talk myself out of it',
      mild: 'Part of me wants to go, but I also hold back'
    },
    discipline: {
      high: 'I start with intention, but my follow-through breaks down',
      mild: 'I am inconsistent with follow-through'
    },
    expressiveness: {
      high: 'I want to reach out and show up, but I pull back into quiet observation',
      mild: 'I reach out and then hold back'
    },
    logic: {
      high: 'I can reason clearly for a moment, then lose the thread under pressure',
      mild: 'Structured thinking and feelings tug on me at the same time'
    },
    intuition: {
      high: 'Something feels true inside, but I second-guess myself and dismiss it',
      mild: 'I sense things beneath the surface, then I do not fully trust it'
    },
    curiosity: {
      high: 'I reach for the new, then I pull back to what feels familiar',
      mild: 'There is a pull toward novelty, but it gets interrupted'
    },
    empathy: {
      high: 'I feel connected to others, but it costs me and I retreat',
      mild: 'I feel pulled between connecting and staying contained'
    },
    desire: {
      high: 'I want things, but something keeps holding me back',
      mild: 'I want what I want, but I restrain myself'
    },
    introspection: {
      high: 'I notice patterns in myself, then I lose track again',
      mild: 'I look at myself briefly, and then it slips away'
    },
    resilience: {
      high: 'I can endure for a bit, then I escape and try to get away',
      mild: 'I endure sometimes, but other times I fold'
    },
    imagination: {
      high: 'I can see alternatives, but I revert to what is concrete',
      mild: 'I try to imagine alternatives, but reality overrides them'
    },
    perception: {
      high: 'I notice details sharply and then suddenly miss what is right there',
      mild: 'My perception is patchy — I notice selectively'
    }
  }

  const lines = []
  for (const { trait, mode } of top) {
    const entry = casual[trait]
    if (!entry) continue
    const pick = mode === TRAIT_COMMUNICATION_MODES.CONFLICT_ONLY ? entry.high : entry.mild
    lines.push(pick)
  }

  if (lines.length === 0) return null
  return lines.map(ensureSentenceEnd).join(' ')
}

/**
 * @param {number} consciousnessLevel 0-5
 * @param {Record<string, number>} scores flat trait 0-100
 * @param {Record<string, number>|null|undefined} tensions per-trait tension
 * @returns {string|null}
 */
export function buildTraitsDescription(consciousnessLevel, scores, tensions) {
  const level = clampLevel(consciousnessLevel)
  if (level === 0) return null
  if (level <= 2) return buildTraitsDescriptionLevel2(scores, tensions)
  if (level === 3) return buildTraitsDescriptionLevel3(scores, tensions)
  return buildTraitsDescriptionRich(scores, tensions)
}

