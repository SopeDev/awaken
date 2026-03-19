import { NEED_KEYS } from './constants.js'

export const NEED_LABELS = {
  hunger: 'Hunger',
  thirst: 'Thirst',
  fatigue: 'Fatigue',
  boredom: 'Boredom',
  stress: 'Stress',
  connection_need: 'Connection',
  hygiene_need: 'Hygiene'
}

const GOOD_THRESHOLD = 40
const MID_THRESHOLD = 65

// Bar fill colors used by the needs UI.
export function getNeedFillColor(needKey, value) {
  if (!NEED_KEYS.includes(needKey)) return 0xa55a5a
  const v = value == null ? 50 : value

  const GREEN = 0x4a7c59
  const OLIVE = 0x8a8a3a
  const RED = 0xa55a5a

  // Unified convention:
  // - lower is better (0 satisfied = GREEN)
  // - higher is worse  (100 critical = RED)
  if (v <= GOOD_THRESHOLD) return GREEN
  if (v <= MID_THRESHOLD) return OLIVE
  return RED
}

