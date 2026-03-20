/**
 * Trait tension — conflict signal per trait from per-placement contributions.
 * See trait-tension-system.md
 */

import { TRAIT_IDS } from './constants.js'

export const TRAIT_COMMUNICATION_MODES = {
  STANDARD: 'STANDARD',
  STANDARD_TENSION: 'STANDARD_TENSION',
  CONFLICT_ONLY: 'CONFLICT_ONLY',
  MILD_CONFLICT: 'MILD_CONFLICT',
  SILENCE: 'SILENCE'
}

/** From trait-tension-system.md — high = mode 3, mild = mode 4 */
export const CONFLICT_DESCRIPTIONS = {
  courage: {
    high: 'capacity to act is real but something in my identity works against it — I know what I should do, I hesitate anyway',
    mild: 'slight tension between stepping forward and holding back'
  },
  resilience: {
    high: 'pulled between enduring pressure and escaping it — neither consistently grounded nor consistently fragile',
    mild: 'endurance wavers — I hold sometimes, collapse at others'
  },
  curiosity: {
    high: 'curiosity fires then gets suppressed — I start exploring, then pull back to the familiar',
    mild: 'slight pull toward the new that gets interrupted by preference for the known'
  },
  empathy: {
    high: 'pulled between deep attunement to others and withdrawal into myself — the connection is real but costly',
    mild: 'slight tension between connecting and staying contained'
  },
  expressiveness: {
    high: 'the impulse to initiate and express fights the pull to stay quiet and observe',
    mild: 'slight pull between reaching out and holding back'
  },
  discipline: {
    high: 'strong drive toward structure fights an equally strong resistance to constraint — I start with intention, lose momentum, cycle between focus and drift',
    mild: 'structure and resistance pull in roughly equal directions — follow-through is inconsistent'
  },
  introspection: {
    high: 'self-awareness cycles — moments of sharp pattern recognition followed by complete opacity to my own behavior',
    mild: 'slight pull toward self-examination that doesn\'t always complete'
  },
  desire: {
    high: 'intensity of wanting is present but consistently suppressed — there is more underneath than gets expressed',
    mild: 'mild tension between pursuing what I want and holding back'
  },
  imagination: {
    high: 'the concrete mind and the visionary mind fight — I stay literal most of the time but the alternative view breaks through unpredictably',
    mild: 'slight pull toward imagining alternatives that gets overridden by preference for what\'s real'
  },
  perception: {
    high: 'observational acuity cycles — sometimes I read the environment sharply, sometimes I completely miss what\'s there',
    mild: 'perception is present but not consistent — I notice selectively'
  },
  logic: {
    high: 'analytical clarity fights emotional interference — I reason well when calm, lose the thread under pressure',
    mild: 'slight tension between structured thinking and going by feel'
  },
  intuition: {
    high: 'subtle signal reception is present but blocked — I sense things then second-guess or dismiss them',
    mild: 'slight pull toward reading beneath the surface that doesn\'t always trust itself'
  }
}

/**
 * @param {number} score 0–100
 * @param {number} tension
 */
export function getTraitCommunicationMode(score, tension) {
  const inDeadZone = score > 40 && score < 60

  if (!inDeadZone) {
    if (tension >= 6) return TRAIT_COMMUNICATION_MODES.STANDARD_TENSION
    return TRAIT_COMMUNICATION_MODES.STANDARD
  }

  if (tension >= 10) return TRAIT_COMMUNICATION_MODES.CONFLICT_ONLY
  if (tension >= 6) return TRAIT_COMMUNICATION_MODES.MILD_CONFLICT
  return TRAIT_COMMUNICATION_MODES.SILENCE
}

/**
 * Strongest single positive and most negative contributions per trait.
 * @param {Record<string, { contributions: Array<{ contribution: number }> }>} breakdown from getTraitSheetBreakdown
 * @returns {Record<string, number>} trait id -> tension
 */
export function computeTraitTensionsFromBreakdown(breakdown) {
  const out = {}
  for (const trait of TRAIT_IDS) {
    const contribs = breakdown[trait]?.contributions?.map((c) => c.contribution) ?? []
    let maxPos = 0
    let minNeg = 0
    for (const v of contribs) {
      if (v > maxPos) maxPos = v
      if (v < minNeg) minNeg = v
    }
    out[trait] = Math.min(maxPos, Math.abs(minNeg))
  }
  return out
}
