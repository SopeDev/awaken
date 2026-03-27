import { ENTROPY_STRIP_HEIGHT } from '../constants/uiLayout.js'
import { BASELINE_AWARENESS_MAX } from '../systems/awareness/index.js'
import { useEffect, useRef, useState } from 'react'

const PADDING = 18
const LABEL_WIDTH = 88
const BAR_GAP = 8

/** Same green family, stepped so bands read as one meter without labels. */
const TONE = {
  /** Embodied baseline that the final meter has reached */
  baselineFilled: '#355a42',
  /** Baseline “slot” not reached yet, or tail past 2× baseline — low capacity / unused headroom */
  emptyBaselineAndBeyond: '#252b28',
  /** Mode / dynamic layer actually filled */
  bandwidthFull: '#4f8f62'
}

/**
 * Bands use **instant** baseline + dynamic so “mode” slice width matches `awarenessDynamicBuffer`.
 * (Smoothed `awareness` only affects entrapment/clear flags from the engine, not this geometry.)
 *
 * @param {number} eff0to100 - instant final min(baseline + dynamic, 100), capped at 2× baseline inside
 * @param {number} baseline0to50 - instantaneous baseline from needs
 */
function computeBandWidths(eff0to100, baseline0to50) {
  const b = Math.max(0, Math.min(BASELINE_AWARENESS_MAX, Number(baseline0to50) || 0))
  const cap = Math.min(2 * b, 100)
  const eff = Math.min(Math.max(0, Math.min(100, Number(eff0to100) || 0)), cap)

  let baselineFilled
  let emptyBaselineSlot
  let bandwidthFull
  let bandwidthEmpty

  if (eff <= b) {
    baselineFilled = eff
    emptyBaselineSlot = Math.max(0, b - eff)
    bandwidthFull = 0
    bandwidthEmpty = Math.max(0, cap - b)
  } else {
    baselineFilled = b
    emptyBaselineSlot = 0
    bandwidthFull = Math.max(0, Math.min(b, eff - b))
    bandwidthEmpty = Math.max(0, cap - eff)
  }

  const beyondCap = Math.max(0, 100 - cap)

  return {
    baselineFilled,
    emptyBaselineSlot,
    bandwidthFull,
    bandwidthEmpty,
    beyondCap
  }
}

function Segment({ widthPct, background, zIndex = 0 }) {
  if (widthPct <= 0) return null
  return (
    <div
      style={{
        width: `${widthPct}%`,
        height: '100%',
        flexShrink: 0,
        background,
        boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.2)',
        transition: 'width 0.15s ease-out, background 0.15s ease-out',
        zIndex
      }}
    />
  )
}

export function AwarenessStrip({
  awarenessBaseline = 0,
  awarenessDynamicBuffer = 0
}) {
  const b = Math.max(0, Math.min(BASELINE_AWARENESS_MAX, Number(awarenessBaseline) || 0))
  const dRaw = Number(awarenessDynamicBuffer)
  const d = Math.max(0, Math.min(b, Number.isFinite(dRaw) ? dRaw : 0))
  const effInstant = Math.min(b + d, 100)
  const w = computeBandWidths(effInstant, b)
  const successChancePct = Math.round((0.5 + d / BASELINE_AWARENESS_MAX) * 100)
  const tooltipText = [
    'Awareness',
    'Baseline: needs-driven meter (0..50).',
    'Dynamic: decision-driven add-on (0..baseline).',
    'Final meter: baseline + dynamic (0..100, capped by UI bands).',
    `Attune success chance: 50% + dynamic/50 (currently ~${successChancePct}%).`
  ].join('\n')

  const TOOLTIP_DELAY_MS = 1000
  const hoverTimerRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)

  const clearTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => clearTimer()
  }, [])

  const onHoverStart = () => {
    setIsHovered(true)
    clearTimer()
    hoverTimerRef.current = setTimeout(() => setIsTooltipVisible(true), TOOLTIP_DELAY_MS)
  }

  const onHoverEnd = () => {
    setIsHovered(false)
    clearTimer()
    setIsTooltipVisible(false)
  }

  return (
    <div
      className="awareness-strip"
      style={{
        position: 'relative',
        width: '100%',
        height: ENTROPY_STRIP_HEIGHT,
        flexShrink: 0,
        background: 'rgba(26,26,26,0.95)',
        borderBottom: '1px solid #444',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: PADDING,
        paddingRight: PADDING,
        boxSizing: 'border-box',
        overflow: 'visible',
        pointerEvents: 'auto'
      }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <span style={{ fontSize: 12, color: '#b0b0b0', width: LABEL_WIDTH }}>Awareness</span>
      <div
        style={{
          marginLeft: BAR_GAP,
          flex: 1,
          height: 14,
          background: '#2a2a2a',
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch'
        }}
      >
        <Segment widthPct={w.baselineFilled} background={TONE.baselineFilled} />
        <Segment widthPct={w.emptyBaselineSlot} background={TONE.emptyBaselineAndBeyond} />
        <Segment widthPct={w.bandwidthFull} background={TONE.bandwidthFull} />
        {w.bandwidthEmpty > 0 ? (
          <div
            style={{
              width: `${w.bandwidthEmpty}%`,
              height: '100%',
              flexShrink: 0,
              background:
                'linear-gradient(180deg, rgba(79, 143, 98, 0.32) 0%, rgba(42, 42, 42, 0.55) 100%)',
              boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.2)',
              transition: 'width 0.15s ease-out',
              boxSizing: 'border-box'
            }}
          />
        ) : null}
        <Segment widthPct={w.beyondCap} background={TONE.emptyBaselineAndBeyond} />
      </div>

      {isHovered && isTooltipVisible ? (
        <div
          style={{
            position: 'absolute',
            left: PADDING,
            right: PADDING,
            bottom: 'calc(100% + 10px)',
            background:
              'linear-gradient(180deg, rgba(10,10,12,0.96) 0%, rgba(6,6,8,0.94) 100%)',
            border: '1px solid rgba(210,210,210,0.22)',
            borderRadius: 10,
            padding: '10px 12px',
            boxShadow:
              '0 10px 28px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
            color: '#e8e8e8',
            fontSize: 12,
            lineHeight: 1.25,
            textShadow: '0 1px 0 rgba(0,0,0,0.6)',
            whiteSpace: 'pre-wrap',
            pointerEvents: 'none',
            zIndex: 9999
          }}
        >
          {(() => {
            const parts = String(tooltipText || '')
            const lines = parts.split('\n')
            const title = lines[0] || ''
            const bodyLines = lines.slice(1)
            return (
              <>
                <div style={{ fontWeight: 800, color: '#e6ddab', marginBottom: 8, fontSize: 13 }}>
                  {title}
                </div>
                {bodyLines.map((l, idx) => (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    style={{ color: '#d9d9d9', fontSize: 12 }}
                  >
                    {l}
                  </div>
                ))}
              </>
            )
          })()}
        </div>
      ) : null}
    </div>
  )
}
