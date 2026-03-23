import { EventBus } from '../../eventBus.js'
import { createNeedsState, NEED_KEYS, ACTION_EFFECTS, INITIAL_NEEDS } from '../needs/index.js'
import { createEntropyState, updateEntropyFromNeeds } from '../entropy/index.js'
import { exampleChart1, generateTraitSheet, generateTraitSheetDetailed } from '../cosmicBlueprint/index.js'
import { NEED_LABELS } from '../needs/ui.js'
import {
  ACTIONS,
  AVAILABLE_ACTION_IDS_ALPHABETICAL,
  getActionLabel,
  pickUniformRandomActionId
} from '../../data/actions.js'
import { ROOM_OBJECTS } from '../../data/roomData.js'
import {
  formatInGameClock,
  IN_GAME_CLOCK_START_MINUTES,
  IN_GAME_DAY_MINUTES,
  REAL_MS_PER_IN_GAME_DAY,
  RECENT_DECISION_HISTORY_MAX
} from '../../constants/gameSession.js'
import {
  applyDiscoveryUnlocks,
  findMatchingDiscoveryStep,
  getRoomDiscoveryChain
} from '../../data/roomDiscovery.js'
import { getCharacterState, setConsciousnessLevel } from './characterState.js'
import {
  AVATAR_PHASE,
  DIRECTIONAL_PULL_COOLDOWN_MS,
  INTUITION_PULSE_COOLDOWN_MS,
  SYNCHRONICITY_AWARENESS_BASE,
  SYNCHRONICITY_COOLDOWN_MS,
  SYNCHRONICITY_NOTICE_BASE_CHANCE,
  SYNCHRONICITY_NOTICE_BOREDOM_THRESHOLD,
  SYNCHRONICITY_NOTICE_LEVEL_MIN,
  SYNCHRONICITY_NOTICE_PERCEPTION_THRESHOLD,
  SYNCHRONICITY_NOTICE_PRIMED_CHANCE
} from '../playerSignals/constants.js'
import {
  actionIdsForObjectTypes,
  cardinalDirectionLabel,
  directionKeyToCardinal,
  getActionIdsInCardinalSector,
  getAdjacentObjectTypeIds
} from '../playerSignals/geometry.js'
import {
  buildIntuitionFeltLineForObjectTypes,
  createEmptyAttunementRecord,
  objectTypeHasHiddenDepth
} from '../playerSignals/objectAttunement.js'
import { getSynchronicityNoteForAction } from '../playerSignals/synchronicityCopy.js'

const GAME_MINUTES_PER_REAL_SECOND = 1 / 60
// Base multiplier is 1. Game speed is controlled at runtime via Phaser `timeScale`.
const TEST_SPEED_MULTIPLIER = 1

const LOG_LLM_DECISION_DEBUG = false
/** Log system + user messages in the browser when the server includes `_llmDebug` (see `LOG_LLM_IO`). */
const LOG_LLM_PROMPT_BROWSER =
  import.meta.env.VITE_LOG_LLM_PROMPT !== 'false'
const DEBUG_AWARENESS_CHANGES = true
const DEBUG_AWARENESS_CHANGES_JSON = true

const AWARENESS_MIN = 0
const AWARENESS_MAX = 100
const AWARENESS_START = 50

// Applied to *fills* only. Drain rate does not scale by level.
const METER_FILL_MULTIPLIER_BY_LEVEL = {
  0: 2.0,
  1: 1.5,
  2: 1.0,
  3: 0.6,
  4: 0.3,
  5: 0.15
}

// Point drains / fills (intentionally “game-y”, not physics-true).
const FILL_BASES = {
  pattern_noticed: 6,
  signal_response: 8,
  guidance: 10,
  state: 12,
  broke_loop: 3.5
}

const REPETITION_DRAIN_POINTS_BY_STREAK_LEN = {
  2: 2,
  3: 5,
  4: 10,
  5: 15
}
const REPETITION_RISK_MULTIPLIER_BY_LEVEL = {
  high: 1.5,
  medium: 1.0,
  low: 0.6
}
const SOFT_REPEAT_PENALTY_MULTIPLIER = 0.5
const BROKE_LOOP_MIN_STREAK = 3

const AVOIDANCE_DRAIN_POINTS = 2

// Awareness drain derived from hidden entropy pressure.
const ARCHON_DRAIN_POINTS_PER_MINUTE_AT_FULL = 2.0
const CRITICAL_ARCHON_DRAIN_MULTIPLIER_MAX = 2.2

// Stagnation drain (slow, time-based).
const STAGNATION_MS = 60 * 1000
const STAGNATION_UNIQUE_ACTIONS_MAX = 3
const STAGNATION_GRACE_AFTER_POSITIVE_MS = 20 * 1000
const STAGNATION_DRAIN_POINTS_PER_MINUTE = 0.6

const REGRESSION_WINDOW_MS_BY_LEVEL = {
  1: 9000,
  2: 12000,
  3: 16000,
  4: 22000,
  5: 26000
}

const NEED_RESOLUTION_MIN_NEED = 75
const NEED_RESOLUTION_COOLDOWN_DECISIONS = 5
const PSYCHOLOGICAL_NEED_KEYS = ['boredom', 'stress', 'loneliness']
const AVOIDANCE_KEYWORDS = [
  'avoid',
  'escape',
  'dodge',
  'relief',
  'numb',
  'shut off',
  'get away',
  'run away',
  'not face',
  "can't face"
]
const NEED_RESULT_HELPED_A_LOT = 'helped_a_lot'
const NEED_RESULT_HELPED_A_LITTLE = 'helped_a_little'
const NEED_RESULT_NO_MEANINGFUL_HELP = 'no_meaningful_help'
const NEED_RESULT_GOT_WORSE = 'got_worse'
const NEED_RESULT_NOT_APPLICABLE = 'not_applicable'
const NEED_FAILURE_RESULTS = new Set([NEED_RESULT_NO_MEANINGFUL_HELP, NEED_RESULT_GOT_WORSE])
const PSYCHOLOGICAL_MISMATCH_NEEDS = new Set(['stress', 'boredom', 'loneliness'])

/** Newest-first log entries: single newline between rows (no rule character). */
const REASONING_LOG_SEPARATOR = '\n'

const buildClamp = (v, min, max) => Math.max(min, Math.min(max, v))
const getHabituationCounterKey = (actionId, needKey) => `${actionId}:${needKey}`

function isAvoidanceReasonText(reasonText) {
  const t = String(reasonText || '').toLowerCase()
  if (!t) return false
  return AVOIDANCE_KEYWORDS.some((kw) => t.includes(String(kw).toLowerCase()))
}

function buildRealWorldTimestamp(sessionStartedAtMs) {
  const nowMs = Date.now()
  const elapsedMs = Math.max(0, nowMs - sessionStartedAtMs)
  return {
    nowMs,
    nowIso: new Date(nowMs).toISOString(),
    elapsedMs,
    elapsedSeconds: elapsedMs / 1000,
    elapsedMinutes: elapsedMs / 60000
  }
}

function buildLlmReasoningPayload(decision, fallbackReasonText) {
  if (decision && typeof decision === 'object') {
    return {
      source: 'llm',
      thought: typeof decision.thought === 'string' ? decision.thought : '',
      reason: typeof decision.reason === 'string' ? decision.reason : '',
      unease: decision.unease != null && decision.unease !== '' ? decision.unease : null,
      pattern_noticed: decision.pattern_noticed != null && decision.pattern_noticed !== '' ? decision.pattern_noticed : null,
      signal_response: decision.signal_response != null && decision.signal_response !== '' ? decision.signal_response : null,
      guidance: decision.guidance != null && decision.guidance !== '' ? decision.guidance : null,
      state: decision.state != null && decision.state !== '' ? decision.state : null
    }
  }
  return {
    source: 'fallback',
    thought: '',
    reason: typeof fallbackReasonText === 'string' ? fallbackReasonText : '',
    unease: null,
    pattern_noticed: null,
    signal_response: null,
    guidance: null,
    state: null
  }
}

function getDecisionFactorNeedKey(decision, keyName) {
  const raw = decision?.decision_factors?.[keyName]
  if (typeof raw !== 'string') return null
  const k = raw.trim().toLowerCase()
  return NEED_KEYS.includes(k) ? k : null
}

function classifyNeedOutcome(needKey, needsBefore, needsAfter) {
  if (!needKey || !NEED_KEYS.includes(needKey)) return NEED_RESULT_NOT_APPLICABLE
  const before = Number(needsBefore?.[needKey])
  const after = Number(needsAfter?.[needKey])
  if (!Number.isFinite(before) || !Number.isFinite(after)) return NEED_RESULT_NOT_APPLICABLE
  const delta = after - before
  if (delta <= -10) return NEED_RESULT_HELPED_A_LOT
  if (delta <= -4) return NEED_RESULT_HELPED_A_LITTLE
  if (delta > 0) return NEED_RESULT_GOT_WORSE
  if (Math.abs(delta) < 4) return NEED_RESULT_NO_MEANINGFUL_HELP
  return NEED_RESULT_NO_MEANINGFUL_HELP
}

function isFailureResult(result) {
  return NEED_FAILURE_RESULTS.has(result)
}

function isSuccessResult(result) {
  return result === NEED_RESULT_HELPED_A_LOT || result === NEED_RESULT_HELPED_A_LITTLE
}

function isPsychologicalNeed(needKey) {
  return typeof needKey === 'string' && PSYCHOLOGICAL_MISMATCH_NEEDS.has(needKey)
}

function makeDeltaText(before, after) {
  const delta = Number(after) - Number(before)
  if (!Number.isFinite(delta)) return 'did not really help'
  if (delta <= -10) return 'helped a lot'
  if (delta <= -4) return 'helped a little'
  if (delta > 0) return 'made it worse'
  return 'did not really help'
}

function buildFeltOutcomeLine(actionId, primaryNeedKey, secondaryNeedKey, primaryResult, secondaryResult, needsBefore, needsAfter) {
  const actionLabel = getActionLabel(actionId) || actionId || 'that'
  const actionText = actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)
  const hasPrimaryNeed = !!primaryNeedKey
  const hasSecondaryNeed = !!secondaryNeedKey

  if (!hasPrimaryNeed && !hasSecondaryNeed) {
    return `${actionText} did not really help.`
  }

  if (hasPrimaryNeed && hasSecondaryNeed && primaryNeedKey !== secondaryNeedKey) {
    const pText = makeDeltaText(needsBefore?.[primaryNeedKey], needsAfter?.[primaryNeedKey])
    const sText = makeDeltaText(needsBefore?.[secondaryNeedKey], needsAfter?.[secondaryNeedKey])
    const primaryLabel = NEED_LABELS[primaryNeedKey]?.toLowerCase() || primaryNeedKey
    const secondaryLabel = NEED_LABELS[secondaryNeedKey]?.toLowerCase() || secondaryNeedKey
    if (isSuccessResult(primaryResult) && isFailureResult(secondaryResult)) {
      return `${actionText} ${pText} with ${primaryLabel}. I still feel ${secondaryLabel}.`
    }
    if (isFailureResult(primaryResult) && isSuccessResult(secondaryResult)) {
      return `${actionText} helped ${secondaryLabel}. I still feel ${primaryLabel}.`
    }
    if (isFailureResult(primaryResult) && isFailureResult(secondaryResult)) {
      return `${actionText} did not really help.`
    }
    return `${actionText} helped in one way, but not enough.`
  }

  const needKey = primaryNeedKey || secondaryNeedKey
  const label = NEED_LABELS[needKey]?.toLowerCase() || needKey
  const text = makeDeltaText(needsBefore?.[needKey], needsAfter?.[needKey])
  if (text === 'did not really help') return `${actionText} did not really help.`
  if (text === 'made it worse') return `${actionText} made ${label} worse.`
  return `${actionText} ${text} with ${label}.`
}

export function getPsychologicalFillMultiplier(needs, consciousnessLevel) {
  const boredom = Number(needs?.boredom ?? 0)
  const stress = Number(needs?.stress ?? 0)
  const loneliness = Number(needs?.loneliness ?? 0)

  let multiplier = 1
  if (boredom > 80 && stress > 80) multiplier = 0
  else if (boredom > 80 || stress > 80) multiplier = 0.3
  else if (boredom > 65 || stress > 65) multiplier = 0.6

  if (consciousnessLevel >= 2) {
    if (loneliness > 90) multiplier *= 0.75
    else if (loneliness > 75) multiplier *= 0.85
    else if (loneliness > 60) multiplier *= 0.95
  }

  return buildClamp(multiplier, 0, 1)
}

let engineSingleton = null

export function getCharacterEngine() {
  if (engineSingleton) return engineSingleton

  const engine = {
    scene: null,
    _aiLoopToken: 0,
    _lastUiEmit: 0,

    // Character traits (Cosmic Blueprint).
    cosmicChartPlacements: [...exampleChart1],
    defaultTraits: { ...generateTraitSheet(exampleChart1) },

    // Needs + entropy pressure.
    needsState: createNeedsState(),
    pendingNeedDeltas: {},
    pendingNeedTotalDeltas: {},
    pendingNeedChangeTotalMs: null,

    entropyState: createEntropyState(),

    // Awareness per consciousness level.
    awarenessByLevel: Array.from({ length: 6 }, () => AWARENESS_START),
    awareness: AWARENESS_START,
    isCriticalState: false,
    _criticalStartedAtMs: null,

    // Repetition/stagnation memory.
    _lastCompletedActionId: null,
    _repeatStreakLen: 0,
    _executedActionHistory: [],
    _lastPositiveAwarenessAtMs: Date.now(),
    _completedDecisionCount: 0,
    _needResolutionLastDecisionByNeed: {},

    // Per-action context captured when the action is chosen.
    _activeActionDecision: null,
    _activeActionReasonText: '',
    _activeHabituationCounterKeys: [],
    _activeHabituationDetails: [],
    _activePostActionEvaluation: null,
    _lastPostActionEvaluation: null,
    _pendingFeltOutcomeLine: null,

    // Snapshot at action start.
    _activeActionNeedsSnapshot: null,
    habituationCounters: {},
    _realSessionStartedAtMs: Date.now(),

    _reasoningLog: [],
    /** Fractional minute-of-day 0–1440, wraps; advances with real time (respects Phaser timeScale). */
    _gameClockMinutes: IN_GAME_CLOCK_START_MINUTES,
    _lastLLMDecision: null,

    // Recent actions for LLM context.
    _recentActionIds: [],
    _suppressAIUntilMs: 0,

    // Player signals + AI scheduler
    _aiLoopTimer: null,
    _decisionInFlight: false,
    _pendingPlayerSignalNote: null,
    /** Player-signal cues: action ids to mark with * in the next LLM user message. */
    _pendingSalientActionIds: [],
    _directionalCooldownUntil: 0,
    _intuitionCooldownUntil: 0,
    _syncCooldownUntil: 0,
    /** @type {Record<string, { isAttuned: boolean, attunedAtMs: number|null, synchronicityConsumed: boolean }>} */
    _objectAttunementByTypeId: {},
    /** Which discovery chain applies while in Room (future: per-layout id). */
    _roomDiscoveryChainId: 'tutorial',
    /** @type {Set<string>|null} actions withheld until discovery unlocks; null = gating off */
    _roomDiscoveryLockedActions: null,
    /** @type {Set<string>} one-time synchronicity discovery steps already consumed */
    _roomDiscoveryConsumedSteps: new Set(),

    attachScene(scene) {
      this.scene = scene
      this._aiLoopToken += 1
      if (scene?.scene?.key === 'Room') {
        this._ensureRoomDiscoveryState()
      }
      this._startAIActionLoop(this._aiLoopToken)
      this._syncAttunementOverlaysToScene()
    },

    detachScene() {
      if (this._aiLoopTimer && this.scene) {
        this._aiLoopTimer.remove(false)
      }
      this._aiLoopTimer = null
      this.scene = null
      this._aiLoopToken += 1
    },

    _scheduleDecisionLoopTick(token, delayMs) {
      if (!this.scene) return
      if (this._aiLoopTimer) {
        this._aiLoopTimer.remove(false)
        this._aiLoopTimer = null
      }
      const d = Math.max(0, delayMs)
      this._aiLoopTimer = this.scene.time.delayedCall(d, () => {
        this._aiLoopTimer = null
        void this._runDecisionTick(token)
      })
    },

    requestDecisionSoon(delayMs = 0) {
      if (!this.scene) return
      this._scheduleDecisionLoopTick(this._aiLoopToken, delayMs)
    },

    _snapshotPendingForDecision() {
      const note = this._pendingPlayerSignalNote
      this._pendingPlayerSignalNote = null
      const salientActionIds = [...this._pendingSalientActionIds]
      this._pendingSalientActionIds = []
      const feltOutcomeLine = this._pendingFeltOutcomeLine
      this._pendingFeltOutcomeLine = null
      return { note, salientActionIds, feltOutcomeLine }
    },

    _setPendingPlayerNote(text) {
      if (!text || typeof text !== 'string') return
      if (!this.scene) return
      this._pendingPlayerSignalNote = text.trim()
    },

    _ensureAttunementRecord(objectTypeId) {
      const id = String(objectTypeId)
      if (!this._objectAttunementByTypeId[id]) {
        this._objectAttunementByTypeId[id] = createEmptyAttunementRecord()
      }
      return this._objectAttunementByTypeId[id]
    },

    _attuneObjectTypesForIntuition(typeIds, nowMs) {
      const t = Number(nowMs)
      const ts = Number.isFinite(t) ? t : Date.now()
      for (const raw of typeIds) {
        const id = String(raw)
        const rec = this._ensureAttunementRecord(id)
        rec.isAttuned = true
        rec.attunedAtMs = ts
        rec.synchronicityConsumed = false
      }
    },

    _clearAttunementAfterSuccessfulDeepSync(objectTypeId) {
      const id = String(objectTypeId)
      const rec = this._objectAttunementByTypeId[id]
      if (!rec) return
      rec.isAttuned = false
      rec.synchronicityConsumed = true
      this._syncAttunementOverlaysToScene()
    },

    getAttunedObjectTypeIds() {
      return Object.entries(this._objectAttunementByTypeId)
        .filter(([, rec]) => rec && rec.isAttuned)
        .map(([id]) => id)
    },

    _syncAttunementOverlaysToScene() {
      if (this.scene && typeof this.scene.syncAttunementOverlays === 'function') {
        this.scene.syncAttunementOverlays()
      }
    },

    _ensureRoomDiscoveryState() {
      if (this._roomDiscoveryLockedActions != null) return
      const chain = getRoomDiscoveryChain(this._roomDiscoveryChainId)
      this._roomDiscoveryLockedActions = chain
        ? new Set(chain.initiallyLockedActionIds)
        : new Set()
    },

    getAvailableActionIdsForDecision() {
      const base = [...AVAILABLE_ACTION_IDS_ALPHABETICAL]
      if (this.scene?.scene?.key !== 'Room' || !this._roomDiscoveryLockedActions) return base
      return base.filter((id) => !this._roomDiscoveryLockedActions.has(id))
    },

    isActionAllowedInCurrentRoom(actionId) {
      if (this.scene?.scene?.key !== 'Room' || !this._roomDiscoveryLockedActions) return true
      return !this._roomDiscoveryLockedActions.has(String(actionId))
    },

    _logSignal(payload) {
      const level = getCharacterState().consciousnessLevel
      console.log('[signal]', JSON.stringify({
        ...payload,
        level
      }))
    },

    onPlayerDirectionalPull(room, key) {
      if (!this.scene || room !== this.scene || !room.player) return
      const now = this.scene.time.now
      if (now < this._directionalCooldownUntil) return

      const phase = room.getAvatarActionPhase()
      if (phase === AVATAR_PHASE.PERFORMING) return

      const cardinal = directionKeyToCardinal(key)
      if (!cardinal) return

      const px = room.player.x
      const py = room.player.y
      const ids = getActionIdsInCardinalSector(cardinal, px, py, room.mapX, room.mapY, ROOM_OBJECTS)
      this._pendingSalientActionIds = [...ids]
      const lv = getCharacterState().consciousnessLevel
      if (lv > 0) {
        this._setPendingPlayerNote(`I feel a pull toward ${cardinalDirectionLabel(cardinal)}.`)
      }
      if (phase === AVATAR_PHASE.WALKING) room.cancelWalkForPlayerSignal()
      this._directionalCooldownUntil = now + DIRECTIONAL_PULL_COOLDOWN_MS
      this._logSignal({
        type: 'directional_pull',
        phase,
        direction: key,
        sectorActionIds: ids,
        messageInjected: this._pendingPlayerSignalNote
      })
      this.emitRoomUiImmediate()

      if (phase === AVATAR_PHASE.WALKING) {
        this.requestDecisionSoon(0)
        return
      }
      if (phase === AVATAR_PHASE.AWAITING && !this._decisionInFlight) {
        this.requestDecisionSoon(0)
      }
    },

    onPlayerIntuitionPulse(room) {
      if (!this.scene || room !== this.scene || !room.player) return
      const now = this.scene.time.now
      if (now < this._intuitionCooldownUntil) return

      const phase = room.getAvatarActionPhase()
      const px = room.player.x
      const py = room.player.y
      const nearbyTypes = getAdjacentObjectTypeIds(px, py, room.mapX, room.mapY, ROOM_OBJECTS)
      const actionIds = actionIdsForObjectTypes(nearbyTypes)

      this._intuitionCooldownUntil = now + INTUITION_PULSE_COOLDOWN_MS

      if (!actionIds.length) {
        this._logSignal({
          type: 'intuition_pulse',
          phase,
          nearbyObjects: [],
          attunedObjectTypeIds: [],
          registered: false,
          messageInjected: null
        })
        this.emitRoomUiImmediate()
        return
      }

      const deepNearby = nearbyTypes.filter((id) => objectTypeHasHiddenDepth(id))
      const deepToAttune = deepNearby.filter((id) => {
        const rec = this._objectAttunementByTypeId[String(id)]
        return !rec || !rec.isAttuned
      })
      const shallowNearby = nearbyTypes.filter((id) => !objectTypeHasHiddenDepth(id))

      if (deepToAttune.length) {
        this._attuneObjectTypesForIntuition(deepToAttune, now)
        this._syncAttunementOverlaysToScene()

        // Mark all actions for attuned objects so the LLM can judge when it followed the cue.
        const salient = actionIdsForObjectTypes(deepToAttune)
        if (salient.length) {
          this._pendingSalientActionIds = [
            ...new Set([...this._pendingSalientActionIds, ...salient].map(String))
          ]
        }
      }

      if (shallowNearby.length && typeof room.playIntuitionDismissiveFlicker === 'function') {
        for (const id of shallowNearby) {
          room.playIntuitionDismissiveFlicker(id)
        }
      }

      let noteText = null
      if (deepToAttune.length) {
        noteText = buildIntuitionFeltLineForObjectTypes(deepToAttune)
        if (noteText) this._setPendingPlayerNote(noteText)
      }

      this._logSignal({
        type: 'intuition_pulse',
        phase,
        nearbyObjects: nearbyTypes,
        deepObjectTypeIds: deepNearby,
        deepIgnoredAlreadyAttuned: deepNearby.filter((id) => !deepToAttune.includes(id)),
        shallowObjectTypeIds: shallowNearby,
        newlyAttunedObjectTypeIds: deepToAttune.length ? [...deepToAttune] : [],
        registered: !!noteText,
        messageInjected: noteText
      })

      this.emitRoomUiImmediate()

      if (phase === AVATAR_PHASE.WALKING) {
        room.cancelWalkForPlayerSignal()
        this.requestDecisionSoon(0)
        return
      }

      if (phase === AVATAR_PHASE.AWAITING && !this._decisionInFlight) {
        this.requestDecisionSoon(0)
      }
    },

    onPlayerSynchronicity(room) {
      if (!this.scene || room !== this.scene || !room.player) return
      const now = this.scene.time.now
      if (now < this._syncCooldownUntil) return
      if (room.getAvatarActionPhase() !== AVATAR_PHASE.PERFORMING) return

      const actionId = room._interactionActionId
      if (!actionId) return

      const actionMeta = ACTIONS[actionId] || {}
      const objectTypeId = actionMeta.objectTypeId

      if (!objectTypeId || !objectTypeHasHiddenDepth(objectTypeId)) {
        if (typeof room.playSynchronicityBlockedFeedback === 'function') {
          room.playSynchronicityBlockedFeedback()
        }
        this._logSignal({
          type: 'synchronicity',
          phase: AVATAR_PHASE.PERFORMING,
          currentAction: actionId,
          objectTypeId: objectTypeId ?? null,
          blocked: true,
          reason: 'not_hidden_depth',
          messageInjected: null
        })
        this.emitRoomUiImmediate()
        return
      }

      const rec = this._objectAttunementByTypeId[String(objectTypeId)]
      if (!rec || !rec.isAttuned) {
        if (typeof room.playSynchronicityBlockedFeedback === 'function') {
          room.playSynchronicityBlockedFeedback()
        }
        this._logSignal({
          type: 'synchronicity',
          phase: AVATAR_PHASE.PERFORMING,
          currentAction: actionId,
          objectTypeId,
          blocked: true,
          reason: 'not_attuned',
          messageInjected: null
        })
        this.emitRoomUiImmediate()
        return
      }

      this._syncCooldownUntil = now + SYNCHRONICITY_COOLDOWN_MS

      const level = getCharacterState().consciousnessLevel
      const traits = this.defaultTraits || {}
      const perception = Number(traits.perception ?? 50)
      const boredom = Number(this.needsState.getNeeds().boredom ?? 0)
      const primed =
        perception > SYNCHRONICITY_NOTICE_PERCEPTION_THRESHOLD ||
        boredom > SYNCHRONICITY_NOTICE_BOREDOM_THRESHOLD ||
        level >= SYNCHRONICITY_NOTICE_LEVEL_MIN
      const noticeP = primed
        ? SYNCHRONICITY_NOTICE_PRIMED_CHANCE
        : SYNCHRONICITY_NOTICE_BASE_CHANCE
      const noticed = Math.random() < noticeP

      if (!noticed) {
        this._logSignal({
          type: 'synchronicity',
          phase: AVATAR_PHASE.PERFORMING,
          currentAction: actionId,
          objectTypeId: actionMeta.objectTypeId ?? null,
          primed,
          noticeP,
          noticed: false,
          messageInjected: null
        })
        this.emitRoomUiImmediate()
        return
      }

      this.flushNegativePendingDeltasOnSynchronicityInterrupt()
      if (typeof room.cancelOngoingInteractionForSynchronicity === 'function') {
        room.cancelOngoingInteractionForSynchronicity()
      }

      let noteMsg = getSynchronicityNoteForAction(actionId)
      let newlyUnlockedActionIds = []
      const discoveryStep = findMatchingDiscoveryStep(
        this._roomDiscoveryConsumedSteps,
        objectTypeId,
        actionId,
        this._roomDiscoveryChainId
      )
      if (discoveryStep) {
        this._roomDiscoveryConsumedSteps.add(discoveryStep.id)
        if (this._roomDiscoveryLockedActions) {
          newlyUnlockedActionIds = discoveryStep.unlockActionIds.filter((id) =>
            this._roomDiscoveryLockedActions.has(id)
          )
          applyDiscoveryUnlocks(this._roomDiscoveryLockedActions, discoveryStep.unlockActionIds)
        }
        noteMsg = discoveryStep.discoveryThought
      }

      if (objectTypeId) {
        this._clearAttunementAfterSuccessfulDeepSync(objectTypeId)
      }

      const lv = level
      const meterFill = METER_FILL_MULTIPLIER_BY_LEVEL[lv] ?? 1.0
      const psych = getPsychologicalFillMultiplier(this.needsState.getNeeds(), lv)
      const delta = SYNCHRONICITY_AWARENESS_BASE * meterFill * psych
      this.applyAwarenessDelta(delta)
      console.log('[awareness-signal]', JSON.stringify({
        label: 'synchronicity_noticed',
        delta,
        actionId
      }))

      if (this.awareness >= AWARENESS_MAX && getCharacterState().consciousnessLevel < 5) {
        const from = getCharacterState().consciousnessLevel
        const awarenessAtTrigger = this.awareness
        this.levelUp()
        if (DEBUG_AWARENESS_CHANGES) {
          console.log('[consciousness]', {
            type: 'levelUp',
            actionId: 'synchronicity',
            from,
            to: getCharacterState().consciousnessLevel,
            awarenessAtTrigger,
            resetAwareness: this.awareness
          })
        }
      }

      this._setPendingPlayerNote(noteMsg)

      // Only star actions when synchronicity unlocked them for the first time.
      if (newlyUnlockedActionIds.length) {
        this._pendingSalientActionIds = [
          ...new Set([...this._pendingSalientActionIds, ...newlyUnlockedActionIds].map(String))
        ]
      }

      this._logSignal({
        type: 'synchronicity',
        phase: AVATAR_PHASE.PERFORMING,
        currentAction: actionId,
        objectTypeId: actionMeta.objectTypeId ?? null,
        discoveryStepId: discoveryStep ? discoveryStep.id : null,
        primed,
        noticeP,
        noticed: true,
        interruptedAction: true,
        messageInjected: noteMsg
      })
      this.emitRoomUiImmediate()
      this.requestDecisionSoon(0)
    },

    async _runDecisionTick(token) {
      if (!this.scene || token !== this._aiLoopToken) return

      const AI_DECISION_INTERVAL_MS = 5000 / TEST_SPEED_MULTIPLIER

      if (this._suppressAIUntilMs && this.scene.time.now < this._suppressAIUntilMs) {
        this._scheduleDecisionLoopTick(token, AI_DECISION_INTERVAL_MS)
        return
      }

      if (this.scene.isExecutingAction) {
        this._scheduleDecisionLoopTick(token, AI_DECISION_INTERVAL_MS)
        return
      }

      if (this._decisionInFlight) {
        this._scheduleDecisionLoopTick(token, 250)
        return
      }

      const { note, salientActionIds, feltOutcomeLine } = this._snapshotPendingForDecision()

      this._decisionInFlight = true
      try {
        let actionId = null
        try {
          const allowedActions = this.getAvailableActionIdsForDecision()
          actionId = await this.chooseNextActionAsync({
            playerSignal: null,
            playerSignalNote: note,
            availableActions: allowedActions,
            salientActionIds,
            significantMemory: null,
            feltOutcomeLine
          })
        } catch (e) {
          actionId = pickUniformRandomActionId(this.getAvailableActionIdsForDecision())
          this.setReasoningFromDecision({
            action: actionId,
            thought: '',
            reason: `Fallback (no LLM): ${getActionLabel(actionId)}`
          })
        }

        if (actionId) {
          this._activeActionDecision = this._lastLLMDecision

          this._recentActionIds.push(actionId)
          if (this._recentActionIds.length > 20) this._recentActionIds = this._recentActionIds.slice(-20)

          const started = this.scene.executeAction(actionId)
          if (!started) {
            this._activeActionDecision = null
            this._activeActionReasonText = ''
          }
        }
      } finally {
        this._decisionInFlight = false
      }

      this._scheduleDecisionLoopTick(token, AI_DECISION_INTERVAL_MS)
    },

    _emitRoomUiState() {
      if (!this.scene) return
      const now = this.scene.time.now
      const needs = this.needsState.getNeeds()
      const avatarPhase =
        typeof this.scene.getAvatarActionPhase === 'function'
          ? this.scene.getAvatarActionPhase()
          : 'awaiting'

      EventBus.emit('room-ui-state', {
        needs: { ...needs },
        pendingNeedDeltas: { ...this.pendingNeedDeltas },
        awareness: this.awareness,
        traits: this.defaultTraits ? { ...this.defaultTraits } : {},
        reasoningText: this._reasoningLog.length
          ? this._reasoningLog.join(REASONING_LOG_SEPARATOR)
          : 'Waiting for next decision…',
        avatarPhase,
        signalCooldownsMs: {
          directional: Math.max(0, this._directionalCooldownUntil - now),
          intuition: Math.max(0, this._intuitionCooldownUntil - now),
          synchronicity: Math.max(0, this._syncCooldownUntil - now)
        },
        gameClockDisplay: formatInGameClock(this._gameClockMinutes)
      })
    },

    emitUiStateThrottled() {
      if (!this.scene) return
      const now = this.scene.time.now
      const anySignalCd =
        now < this._directionalCooldownUntil ||
        now < this._intuitionCooldownUntil ||
        now < this._syncCooldownUntil
      const minGap = anySignalCd ? 50 : 100
      if (now - this._lastUiEmit < minGap) return
      this._lastUiEmit = now
      this._emitRoomUiState()
    },

    emitRoomUiImmediate() {
      if (!this.scene) return
      this._lastUiEmit = this.scene.time.now
      this._emitRoomUiState()
    },

    getRegressionWindowMs(level) {
      return REGRESSION_WINDOW_MS_BY_LEVEL[level] || REGRESSION_WINDOW_MS_BY_LEVEL[1] || 9000
    },

    meterFillMultiplier() {
      const level = getCharacterState().consciousnessLevel
      return METER_FILL_MULTIPLIER_BY_LEVEL[level] ?? 1.0
    },

    setAwarenessMeterForCurrentLevel(nextValue) {
      const clamped = buildClamp(nextValue, AWARENESS_MIN, AWARENESS_MAX)
      const level = getCharacterState().consciousnessLevel
      this.awarenessByLevel[level] = clamped
      this.awareness = clamped
    },

    enterCriticalStateIfNeeded() {
      if (this.isCriticalState) return
      this.isCriticalState = true
      this._criticalStartedAtMs = this.scene ? this.scene.time.now : Date.now()
    },

    exitCriticalState() {
      if (!this.isCriticalState) return
      this.isCriticalState = false
      this._criticalStartedAtMs = null
    },

    applyAwarenessDelta(deltaPoints) {
      if (typeof deltaPoints !== 'number' || !Number.isFinite(deltaPoints) || deltaPoints === 0) return

      const prevAwareness = this.awareness
      this.setAwarenessMeterForCurrentLevel(prevAwareness + deltaPoints)

      if (prevAwareness > AWARENESS_MIN && this.awareness <= AWARENESS_MIN) {
        this.enterCriticalStateIfNeeded()
        if (DEBUG_AWARENESS_CHANGES) {
          console.log('[awareness]', {
            type: 'critical_enter',
            level: getCharacterState().consciousnessLevel,
            prevAwareness,
            nextAwareness: this.awareness,
            deltaPoints: deltaPoints
          })
        }
      } else if (prevAwareness <= AWARENESS_MIN && this.awareness > AWARENESS_MIN) {
        this.exitCriticalState()
        if (DEBUG_AWARENESS_CHANGES) {
          console.log('[awareness]', {
            type: 'critical_exit',
            level: getCharacterState().consciousnessLevel,
            prevAwareness,
            nextAwareness: this.awareness,
            deltaPoints: deltaPoints
          })
        }
      }
    },

    checkCriticalRegression() {
      if (!this.isCriticalState) return
      if (this.awareness > AWARENESS_MIN) return
      if (this._criticalStartedAtMs == null) return

      const level = getCharacterState().consciousnessLevel
      const elapsed = (this.scene ? this.scene.time.now : Date.now()) - this._criticalStartedAtMs
      const windowMs = this.getRegressionWindowMs(level)
      if (elapsed < windowMs) return

      if (level <= 0) {
        // Level 0 never regresses; remain critical until meter recovers.
        this._criticalStartedAtMs = (this.scene ? this.scene.time.now : Date.now())
        return
      }

      if (DEBUG_AWARENESS_CHANGES) {
        console.log('[consciousness]', {
          type: 'levelDown',
          from: level,
          to: level - 1,
          elapsedMs: Math.round(elapsed),
          windowMs: windowMs
        })
      }
      this.levelDown()
    },

    resetLoopTracking() {
      this._lastCompletedActionId = null
      this._repeatStreakLen = 0
      this._executedActionHistory = []
      this._lastPositiveAwarenessAtMs = (this.scene ? this.scene.time.now : Date.now())
    },

    levelUp() {
      const level = getCharacterState().consciousnessLevel
      if (level >= 5) {
        this.setAwarenessMeterForCurrentLevel(AWARENESS_MAX)
        return
      }

      const nextLevel = level + 1
      setConsciousnessLevel(nextLevel)

      this.isCriticalState = false
      this._criticalStartedAtMs = null

      this.awarenessByLevel[nextLevel] = AWARENESS_START
      this.awareness = AWARENESS_START
      this.resetLoopTracking()

      this._suppressAIUntilMs = this.scene ? this.scene.time.now + 1000 : Date.now() + 1000
    },

    levelDown() {
      const level = getCharacterState().consciousnessLevel
      if (level <= 0) return

      const nextLevel = level - 1
      setConsciousnessLevel(nextLevel)

      this.isCriticalState = false
      this._criticalStartedAtMs = null

      this.awarenessByLevel[nextLevel] = AWARENESS_START
      this.awareness = AWARENESS_START
      this.resetLoopTracking()

      this._suppressAIUntilMs = this.scene ? this.scene.time.now + 1000 : Date.now() + 1000
    },

    applyPendingNeedDeltas(deltaMs) {
      const needs = this.needsState.getNeeds()
      const pending = this.pendingNeedDeltas
      const totalDeltas = this.pendingNeedTotalDeltas
      const durationMs = this.pendingNeedChangeTotalMs || 2500

      for (const key of Object.keys(pending)) {
        const remaining = pending[key]
        if (remaining === 0 || !NEED_KEYS.includes(key)) continue

        const totalDelta = totalDeltas[key]
        if (typeof totalDelta !== 'number' || !Number.isFinite(totalDelta) || totalDelta === 0) continue

        // Linear per-action progression: fixed rate based on original action delta.
        const stepByRate = (totalDelta / durationMs) * deltaMs
        const sameDirection = Math.sign(stepByRate) === Math.sign(remaining)
        const boundedStep = sameDirection
          ? Math.sign(stepByRate) * Math.min(Math.abs(stepByRate), Math.abs(remaining))
          : 0
        const toApply = boundedStep
        const current = needs[key]
        const target = current + toApply
        const clamped = buildClamp(target, 0, 100)
        const actual = clamped - current

        needs[key] = clamped
        pending[key] = remaining - actual
        if (Math.abs(pending[key]) < 0.5) delete pending[key]
      }
    },

    /**
     * Successful synchronicity ends the action early: apply any still-pending need deltas
     * whose total for this action was negative (relief), and drop the rest (e.g. any
     * positive deltas like fatigue) without applying. Uses whatever ACTION_EFFECTS the
     * current action has — same rules for all actions on hasHiddenDepth objects.
     */
    flushNegativePendingDeltasOnSynchronicityInterrupt() {
      const needs = this.needsState.getNeeds()
      const pending = this.pendingNeedDeltas
      const totalDeltas = this.pendingNeedTotalDeltas

      if (pending && Object.keys(pending).length > 0) {
        for (const key of Object.keys(pending)) {
          if (!NEED_KEYS.includes(key)) continue
          const total = totalDeltas[key]
          const remaining = pending[key]
          if (typeof total !== 'number' || !Number.isFinite(total)) continue
          if (typeof remaining !== 'number' || !Number.isFinite(remaining) || remaining === 0) continue
          if (total < 0) {
            needs[key] = buildClamp(needs[key] + remaining, 0, 100)
          }
        }
      }

      this.pendingNeedDeltas = {}
      this.pendingNeedTotalDeltas = {}
      this.pendingNeedChangeTotalMs = null
      this._activeHabituationCounterKeys = []
      this._activeHabituationDetails = []
      this._activeActionNeedsSnapshot = null
      this._activeActionDecision = null
      this._activeActionReasonText = ''
    },

    onActionStarted(actionId, durationMs) {
      this.pendingNeedDeltas = {}
      this.pendingNeedTotalDeltas = {}
      this.pendingNeedChangeTotalMs = durationMs
      this._activeHabituationCounterKeys = []
      this._activeHabituationDetails = []

      const effects = ACTION_EFFECTS[actionId]
      const actionMeta = ACTIONS[actionId] || {}
      const habituationRateRaw = Number(actionMeta.habituationRate)
      const habituationRate = Number.isFinite(habituationRateRaw) ? habituationRateRaw : 1.0
      const habituationNeeds = Array.isArray(actionMeta.habituationNeeds) ? actionMeta.habituationNeeds : []
      if (effects) {
        for (const [key, delta] of Object.entries(effects)) {
          if (NEED_KEYS.includes(key)) {
            let effectiveDelta = delta
            const shouldHabituate = habituationRate < 1.0 && habituationNeeds.includes(key)
            if (shouldHabituate) {
              const counterKey = getHabituationCounterKey(actionId, key)
              const useCount = this.habituationCounters[counterKey] || 0
              effectiveDelta = delta * Math.pow(habituationRate, useCount)
              this._activeHabituationCounterKeys.push(counterKey)
              this._activeHabituationDetails.push({
                counterKey,
                needKey: key,
                baseDelta: delta,
                effectiveDelta,
                useCountBefore: useCount,
                rate: habituationRate
              })
            }

            this.pendingNeedDeltas[key] = effectiveDelta
            this.pendingNeedTotalDeltas[key] = effectiveDelta
          }
        }
      }

      // Snapshot needs at action start for “need resolution” checks.
      this._activeActionNeedsSnapshot = { ...this.needsState.getNeeds() }
      const decision = this._activeActionDecision
      this._activePostActionEvaluation = {
        actionId,
        primary: getDecisionFactorNeedKey(decision, 'primary'),
        secondary: getDecisionFactorNeedKey(decision, 'secondary'),
        needsBefore: { ...this._activeActionNeedsSnapshot }
      }
    },

    onActionCompleted(actionId) {
      this._completedDecisionCount += 1

      // Ensure pending need arrows don't linger after the action ends.
      // If there is any remaining "pending" delta (action ended early / rounding),
      // apply it immediately and clear the pending state.
      if (this.pendingNeedDeltas && Object.keys(this.pendingNeedDeltas).length > 0) {
        const needs = this.needsState.getNeeds()
        for (const [key, remaining] of Object.entries(this.pendingNeedDeltas)) {
          if (!NEED_KEYS.includes(key)) continue
          if (typeof remaining !== 'number' || !Number.isFinite(remaining) || remaining === 0) continue
          needs[key] = buildClamp(needs[key] + remaining, 0, 100)
        }
        this.pendingNeedDeltas = {}
        this.pendingNeedTotalDeltas = {}
        this.pendingNeedChangeTotalMs = null
      }

      // Habituation counters advance when the action actually completes.
      const habituationCounterUpdates = []
      if (Array.isArray(this._activeHabituationCounterKeys) && this._activeHabituationCounterKeys.length > 0) {
        for (const counterKey of this._activeHabituationCounterKeys) {
          const prev = this.habituationCounters[counterKey] || 0
          const next = prev + 1
          this.habituationCounters[counterKey] = next
          habituationCounterUpdates.push({ counterKey, before: prev, after: next })
        }
      }

      // Sleep partially recovers habituation sensitivity.
      const sleepHabituationRecovery = []
      if (actionId === 'go_back_to_sleep') {
        for (const [counterKey, count] of Object.entries(this.habituationCounters)) {
          const n = Number(count)
          if (!Number.isFinite(n) || n <= 0) continue
          const next = Math.floor(n * 0.70)
          this.habituationCounters[counterKey] = next
          if (next !== n) {
            sleepHabituationRecovery.push({ counterKey, before: n, after: next })
          }
        }
      }

      // Apply awareness fills/drains based on the stored decision + need snapshots.
      const levelAtAction = getCharacterState().consciousnessLevel
      const meterFillMultiplier = METER_FILL_MULTIPLIER_BY_LEVEL[levelAtAction] ?? 1.0
      const awarenessBefore = this.awareness
      const actionMeta = ACTIONS[actionId] || {}
      const repetitionRisk = String(actionMeta.repetitionRisk || 'medium').toLowerCase()
      const repetitionRiskMultiplier = REPETITION_RISK_MULTIPLIER_BY_LEVEL[repetitionRisk] ?? REPETITION_RISK_MULTIPLIER_BY_LEVEL.medium

      const decision = this._activeActionDecision
      const reasonText = (decision && decision.reason) ? decision.reason : this._activeActionReasonText
      const needsBefore = this._activeActionNeedsSnapshot
      const needsAfter = this.needsState.getNeeds()
      const psychologicalFillMultiplier = getPsychologicalFillMultiplier(needsAfter, levelAtAction)
      const evalCtx = this._activePostActionEvaluation

      // Post-action felt-outcome evaluation (primary/secondary only), plus mismatch friction.
      if (evalCtx && evalCtx.needsBefore && evalCtx.actionId === actionId) {
        const primaryResult = classifyNeedOutcome(evalCtx.primary, evalCtx.needsBefore, needsAfter)
        const secondaryResult = classifyNeedOutcome(evalCtx.secondary, evalCtx.needsBefore, needsAfter)
        const primaryFailed = isFailureResult(primaryResult)
        const secondaryFailed = isFailureResult(secondaryResult)
        const primarySucceeded = isSuccessResult(primaryResult)

        const frustrationApplied = {}
        const addFrustration = (needKey, delta) => {
          if (!needKey || !NEED_KEYS.includes(needKey)) return
          const before = Number(needsAfter[needKey] ?? 0)
          const after = buildClamp(before + delta, 0, 100)
          const actual = after - before
          if (actual === 0) return
          needsAfter[needKey] = after
          frustrationApplied[needKey] = (frustrationApplied[needKey] || 0) + actual
        }

        if (primarySucceeded && secondaryFailed) {
          if (isPsychologicalNeed(evalCtx.secondary)) {
            addFrustration(evalCtx.secondary, 2)
          }
        } else if (primaryFailed && !secondaryFailed) {
          const target = isPsychologicalNeed(evalCtx.primary) ? evalCtx.primary : 'stress'
          addFrustration(target, 4)
        } else if (primaryFailed && secondaryFailed) {
          const pPsych = isPsychologicalNeed(evalCtx.primary)
          const sPsych = isPsychologicalNeed(evalCtx.secondary)
          if (pPsych && sPsych && evalCtx.primary !== evalCtx.secondary) {
            addFrustration(evalCtx.primary, 4)
            addFrustration(evalCtx.secondary, 2)
          } else if (pPsych) {
            addFrustration(evalCtx.primary, 6)
          } else if (sPsych) {
            addFrustration(evalCtx.secondary, 6)
          } else {
            addFrustration('stress', 6)
          }
        }

        const feltOutcome = buildFeltOutcomeLine(
          actionId,
          evalCtx.primary,
          evalCtx.secondary,
          primaryResult,
          secondaryResult,
          evalCtx.needsBefore,
          needsAfter
        )

        const postActionEvaluation = {
          actionId,
          primary: evalCtx.primary || 'none',
          secondary: evalCtx.secondary || 'none',
          primaryResult,
          secondaryResult,
          feltOutcome,
          frustrationApplied,
          needsBefore: { ...evalCtx.needsBefore },
          needsAfter: { ...needsAfter }
        }

        this._lastPostActionEvaluation = postActionEvaluation
        this._pendingFeltOutcomeLine = feltOutcome
      } else {
        this._lastPostActionEvaluation = null
      }

      let awarenessDelta = 0
      let positiveFillPoints = 0
      const awarenessBreakdown = []
      const lastCompletedActionId = this._executedActionHistory[this._executedActionHistory.length - 1] || null
      const twoBackActionId = this._executedActionHistory[this._executedActionHistory.length - 2] || null
      const addBreakdown = (label, delta) => {
        if (typeof delta !== 'number' || !Number.isFinite(delta) || delta === 0) return
        awarenessBreakdown.push({ label, delta })
      }
      const addPositiveFill = (label, rawFill) => {
        if (typeof rawFill !== 'number' || !Number.isFinite(rawFill) || rawFill <= 0) return
        const adjusted = rawFill * psychologicalFillMultiplier
        if (adjusted <= 0) return
        awarenessDelta += adjusted
        positiveFillPoints += adjusted
        addBreakdown(label, adjusted)
      }

      // Repetition penalty (starts on 3rd consecutive same action, not 2nd).
      if (actionId === this._lastCompletedActionId) {
        this._repeatStreakLen += 1
        const streakLen = this._repeatStreakLen
        if (streakLen >= 3) {
          const tierKey = Math.min(streakLen - 1, 5)
          const penaltyBase = REPETITION_DRAIN_POINTS_BY_STREAK_LEN[tierKey] || 15
          const penalty = penaltyBase * repetitionRiskMultiplier
          const delta = -penalty
          awarenessDelta += delta
          addBreakdown('repetition_penalty', delta)
        }
      } else {
        const endedStreak = this._repeatStreakLen
        this._repeatStreakLen = 1
        this._lastCompletedActionId = actionId
        if (endedStreak >= BROKE_LOOP_MIN_STREAK) {
          const fill = FILL_BASES.broke_loop * meterFillMultiplier
          addPositiveFill('broke_loop', fill)
        }

        // Soft repetition: A -> B -> A gets half of the streak-2 repetition penalty.
        // This catches quick bounce-backs without treating them as full loops.
        if (actionId !== lastCompletedActionId && actionId === twoBackActionId) {
          const basePenalty = REPETITION_DRAIN_POINTS_BY_STREAK_LEN[2] || 2
          const delta = -(basePenalty * SOFT_REPEAT_PENALTY_MULTIPLIER * repetitionRiskMultiplier)
          awarenessDelta += delta
          addBreakdown('soft_repeat_penalty', delta)
        }
      }

      // Avoidance drain.
      if (isAvoidanceReasonText(reasonText)) {
        const delta = -AVOIDANCE_DRAIN_POINTS
        awarenessDelta += delta
        addBreakdown('avoidance_drain', delta)
      }

      // Insight/genuine-choice fills from structured LLM keys.
      if (decision && decision.pattern_noticed) {
        const fill = FILL_BASES.pattern_noticed * meterFillMultiplier
        addPositiveFill('pattern_noticed', fill)
      }
      if (decision && decision.signal_response) {
        const fill = FILL_BASES.signal_response * meterFillMultiplier
        addPositiveFill('signal_response', fill)
      }
      if (decision && decision.guidance) {
        const fill = FILL_BASES.guidance * meterFillMultiplier
        addPositiveFill('guidance', fill)
      }
      if (decision && decision.state) {
        const fill = FILL_BASES.state * meterFillMultiplier
        addPositiveFill('state', fill)
      }

      // Need resolution fill (heuristic).
      if (needsBefore && needsAfter && ACTION_EFFECTS[actionId]) {
        const fatigueBefore = needsBefore.fatigue ?? 0
        const stressBefore = needsBefore.stress ?? 0
        const fatigueIsHigh = fatigueBefore >= NEED_RESOLUTION_MIN_NEED
        const stressIsDrivingSleep = stressBefore >= 65 && fatigueBefore < 50

        if (actionMeta.avoidancePositive) {
          if (stressIsDrivingSleep) {
            const delta = -AVOIDANCE_DRAIN_POINTS
            awarenessDelta += delta
            addBreakdown('avoidance_positive_drain', delta)
          } else if (!fatigueIsHigh) {
            // Neutral outcome for avoidance-positive actions when not genuinely tired.
            // Skip both need-resolution fill and avoidance drain.
          }
        }

        let resolvedNeedKey = null
        const effects = ACTION_EFFECTS[actionId]
        const allowNeedResolutionForAction = !actionMeta.avoidancePositive || fatigueIsHigh
        if (allowNeedResolutionForAction) {
          for (const [needKey, delta] of Object.entries(effects)) {
            if (!PSYCHOLOGICAL_NEED_KEYS.includes(needKey)) continue
            if (typeof delta !== 'number') continue
            if (delta < 0) {
              const before = needsBefore[needKey]
              const after = needsAfter[needKey]
              if (before < NEED_RESOLUTION_MIN_NEED || after > before - 10) continue

              const lastDecision = this._needResolutionLastDecisionByNeed[needKey]
              const decisionGap = this._completedDecisionCount - (lastDecision ?? -99999)
              if (decisionGap < NEED_RESOLUTION_COOLDOWN_DECISIONS) continue

              resolvedNeedKey = needKey
              break
            }
          }
        }
        if (resolvedNeedKey) {
          const fill = 3 * meterFillMultiplier
          addPositiveFill('need_resolution', fill)
          this._needResolutionLastDecisionByNeed[resolvedNeedKey] = this._completedDecisionCount
        }
      }

      this.applyAwarenessDelta(awarenessDelta)
      const awarenessAfter = this.awareness

      if (positiveFillPoints > 0) {
        this._lastPositiveAwarenessAtMs = this.scene ? this.scene.time.now : Date.now()
      }

      // Stagnation/history for drain heuristics.
      this._executedActionHistory.push(actionId)
      if (this._executedActionHistory.length > 12) {
        this._executedActionHistory = this._executedActionHistory.slice(-12)
      }

      if (this.awareness >= AWARENESS_MAX && getCharacterState().consciousnessLevel < 5) {
        const from = getCharacterState().consciousnessLevel
        const awarenessAtTrigger = this.awareness
        this.levelUp()
        const to = getCharacterState().consciousnessLevel
        if (DEBUG_AWARENESS_CHANGES) {
          console.log('[consciousness]', {
            type: 'levelUp',
            actionId,
            from,
            to,
            awarenessAtTrigger,
            resetAwareness: this.awareness
          })
        }
      }

      if (DEBUG_AWARENESS_CHANGES) {
        const awarenessFinal = this.awareness
        const realWorldTimestamp = buildRealWorldTimestamp(this._realSessionStartedAtMs)
        const awarenessLogPayload = {
          type: 'action_complete',
          actionId,
          level: levelAtAction,
          llmReasoning: buildLlmReasoningPayload(decision, this._activeActionReasonText),
          realWorldTimestamp,
          needsAtActionStart: needsBefore ? { ...needsBefore } : null,
          awarenessBefore,
          awarenessAfterApply: awarenessAfter,
          awarenessAfterFinal: awarenessFinal,
          deltaApplied: awarenessAfter - awarenessBefore,
          deltaFinalApplied: awarenessFinal - awarenessBefore,
          hasAwarenessChange: awarenessAfter !== awarenessBefore,
          psychologicalFillMultiplier,
          breakdown: awarenessBreakdown,
          postActionEvaluation: this._lastPostActionEvaluation,
          habituation: {
            details: this._activeHabituationDetails,
            counterUpdates: habituationCounterUpdates,
            sleepRecovery: sleepHabituationRecovery
          }
        }
        if (DEBUG_AWARENESS_CHANGES_JSON) {
          console.log('[awareness-json]', JSON.stringify(awarenessLogPayload))
        }
      }

      // Clear per-action context.
      this._activeActionNeedsSnapshot = null
      this._activeActionReasonText = ''
      this._activeActionDecision = null
      this._activeHabituationCounterKeys = []
      this._activeHabituationDetails = []
      this._activePostActionEvaluation = null
    },

    async chooseNextActionAsync({
      playerSignal = null,
      playerSignalNote = null,
      availableActions = null,
      salientActionIds = null,
      significantMemory = null,
      feltOutcomeLine = null
    } = {}) {
      this._lastLLMDecision = null

      let traitTensions = null
      if (Array.isArray(this.cosmicChartPlacements) && this.cosmicChartPlacements.length > 0) {
        const detail = generateTraitSheetDetailed(this.cosmicChartPlacements)
        traitTensions = detail.tensions
      }

      const actionsList =
        Array.isArray(availableActions) && availableActions.length
          ? [...availableActions]
          : [...AVAILABLE_ACTION_IDS_ALPHABETICAL]

      const allowedSet = new Set(actionsList.map(String))
      const salientRaw =
        Array.isArray(salientActionIds) && salientActionIds.length
          ? [...salientActionIds]
          : []
      const salient = salientRaw.filter((id) => allowedSet.has(String(id)))

      const res = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consciousnessLevel: getCharacterState().consciousnessLevel,
          needs: this.needsState.getNeeds(),
          traits: this.defaultTraits,
          traitTensions,
          availableActions: actionsList,
          salientActionIds: salient,
          playerSignal,
          playerSignalNote: playerSignalNote ?? null,
          feltOutcomeLine: feltOutcomeLine ?? null,
          recentActions: this._recentActionIds.slice(-10),
          significantMemory
        })
      })

      if (!res.ok) throw new Error(`decision HTTP ${res.status}`)
      const data = await res.json()
      if (!data || !data.action) throw new Error('missing action in response')

      if (data._llmDebug) {
        const d = data._llmDebug
        if (LOG_LLM_PROMPT_BROWSER && Array.isArray(d.messages)) {
          const systemMsg = d.messages.find((m) => m.role === 'system')
          const userMsg = d.messages.find((m) => m.role === 'user')
          // console.log('%c[llm] → system prompt', 'font-weight:bold', '\n', systemMsg?.content ?? '')
          console.log('%c[llm] → user message', 'font-weight:bold', '\n', userMsg?.content ?? '')
        }
        if (LOG_LLM_DECISION_DEBUG) {
          console.log(
            '%c[llm-decision]%c provider:',
            'font-weight:bold',
            '',
            d.provider,
            'model:',
            d.modelId
          )
          console.log('[llm-decision] request (game → server)', d.requestBody)
          console.log('[llm-decision] messages to LLM', d.messages)
          console.log('[llm-decision] raw JSON from model', d.rawParsed)
          console.log('[llm-decision] normalized (server → game)', d.normalized)
        }
        delete data._llmDebug
      }

      // Log the decision after we've printed the prompt (if available), so the console ordering matches causality intuition.
      console.log(
        '[llm-decision] \n' +
          'action: ' + JSON.stringify(data.action ?? null, null, 2) + '\n',
        'thought: ' + JSON.stringify(data.thought ?? null, null, 2) + '\n',
        'reason: ' + JSON.stringify(data.reason ?? null, null, 2) + '\n',
        'decision_factors: ' + JSON.stringify(data.decision_factors ?? null, null, 2)
      )

      this._lastLLMDecision = data
      this.setReasoningFromDecision(data)
      return data.action
    },

    setReasoningFromDecision(decision) {
      if (!decision) return
      const level = getCharacterState().consciousnessLevel
      const thought = decision.thought || ''
      const reason = level === 0 ? '' : (decision.reason || '')
      const mainBody = [thought, reason].filter(Boolean).join(' ').trim()
      const extras = ['unease', 'pattern_noticed', 'signal_response', 'guidance', 'state']
        .map((k) => (decision[k] ? `${k}: ${decision[k]}` : null))
        .filter(Boolean)
      const parts = [mainBody, ...extras].filter(Boolean)
      const body = parts.join(' ').trim() || '…'
      const clockLabel = formatInGameClock(this._gameClockMinutes)
      const entryText = `${clockLabel}:  ${body}`

      this._activeActionReasonText = entryText
      this._reasoningLog.unshift(entryText)
      if (this._reasoningLog.length > RECENT_DECISION_HISTORY_MAX) {
        this._reasoningLog.length = RECENT_DECISION_HISTORY_MAX
      }
    },

    _startAIActionLoop(token) {
      if (!this.scene) return
      const AI_DECISION_INTERVAL_MS = 5000 / TEST_SPEED_MULTIPLIER
      this._scheduleDecisionLoopTick(token, AI_DECISION_INTERVAL_MS)
    },

    // Called from Room.update().
    update(deltaMs) {
      if (!this.scene) return

      // deltaMs from Room already includes Phaser timeScale (speed / pause).
      this._gameClockMinutes += (deltaMs / REAL_MS_PER_IN_GAME_DAY) * IN_GAME_DAY_MINUTES
      this._gameClockMinutes =
        ((this._gameClockMinutes % IN_GAME_DAY_MINUTES) + IN_GAME_DAY_MINUTES) %
        IN_GAME_DAY_MINUTES

      const gameMinutesDelta = (deltaMs / 1000) * GAME_MINUTES_PER_REAL_SECOND * TEST_SPEED_MULTIPLIER

      // Needs drift.
      this.needsState.tick(gameMinutesDelta, this.defaultTraits, null)

      // Hidden entropy pressure derived from unmet needs.
      this.entropyState.entropy = updateEntropyFromNeeds(
        this.needsState.getNeeds(),
        this.entropyState.entropy,
        gameMinutesDelta
      )

      // Awareness drain derived from hidden entropy pressure.
      const entropyPressure = Math.max(0, Math.min(1, this.entropyState.entropy / AWARENESS_MAX))

      const criticalElapsedMs = this.isCriticalState && this._criticalStartedAtMs != null
        ? this.scene.time.now - this._criticalStartedAtMs
        : 0
      const criticalWindowMs = this.getRegressionWindowMs(getCharacterState().consciousnessLevel)
      const criticalProgress01 = criticalWindowMs > 0
        ? Math.max(0, Math.min(1, criticalElapsedMs / criticalWindowMs))
        : 0

      const criticalMultiplier = 1 + (this.isCriticalState ? CRITICAL_ARCHON_DRAIN_MULTIPLIER_MAX * criticalProgress01 : 0)
      const archonDrainPoints = ARCHON_DRAIN_POINTS_PER_MINUTE_AT_FULL * entropyPressure * gameMinutesDelta * criticalMultiplier
      this.applyAwarenessDelta(-archonDrainPoints)

      // Stagnation drain: cycles through a small set without positive awareness fills.
      if (this._executedActionHistory.length >= 8) {
        const unique = new Set(this._executedActionHistory).size
        const sincePositiveMs = this.scene.time.now - this._lastPositiveAwarenessAtMs
        if (unique <= STAGNATION_UNIQUE_ACTIONS_MAX && sincePositiveMs > STAGNATION_MS + STAGNATION_GRACE_AFTER_POSITIVE_MS) {
          const stagnationDrain = STAGNATION_DRAIN_POINTS_PER_MINUTE * gameMinutesDelta
          this.applyAwarenessDelta(-stagnationDrain)
        }
      }

      this.checkCriticalRegression()

      // Gradual need resolution during actions.
      this.applyPendingNeedDeltas(deltaMs * TEST_SPEED_MULTIPLIER)

      this.emitUiStateThrottled()
    }
  }

  // Ensure starting awareness matches current consciousnessLevel.
  const startLevel = getCharacterState().consciousnessLevel
  engine.awarenessByLevel[startLevel] = AWARENESS_START
  engine.awareness = AWARENESS_START

  engineSingleton = engine
  return engine
}

