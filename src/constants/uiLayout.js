/**
 * Shared UI layout constants for Phaser (content height, etc.) and React overlay.
 * Logical design size (used where fixed pixel math is still handy); game canvas uses RESIZE.
 */
export const GAME_WIDTH = 1280
export const GAME_HEIGHT = 720
/** Fallback until measured HUD height is emitted (awareness + bottom block). */
export const DEFAULT_HUD_CHROME_HEIGHT = 200
export const NEEDS_PANEL_HEIGHT = 140
export const ENTROPY_STRIP_HEIGHT = 28
/** WoW-style signal row above the awareness strip. */
export const ABILITY_BAR_HEIGHT = 56
export const ABILITY_SLOT_SIZE = 52
export const REASONING_PANEL_PADDING = 10
export const MENU_WIDTH = 48
export const NEED_ARROW_PADDING = 14
export const LABEL_WIDTH = 88
export const BAR_WIDTH = 180
export const BAR_HEIGHT = 14
export const BAR_GAP = 4

/** Space reserved for in-game clock to the right of the reasoning panel. */
export const GAME_CLOCK_PANEL_WIDTH = 104
export const GAME_CLOCK_GAP = 12

/**
 * Bottom strip: needs block, reasoning, clock (left → right).
 * @returns {{ reasoningLeft: number, reasoningWidth: number, clockLeft: number, clockWidth: number, panelTop: number }}
 */
export function getReasoningAndClockLayout() {
  const needsBlockWidth =
    LABEL_WIDTH + BAR_GAP + NEED_ARROW_PADDING + BAR_WIDTH + NEED_ARROW_PADDING
  const reasoningLeft = REASONING_PANEL_PADDING + 8 + MENU_WIDTH + needsBlockWidth + 12
  const panelTop = GAME_HEIGHT - NEEDS_PANEL_HEIGHT
  const clockWidth = GAME_CLOCK_PANEL_WIDTH
  const reasoningWidth = Math.max(
    160,
    GAME_WIDTH -
      reasoningLeft -
      REASONING_PANEL_PADDING -
      clockWidth -
      GAME_CLOCK_GAP
  )
  const clockLeft = reasoningLeft + reasoningWidth + GAME_CLOCK_GAP
  return { reasoningLeft, reasoningWidth, clockLeft, clockWidth, panelTop }
}
