import { NEED_LABELS } from '../systems/needs/ui.js'
import { getNeedFillColor } from '../systems/needs/ui.js'

function hexToCss(hex) {
  const n = typeof hex === 'number' ? hex : 0x4a7c59
  return '#' + n.toString(16).padStart(6, '0')
}

export function NeedBar({ needKey, value = 0, pendingDelta }) {
  const label = NEED_LABELS[needKey] || needKey
  const pct = Math.max(0, Math.min(100, value)) / 100
  const color = hexToCss(getNeedFillColor(needKey, value))
  const showLeft = typeof pendingDelta === 'number' && pendingDelta < 0
  const showRight = typeof pendingDelta === 'number' && pendingDelta > 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: 18, gap: 4 }}>
      {showLeft && (
        <span style={{ fontSize: 11, color: '#e8c84a', textShadow: '0 0 4px #e8c84a', width: 18, textAlign: 'right' }}>
          &lt;&lt;
        </span>
      )}
      {!showLeft && <span style={{ width: 18 }} />}
      <span style={{ fontSize: 12, color: '#b0b0b0', width: 88, flexShrink: 0 }}>{label}</span>
      <div
        style={{
          width: 180,
          height: 14,
          background: '#2a2a2a',
          borderRadius: 1,
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        <div
          style={{
            width: `${pct * 100}%`,
            height: '100%',
            background: color,
            transition: 'width 0.1s ease-out'
          }}
        />
      </div>
      {showRight && (
        <span style={{ fontSize: 11, color: '#e8c84a', textShadow: '0 0 4px #e8c84a', width: 18 }}>
          &gt;&gt;
        </span>
      )}
      {!showRight && <span style={{ width: 18 }} />}
    </div>
  )
}
