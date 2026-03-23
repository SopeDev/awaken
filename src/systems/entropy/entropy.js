import {
  ENTROPY_MIN,
  ENTROPY_MAX,
  ENTROPY_START,
  COLLAPSE_THRESHOLD,
  COLLAPSE_DURATION_MS,
  COLLAPSE_RECOVERY_THRESHOLD,
  ENTROPY_PASSIVE_COEFFS,
  SIGNAL_STRENGTH_RANGES
} from './constants.js'

export function clampEntropy(value) {
  return Math.max(ENTROPY_MIN, Math.min(ENTROPY_MAX, value))
}

export function createEntropyState() {
  return {
    entropy: ENTROPY_START,
    isEntrapped: false,
    highEntropyMs: 0
  }
}

export function applyEntropyDelta(currentEntropy, delta) {
  if (typeof delta !== 'number' || !Number.isFinite(delta)) return currentEntropy
  return clampEntropy(currentEntropy + delta)
}

export function updateEntropyFromNeeds(needs, currentEntropy, deltaMinutes = 1) {
  if (!needs || typeof currentEntropy !== 'number') return currentEntropy
  if (typeof deltaMinutes !== 'number') deltaMinutes = 1

  // "Unmet pressure" is represented by how high the needs currently are (0 satisfied -> 100 critical).
  const bored = (needs.boredom ?? 0) / 100
  const stress = (needs.stress ?? 0) / 100
  const fatigue = (needs.fatigue ?? 0) / 100
  const loneliness = (needs.loneliness ?? 0) / 100
  const hunger = (needs.hunger ?? 0) / 100

  const deltaPerMinute =
    bored * ENTROPY_PASSIVE_COEFFS.boredom +
    stress * ENTROPY_PASSIVE_COEFFS.stress +
    fatigue * ENTROPY_PASSIVE_COEFFS.fatigue +
    loneliness * ENTROPY_PASSIVE_COEFFS.loneliness +
    hunger * ENTROPY_PASSIVE_COEFFS.hunger

  return clampEntropy(currentEntropy + deltaPerMinute * deltaMinutes)
}

export function getSignalStrengthMultiplier(entropy) {
  if (typeof entropy !== 'number' || !Number.isFinite(entropy)) return 1.0
  for (const range of SIGNAL_STRENGTH_RANGES) {
    if (entropy <= range.max) return range.multiplier
  }
  return 0.1
}

export function updateEntrapmentState(entropyState, deltaMs) {
  if (!entropyState) return entropyState

  const next = { ...entropyState }
  const dt = typeof deltaMs === 'number' ? deltaMs : 0

  if (next.isEntrapped) {
    // Allow recovery once entropy falls far enough.
    if (next.entropy < COLLAPSE_RECOVERY_THRESHOLD) {
      next.isEntrapped = false
      next.highEntropyMs = 0
    }
    return next
  }

  // Soft failure: must stay too high continuously.
  if (next.entropy >= COLLAPSE_THRESHOLD) {
    next.highEntropyMs += dt
    if (next.highEntropyMs >= COLLAPSE_DURATION_MS) {
      next.isEntrapped = true
    }
  } else {
    next.highEntropyMs = 0
  }

  return next
}

