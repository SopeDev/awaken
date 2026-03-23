/**
 * Needs → natural language for LLM, scaled by consciousness level.
 *
 * Contract:
 * - Level 0: only loud needs (thresholds); simplest words; one sentence ("I feel …"); "I feel fine." if none.
 * - Level 1: comma-separated phrases only (no sentence punctuation beyond commas).
 * - Levels 2–5: short sentences; needs are always all included (all 7 keys).
 * - Bucketing: five ranges over 0–100.
 */

import { NEED_KEYS } from '../needs/constants.js'

const MIN_LEVEL = 0
const MAX_LEVEL = 5

function clampLevel(level) {
  const x = Number(level)
  if (!Number.isFinite(x)) return 5
  return Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, x | 0))
}

function band5(value) {
  const v = Math.max(0, Math.min(100, Number(value) || 0))
  if (v >= 80) return 'r4'
  if (v >= 60) return 'r3'
  if (v >= 40) return 'r2'
  if (v >= 20) return 'r1'
  return 'r0'
}

/** Level 0 only: raw felt words; r0/r1 silent for all needs. */
const LEVEL0 = {
  hunger: { r2: 'a bit hungry', r3: 'hungry', r4: 'really hungry' },
  thirst: { r2: 'thirsty', r3: 'really thirsty', r4: 'so thirsty' },
  fatigue: { r2: 'tired', r3: 'really tired', r4: 'exhausted' },
  dirtiness: { r2: 'a little dirty', r3: 'dirty', r4: 'really dirty' },
  boredom: { r2: 'restless', r3: 'bored', r4: 'so bored' },
  stress: { r2: 'a bit stressed', r3: 'stressed', r4: 'really stressed' },
  loneliness: { r2: 'a bit lonely', r3: 'lonely', r4: 'really lonely' }
}

const LEVEL0_THRESHOLD = 40

/** e.g. ["a", "b", "c"] → "I feel a, b, and c." */
function joinLevel0FeelSentence(parts) {
  if (parts.length === 0) return 'I feel fine.'
  if (parts.length === 1) return `I feel ${parts[0]}.`
  if (parts.length === 2) return `I feel ${parts[0]} and ${parts[1]}.`
  const head = parts.slice(0, -1).join(', ')
  const last = parts[parts.length - 1]
  return `I feel ${head}, and ${last}.`
}

function buildLevel0NeedsDescription(needs) {
  const n = needs || {}
  const parts = []
  for (const key of NEED_KEYS) {
    const v = Math.max(0, Math.min(100, Number(n[key]) || 0))
    if (v < LEVEL0_THRESHOLD) continue
    const band = band5(v)
    const phrase = LEVEL0[key]?.[band]
    if (phrase) parts.push(phrase)
  }
  return joinLevel0FeelSentence(parts)
}

// Level 1: minimal, no punctuation other than commas between needs.
const SHORT = {
  hunger: { r0: 'not hungry', r1: 'a bit hungry', r2: 'could snack', r3: 'hungry', r4: 'ravenous' },
  thirst: { r0: 'well hydrated', r1: 'a bit dry', r2: 'thirsty', r3: 'need water soon', r4: 'parched' },
  fatigue: { r0: 'rested', r1: 'a little tired', r2: 'tired', r3: 'worn down', r4: 'exhausted' },
  boredom: { r0: 'mostly engaged', r1: 'slightly restless', r2: 'getting restless', r3: 'bored and restless', r4: 'crawling for novelty' },
  stress: { r0: 'calm', r1: 'some tension', r2: 'on edge', r3: 'pressure building', r4: 'wound tight' },
  loneliness: { r0: 'not lonely', r1: 'a little lonely', r2: 'lonely', r3: 'really lonely', r4: 'deeply lonely' },
  dirtiness: { r0: 'clean enough', r1: 'a little dirty', r2: 'dirty', r3: 'really dirty', r4: 'filthy' }
}

// Levels 2–3: simple state sentences, no deep analysis.
const LEVEL2 = {
  hunger: { r0: 'not hungry', r1: 'mildly hungry', r2: 'could snack', r3: 'hungry enough to notice', r4: 'hungry and impatient' },
  thirst: { r0: 'fine on water', r1: 'a little dry', r2: 'wanting a drink', r3: 'need water soon', r4: 'feeling parched' },
  fatigue: { r0: 'I feel rested', r1: 'I feel a little tired', r2: 'I feel tired', r3: 'I feel worn down', r4: 'I feel exhausted' },
  boredom: { r0: 'my boredom is low', r1: 'I am a bit restless', r2: 'I am getting restless', r3: 'I am bored and want something', r4: 'boredom is eating at me' },
  stress: { r0: 'I feel mostly calm', r1: 'I feel some background tension', r2: 'I am a bit on edge', r3: 'pressure is building', r4: 'I feel wound tight' },
  loneliness: { r0: 'not lonely', r1: 'a bit lonely', r2: 'loneliness is noticeable', r3: 'I feel lonely', r4: 'loneliness hurts' },
  dirtiness: { r0: 'clean enough', r1: 'a little dirty', r2: 'I feel dirty', r3: 'I feel quite dirty', r4: 'I feel filthy and urgent' }
}

// Levels 4–5: richer felt language.
const LEVEL4 = {
  hunger: {
    r0: 'food is not on my mind',
    r1: 'a small hunger registers in the background',
    r2: 'there is a gentle pull toward eating',
    r3: 'hunger is clearly present and I think about food',
    r4: 'hunger is loud and grabs most of my attention'
  },
  thirst: {
    r0: 'my mouth feels okay',
    r1: 'a slight dryness reminds me to drink',
    r2: 'I keep remembering water',
    r3: 'thirst is noticeable and a drink would help',
    r4: 'I feel parched and need water now'
  },
  fatigue: {
    r0: 'I feel steady and ready',
    r1: 'my energy feels a bit low',
    r2: 'I feel worn and slower than usual',
    r3: 'rest is starting to feel necessary',
    r4: 'exhaustion is heavy — alertness takes real effort'
  },
  boredom: {
    r0: 'I feel mostly engaged',
    r1: 'stillness is fine, but I want something different',
    r2: 'restlessness is creeping in',
    r3: 'boredom has real pull — I want stimulation',
    r4: 'boredom is eating at me — almost any change feels like relief'
  },
  stress: {
    r0: 'stress is low',
    r1: 'there is some background tightness',
    r2: 'pressure sits in me',
    r3: 'stress is strong and I feel on edge',
    r4: 'I am wound tight — small things feel sharp'
  },
  loneliness: {
    r0: 'loneliness is low',
    r1: 'loneliness brushes the edges',
    r2: 'loneliness is present in the background',
    r3: 'loneliness is active — I want someone with me',
    r4: 'loneliness hurts — I need another person'
  },
  dirtiness: {
    r0: 'dirtiness is low',
    r1: 'I feel a little dirty',
    r2: 'dirtiness is noticeable',
    r3: 'I feel dirty enough to want a reset',
    r4: 'dirtiness is urgent — I feel filthy'
  }
}

function buildBands(needs) {
  const out = {}
  for (const key of NEED_KEYS) out[key] = band5(needs?.[key] ?? 0)
  return out
}

function observeSelf(bands) {
  const fatBand = bands.fatigue
  const boreBand = bands.boredom
  const stressBand = bands.stress
  if (boreBand === 'r4' || boreBand === 'r3') return 'and I notice I keep looking for distraction.'
  if (stressBand === 'r4' || stressBand === 'r3') return 'and I notice I am trying to get relief from the edge.'
  if (fatBand === 'r4' || fatBand === 'r3') return 'and I notice I am not up for much right now.'
  return ''
}

function capitalizeRich(s) {
  const t = String(s || '').trim()
  if (!t) return t
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/**
 * @param {Record<string, number>} needs
 * @param {number} consciousnessLevel
 * @returns {string}
 */
export function buildNeedsDescription(needs, consciousnessLevel = 5) {
  const level = clampLevel(consciousnessLevel)
  const bands = buildBands(needs || {})

  if (level === 0) {
    return buildLevel0NeedsDescription(needs || {})
  }

  const shortClauses = NEED_KEYS.map((key) => SHORT[key][bands[key]]).join(', ')
  if (level === 1) return shortClauses

  const fatigueBand = bands.fatigue
  const boredomBand = bands.boredom
  const stressBand = bands.stress

  if (level === 2) {
    const first = `I am ${LEVEL2.fatigue[fatigueBand].replace(/^I feel /, '')} and ${LEVEL2.boredom[boredomBand].replace(/^I am /, '').replace(/^my /, '')}. ${LEVEL2.stress[stressBand]}.`
    const second = `Hunger is ${LEVEL2.hunger[bands.hunger]}, thirst is ${LEVEL2.thirst[bands.thirst]}, dirtiness is ${LEVEL2.dirtiness[bands.dirtiness]}, and loneliness is ${LEVEL2.loneliness[bands.loneliness]}.`
    return `${first} ${second}`
  }

  if (level === 3) {
    const obs = observeSelf(bands)
    const stress = LEVEL2.stress[stressBand]
    const obsSuffix = obs ? ` ${obs}` : '.'
    const first = `I am ${LEVEL2.fatigue[fatigueBand].replace(/^I feel /, '')} and ${LEVEL2.boredom[boredomBand].replace(/^I am /, '')}, but I notice myself responding to it. ${stress}${obsSuffix}`
    const second = `Hunger is ${LEVEL2.hunger[bands.hunger]}, thirst is ${LEVEL2.thirst[bands.thirst]}, dirtiness is ${LEVEL2.dirtiness[bands.dirtiness]}, and loneliness is ${LEVEL2.loneliness[bands.loneliness]}.`
    return `${first} ${second}`
  }

  // Levels 4–5 rich.
  const fatigueRich = LEVEL4.fatigue[fatigueBand]
  const boredomRich = LEVEL4.boredom[boredomBand]
  const stressRich = LEVEL4.stress[stressBand]

  const first = `${fatigueRich} and ${boredomRich}. ${capitalizeRich(stressRich)}.`
  const second = `In the background, ${LEVEL4.hunger[bands.hunger]}, ${LEVEL4.thirst[bands.thirst]}, ${LEVEL4.dirtiness[bands.dirtiness]}, and ${LEVEL4.loneliness[bands.loneliness]}.`
  return `${first} ${second}`
}

