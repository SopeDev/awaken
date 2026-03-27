import {
  ABILITY_BAR_HEIGHT,
  ABILITY_SLOT_SIZE
} from '../../constants/uiLayout.js'
import {
  AVATAR_PHASE,
  DIRECTIONAL_PULL_COOLDOWN_MS,
  INTUITION_PULSE_COOLDOWN_MS,
  SYNCHRONICITY_COOLDOWN_MS
} from '../../systems/playerSignals/constants.js'
import { EventBus } from '../../eventBus.js'
import { BASELINE_AWARENESS_MAX } from '../../systems/awareness/index.js'
import { useEffect, useRef, useState } from 'react'

const BAR_PADDING_ABOVE_HUD_PX = 12

function tooltip(name, description) {
  const d = String(description || '').trim()
  return d ? `${name}\n${d}` : String(name || '')
}

function IconDirectional() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden style={{ opacity: 0.9 }}>
      <path d="M12 4 L12 9 M12 15 L12 20 M4 12 L9 12 M15 12 L20 12" stroke="#c9b87c" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.2" fill="#8a7a50" />
    </svg>
  )
}

function IconArrow({ rotationDeg = 0 }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden style={{ opacity: 0.9 }}>
      <g transform={`rotate(${rotationDeg} 12 12)`}>
        <path
          d="M12 4 L12 20"
          stroke="#c9b87c"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M7.5 9.5 L12 4.8 L16.5 9.5"
          stroke="#c9b87c"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <circle cx="12" cy="12" r="2.2" fill="#8a7a50" opacity="0.9" />
    </svg>
  )
}

function IconIntuition() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden style={{ opacity: 0.9 }}>
      <circle cx="12" cy="12" r="8" stroke="#7aab8c" strokeWidth="1.5" opacity="0.7" />
      <circle cx="12" cy="12" r="4.5" stroke="#9ed4b8" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.5" fill="#c8ead8" />
    </svg>
  )
}

function IconAttune() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden style={{ opacity: 0.9 }}>
      <path
        d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z"
        stroke="#a89cc8"
        strokeWidth="1.2"
        fill="rgba(168,156,200,0.15)"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AbilitySlot({
  remainingMs = 0,
  totalMs = 5000,
  keybind,
  tooltip,
  onActivate,
  icon,
  disabledByPhase = false,
  variant = 'default'
}) {
  const onCd = remainingMs > 0
  const ratio = totalMs > 0 ? Math.min(1, remainingMs / totalMs) : 0
  const sweep = ratio * 360
  const sec = onCd ? Math.ceil(remainingMs / 1000) : 0
  const inactive = disabledByPhase && !onCd
  const canClick = onActivate && !onCd && !disabledByPhase
  const isGroup = variant === 'group'

  const TOOLTIP_DELAY_MS = 1000
  const hoverTimerRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const [isFinePointer, setIsFinePointer] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true
    return !!window.matchMedia('(hover: hover) and (pointer: fine)').matches
  })
  const longPressFiredRef = useRef(false)

  const clearTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setIsFinePointer(!!mq.matches)
    update()
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update)
      return () => mq.removeEventListener('change', update)
    }
    if (typeof mq.addListener === 'function') {
      mq.addListener(update)
      return () => mq.removeListener(update)
    }
    return () => clearTimer()
  }, [])

  const onHoverStart = () => {
    if (!isFinePointer) return
    setIsHovered(true)
    clearTimer()
    if (!tooltip) return
    hoverTimerRef.current = setTimeout(() => {
      setIsTooltipVisible(true)
    }, TOOLTIP_DELAY_MS)
  }

  const onHoverEnd = () => {
    setIsHovered(false)
    clearTimer()
    setIsTooltipVisible(false)
    longPressFiredRef.current = false
  }

  const startLongPress = () => {
    if (isFinePointer) return
    if (!tooltip) return
    setIsHovered(true)
    setIsTooltipVisible(false)
    longPressFiredRef.current = false
    clearTimer()
    hoverTimerRef.current = setTimeout(() => {
      setIsTooltipVisible(true)
      longPressFiredRef.current = true
    }, TOOLTIP_DELAY_MS)
  }

  return (
    <div
      role={onActivate ? 'button' : undefined}
      tabIndex={canClick ? 0 : undefined}
      onClick={() => {
        if (longPressFiredRef.current) return
        if (!canClick) return
        onActivate()
      }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      onPointerDown={(e) => {
        // On mobile, taps can trigger synthetic mouse hover.
        // Use a long-press timer instead for coarse pointers.
        if (e.pointerType !== 'mouse') startLongPress()
      }}
      onPointerUp={onHoverEnd}
      onPointerCancel={onHoverEnd}
      onKeyDown={(e) => {
        if (!canClick) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onActivate()
        }
      }}
      style={{
        position: 'relative',
        width: ABILITY_SLOT_SIZE,
        height: ABILITY_SLOT_SIZE,
        borderRadius: isGroup ? 0 : 8,
        border: isGroup ? 'none' : inactive ? '1px solid #353535' : '1px solid #4a4a4a',
        background: isGroup
          ? 'transparent'
          : inactive
            ? 'linear-gradient(180deg, #262626 0%, #1a1a1a 100%)'
            : 'linear-gradient(180deg, #2e2e2e 0%, #222 100%)',
        boxShadow: isGroup ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.06)',
        overflow: 'visible',
        flexShrink: 0,
        cursor: canClick ? 'pointer' : inactive ? 'not-allowed' : 'default',
        outline: 'none',
        opacity: inactive ? 0.72 : 1,
        transition: 'opacity 0.2s ease, border-color 0.2s ease'
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: onCd ? 'blur(3px)' : inactive ? 'grayscale(0.9) brightness(0.55)' : 'none',
          opacity: onCd ? 0.55 : inactive ? 0.85 : 1,
          transition: 'filter 0.15s ease, opacity 0.15s ease'
        }}
      >
        {icon}
      </div>
      {inactive && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.38)',
            pointerEvents: 'none'
          }}
        />
      )}
      {onCd && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `conic-gradient(from 0deg at 50% 50%, rgba(0,0,0,0.72) 0deg, rgba(0,0,0,0.72) ${sweep}deg, transparent ${sweep}deg)`,
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 17,
              fontWeight: 700,
              color: '#f0f0f0',
              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              pointerEvents: 'none',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {sec}
          </div>
        </>
      )}
      <span
        style={{
          position: 'absolute',
          right: 4,
          bottom: 3,
          fontSize: 9,
          fontWeight: 600,
          color: onCd ? '#777' : inactive ? '#5c5c5c' : '#b8b8b8',
          textShadow: '0 1px 2px rgba(0,0,0,0.85)',
          lineHeight: 1,
          pointerEvents: 'none',
          letterSpacing: keybind.length > 4 ? -0.3 : 0
        }}
      >
        {keybind}
      </span>

      {isHovered && isTooltipVisible && tooltip ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 'calc(100% + 10px)',
            transform: 'translateX(-50%)',
            width: 240,
            maxWidth: 280,
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
            const s = String(tooltip || '')
            const parts = s.split('\n\n')
            const first = parts[0] || ''
            const firstLines = first.split('\n')
            const title = firstLines[0] || ''
            const description = firstLines.slice(1).join('\n')
            const extras = parts.slice(1)

            return (
              <>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#e6ddab',
                    letterSpacing: 0.2,
                    marginBottom: 8
                  }}
                >
                  {title}
                </div>
                {description ? (
                  <div style={{ color: '#d9d9d9', marginBottom: extras.length ? 8 : 0 }}>
                    {description}
                  </div>
                ) : null}
                {extras.length
                  ? extras.map((block, idx) => (
                      <div
                        // eslint-disable-next-line react/no-array-index-key
                        key={idx}
                        style={{
                          marginTop: idx === 0 ? 0 : 8,
                          paddingTop: 8,
                          borderTop: idx === 0 ? '1px solid rgba(210,210,210,0.14)' : '1px solid rgba(210,210,210,0.10)',
                          color: '#bfb17d',
                          fontSize: 11
                        }}
                      >
                        {block}
                      </div>
                    ))
                  : null}
              </>
            )
          })()}
        </div>
      ) : null}
    </div>
  )
}

/**
 * @param {{
 *   signalCooldownsMs?: { directional?: number, intuition?: number, attune?: number },
 *   avatarPhase?: string
 *   attuneAvailable?: boolean
 * }} props
 */
export function AbilityBar({
  signalCooldownsMs = {},
  avatarPhase = AVATAR_PHASE.AWAITING,
  hudHeight = 200,
  consciousnessLevel = 0,
  awarenessDynamicBuffer = 0,
  attuneAvailable = false
}) {
  const d = Number(signalCooldownsMs.directional) || 0
  const i = Number(signalCooldownsMs.intuition) || 0
  const a = Number(signalCooldownsMs.attune) || 0

  const waitingOnDecision = avatarPhase === AVATAR_PHASE.PROCESSING
  const directionalPhaseLocked =
    waitingOnDecision || avatarPhase === AVATAR_PHASE.PERFORMING
  const intuitionPhaseLocked = waitingOnDecision
  const attunePhaseLocked =
    waitingOnDecision ||
    avatarPhase === AVATAR_PHASE.AWAITING ||
    avatarPhase === AVATAR_PHASE.WALKING

  const dyn = Math.max(0, Math.min(BASELINE_AWARENESS_MAX, Number(awarenessDynamicBuffer) || 0))
  const dynScale = dyn / BASELINE_AWARENESS_MAX
  const attuneNoticeP = Math.max(0, Math.min(1, 0.5 + dynScale))
  const synchronicityChancePct = Math.round(attuneNoticeP * 100)

  const dirConsciousnessLine = `Affected by: avatar consciousness level. Current = ${consciousnessLevel}.`
  const directionalCanOnlyUseLine =
    'Can only use when you are not mid-action.\nCannot use while a decision is being chosen.'
  const intuitionCanOnlyUseLine = 'Cannot use while a decision is being chosen.'
  const attuneCanOnlyUseLine =
    'Can only use while you are actively performing an attuned action.\nCannot use while a decision is being chosen.'

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: hudHeight + BAR_PADDING_ABOVE_HUD_PX,
        height: ABILITY_BAR_HEIGHT,
        zIndex: 45,
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        boxSizing: 'border-box',
        padding: '0 12px',
        background: 'transparent'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          borderRadius: 8,
          border: '1px solid #4a4a4a',
          overflow: 'visible',
          flexShrink: 0
        }}
      >
        <AbilitySlot
          variant="group"
          remainingMs={d}
          totalMs={DIRECTIONAL_PULL_COOLDOWN_MS}
          keybind="W"
          tooltip={tooltip(
            'Directional Pull',
            `Pulls you toward the north sector. ${dirConsciousnessLine} Nearby matching objects glow, nudging your next choice in that direction.\n\n${directionalCanOnlyUseLine}`
          )}
          onActivate={() => EventBus.emit('ability-signal', { type: 'directional', direction: 'w' })}
          icon={<IconArrow rotationDeg={0} />}
          disabledByPhase={directionalPhaseLocked}
        />
        <div style={{ width: 1, background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <AbilitySlot
          variant="group"
          remainingMs={d}
          totalMs={DIRECTIONAL_PULL_COOLDOWN_MS}
          keybind="A"
          tooltip={tooltip(
            'Directional Pull',
            `Pulls you toward the west sector. ${dirConsciousnessLine} Nearby matching objects glow, nudging your next choice in that direction.\n\n${directionalCanOnlyUseLine}`
          )}
          onActivate={() => EventBus.emit('ability-signal', { type: 'directional', direction: 'a' })}
          icon={<IconArrow rotationDeg={-90} />}
          disabledByPhase={directionalPhaseLocked}
        />
        <div style={{ width: 1, background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <AbilitySlot
          variant="group"
          remainingMs={d}
          totalMs={DIRECTIONAL_PULL_COOLDOWN_MS}
          keybind="S"
          tooltip={tooltip(
            'Directional Pull',
            `Pulls you toward the south sector. ${dirConsciousnessLine} Nearby matching objects glow, nudging your next choice in that direction.\n\n${directionalCanOnlyUseLine}`
          )}
          onActivate={() => EventBus.emit('ability-signal', { type: 'directional', direction: 's' })}
          icon={<IconArrow rotationDeg={180} />}
          disabledByPhase={directionalPhaseLocked}
        />
        <div style={{ width: 1, background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <AbilitySlot
          variant="group"
          remainingMs={d}
          totalMs={DIRECTIONAL_PULL_COOLDOWN_MS}
          keybind="D"
          tooltip={tooltip(
            'Directional Pull',
            `Pulls you toward the east sector. ${dirConsciousnessLine} Nearby matching objects glow, nudging your next choice in that direction.\n\n${directionalCanOnlyUseLine}`
          )}
          onActivate={() => EventBus.emit('ability-signal', { type: 'directional', direction: 'd' })}
          icon={<IconArrow rotationDeg={90} />}
          disabledByPhase={directionalPhaseLocked}
        />
      </div>
      <AbilitySlot
        remainingMs={i}
        totalMs={INTUITION_PULSE_COOLDOWN_MS}
        keybind="Space"
        tooltip={tooltip(
          'Intuition Pulse',
          `Reveals hidden meaning in nearby objects. Area effect: 3x3 tiles around your avatar. Eligible hidden-depth objects glow, and their actions are treated as more important the next time your avatar makes an action choice. If no eligible hidden-depth objects are nearby, you only receive brief feedback.\n\n${intuitionCanOnlyUseLine}`
        )}
        onActivate={() => EventBus.emit('ability-signal', { type: 'intuition' })}
        icon={<IconIntuition />}
        disabledByPhase={intuitionPhaseLocked}
      />
      <AbilitySlot
        remainingMs={a}
        totalMs={SYNCHRONICITY_COOLDOWN_MS}
        keybind="E"
        tooltip={tooltip(
          'Attune',
          `Focuses on the hidden meaning contained within the object tied to your current action. Chance to succeed: 50% + (dynamic awareness / 50). Current: ${synchronicityChancePct}%. On success, you receive a note, and discoveries can unlock new actions, important information, hidden connections, and other secrets.\n\n${attuneCanOnlyUseLine}`
        )}
        onActivate={() => EventBus.emit('ability-signal', { type: 'attune' })}
        icon={<IconAttune />}
        disabledByPhase={attunePhaseLocked || !attuneAvailable}
      />
    </div>
  )
}
