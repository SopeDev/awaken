/**
 * Shared session limits and in-game clock (wall clock in the fiction).
 * One full in-game day = REAL_MS_PER_IN_GAME_DAY of real time at 1× speed.
 */

/** Recent action ids + reasoning log both cap at this length. */
export const RECENT_DECISION_HISTORY_MAX = 20

export const REAL_MS_PER_IN_GAME_DAY = 15 * 60 * 1000
export const IN_GAME_DAY_MINUTES = 24 * 60

/** Minute-of-day the UI clock shows at session start (7:00 AM). */
export const IN_GAME_CLOCK_START_MINUTES = 7 * 60

/**
 * @param {number} minutesOfDayFloat fractional minutes 0–1440 (wraps)
 * @returns {string} e.g. "7:05 AM"
 */
export function formatInGameClock(minutesOfDayFloat) {
  const m = ((minutesOfDayFloat % IN_GAME_DAY_MINUTES) + IN_GAME_DAY_MINUTES) % IN_GAME_DAY_MINUTES
  const h24 = Math.floor(m / 60)
  const min = Math.floor(m % 60)
  const am = h24 < 12
  let h12 = h24 % 12
  if (h12 === 0) h12 = 12
  return `${h12}:${String(min).padStart(2, '0')} ${am ? 'AM' : 'PM'}`
}
