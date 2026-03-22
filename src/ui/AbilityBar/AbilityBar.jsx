import {
  GAME_WIDTH,
  GAME_HEIGHT,
  NEEDS_PANEL_HEIGHT,
  ENTROPY_STRIP_HEIGHT,
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

const BAR_PADDING_BELOW_PX = 16
const barTop =
  GAME_HEIGHT - NEEDS_PANEL_HEIGHT - ENTROPY_STRIP_HEIGHT - ABILITY_BAR_HEIGHT - BAR_PADDING_BELOW_PX

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

function IconSynchronicity() {
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

  return (
    <div
      title={tooltip}
      role={onActivate ? 'button' : undefined}
      tabIndex={canClick ? 0 : undefined}
      onClick={() => {
        if (!canClick) return
        onActivate()
      }}
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
        overflow: 'hidden',
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
    </div>
  )
}

/**
 * @param {{
 *   signalCooldownsMs?: { directional?: number, intuition?: number, synchronicity?: number },
 *   avatarPhase?: string
 * }} props
 */
export function AbilityBar({ signalCooldownsMs = {}, avatarPhase = AVATAR_PHASE.AWAITING }) {
  const d = Number(signalCooldownsMs.directional) || 0
  const i = Number(signalCooldownsMs.intuition) || 0
  const s = Number(signalCooldownsMs.synchronicity) || 0

  const directionalPhaseLocked = avatarPhase === AVATAR_PHASE.PERFORMING
  const synchronicityPhaseLocked =
    avatarPhase === AVATAR_PHASE.AWAITING || avatarPhase === AVATAR_PHASE.WALKING

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: barTop,
        width: GAME_WIDTH,
        height: ABILITY_BAR_HEIGHT,
        zIndex: 30,
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        boxSizing: 'border-box',
        padding: '0 16px',
        background: 'transparent'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          borderRadius: 8,
          border: '1px solid #4a4a4a',
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        <AbilitySlot
          variant="group"
          remainingMs={d}
          totalMs={DIRECTIONAL_PULL_COOLDOWN_MS}
          keybind="W"
          tooltip={
            directionalPhaseLocked
              ? 'Unavailable while you are mid-action.'
              : 'A faint pull toward the north. W.'
          }
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
          tooltip={
            directionalPhaseLocked
              ? 'Unavailable while you are mid-action.'
              : 'A faint pull toward the west. A.'
          }
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
          tooltip={
            directionalPhaseLocked
              ? 'Unavailable while you are mid-action.'
              : 'A faint pull toward the south. S.'
          }
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
          tooltip={
            directionalPhaseLocked
              ? 'Unavailable while you are mid-action.'
              : 'A faint pull toward the east. D.'
          }
          onActivate={() => EventBus.emit('ability-signal', { type: 'directional', direction: 'd' })}
          icon={<IconArrow rotationDeg={90} />}
          disabledByPhase={directionalPhaseLocked}
        />
      </div>
      <AbilitySlot
        remainingMs={i}
        totalMs={INTUITION_PULSE_COOLDOWN_MS}
        keybind="Space"
        tooltip="Whatever is right beside you suddenly stands out. Space."
        onActivate={() => EventBus.emit('ability-signal', { type: 'intuition' })}
        icon={<IconIntuition />}
      />
      <AbilitySlot
        remainingMs={s}
        totalMs={SYNCHRONICITY_COOLDOWN_MS}
        keybind="E"
        tooltip={
          synchronicityPhaseLocked
            ? 'Only when you are already doing something.'
            : 'Invite a small, uncanny moment inside whatever you are doing. E.'
        }
        onActivate={() => EventBus.emit('ability-signal', { type: 'synchronicity' })}
        icon={<IconSynchronicity />}
        disabledByPhase={synchronicityPhaseLocked}
      />
    </div>
  )
}
