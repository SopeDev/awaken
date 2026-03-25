/** Cooldowns (ms, game time via Phaser scene.time.now). */
export const DIRECTIONAL_PULL_COOLDOWN_MS = 5000
export const INTUITION_PULSE_COOLDOWN_MS = 15000
export const SYNCHRONICITY_COOLDOWN_MS = 30000

/** Mid-action synchronicity notice roll (primed raises p, does not force notice). */
export const SYNCHRONICITY_NOTICE_PERCEPTION_THRESHOLD = 68
export const SYNCHRONICITY_NOTICE_BOREDOM_THRESHOLD = 60
export const SYNCHRONICITY_NOTICE_LEVEL_MIN = 2
export const SYNCHRONICITY_NOTICE_BASE_CHANCE = 0.18
export const SYNCHRONICITY_NOTICE_PRIMED_CHANCE = 0.48

export const AVATAR_PHASE = {
  AWAITING: 'awaiting',
  WALKING: 'walking',
  PERFORMING: 'performing'
}
