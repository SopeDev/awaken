/**
 * Shared labels for post-action primary/secondary outcome classification.
 * Used by characterEngine and server-side unconscious_loop derivation.
 */

export const NEED_RESULT_HELPED_A_LOT = 'helped_a_lot'
export const NEED_RESULT_HELPED_A_LITTLE = 'helped_a_little'
export const NEED_RESULT_NO_MEANINGFUL_HELP = 'no_meaningful_help'
export const NEED_RESULT_GOT_WORSE = 'got_worse'
export const NEED_RESULT_NOT_APPLICABLE = 'not_applicable'

export const NEED_FAILURE_RESULTS = new Set([
  NEED_RESULT_NO_MEANINGFUL_HELP,
  NEED_RESULT_GOT_WORSE
])

export function isPrimaryOutcomeFailure(primaryResult) {
  return NEED_FAILURE_RESULTS.has(primaryResult)
}

/** Bodily needs used for direct-care exemption (`bodilyTargets` on actions). */
export const BODILY_PRIMARY_KEYS = Object.freeze(['hunger', 'thirst', 'fatigue', 'dirtiness'])

export const BODILY_PRIMARY_KEY_SET = new Set(BODILY_PRIMARY_KEYS)
