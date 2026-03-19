import {
  GAME_WIDTH,
  GAME_HEIGHT,
  NEEDS_PANEL_HEIGHT,
  MENU_WIDTH,
  REASONING_PANEL_PADDING,
  LABEL_WIDTH,
  BAR_WIDTH,
  BAR_GAP,
  NEED_ARROW_PADDING
} from '../constants/uiLayout.js'

const needsBlockWidth = LABEL_WIDTH + BAR_GAP + NEED_ARROW_PADDING + BAR_WIDTH + NEED_ARROW_PADDING
const reasoningLeft = REASONING_PANEL_PADDING + 8 + MENU_WIDTH + needsBlockWidth + 12
const panelTop = GAME_HEIGHT - NEEDS_PANEL_HEIGHT
const reasoningWidth = Math.max(180, GAME_WIDTH - reasoningLeft - REASONING_PANEL_PADDING)

export function ReasoningPanel({ text = 'Waiting for next decision…' }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: reasoningLeft,
        top: panelTop + REASONING_PANEL_PADDING,
        width: reasoningWidth,
        height: NEEDS_PANEL_HEIGHT - REASONING_PANEL_PADDING * 2,
        background: 'rgba(37,37,37,0.95)',
        borderLeft: '1px solid #444',
        padding: REASONING_PANEL_PADDING,
        boxSizing: 'border-box',
        pointerEvents: 'auto'
      }}
    >
      <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>Avatar's reasoning</div>
      <div
        style={{
          fontSize: 12,
          color: '#c0c0c0',
          lineHeight: 1.4,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {text}
      </div>
    </div>
  )
}
