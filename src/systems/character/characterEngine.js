import { EventBus } from '../../eventBus.js'
import { createNeedsState, NEED_KEYS, ACTION_EFFECTS, INITIAL_NEEDS } from '../needs/index.js'
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
import { getCharacterState } from './characterState.js'
import {
  AVATAR_PHASE,
  DIRECTIONAL_PULL_COOLDOWN_MS,
  INTUITION_PULSE_COOLDOWN_MS,
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
import {
  BASELINE_AWARENESS_MAX,
  computeBaselineAwarenessBreakdown,
  getBaseModeAwarenessDelta,
  scaleModeDeltaByBaseline
} from '../awareness/index.js'

const GAME_MINUTES_PER_REAL_SECOND = 1 / 60
// Base multiplier is 1. Game speed is controlled at runtime via Phaser `timeScale`.
const TEST_SPEED_MULTIPLIER = 1

const LOG_LLM_DECISION_DEBUG = false
/** Log system + user messages in the browser when the server includes `_llmDebug` (see `LOG_LLM_IO`). */
const LOG_LLM_PROMPT_BROWSER =
  import.meta.env.VITE_LOG_LLM_PROMPT !== 'false'
const DEBUG_AWARENESS_CHANGES = false
const DEBUG_AWARENESS_CHANGES_JSON = true

/** Smoothed HUD meter: final awareness = baseline (0–50) + dynamic buffer (0–baseline), max 100. */
const AWARENESS_METER_MIN = 0
const AWARENESS_METER_MAX = 100
/** On final 0–100 meter (baseline + dynamic). */
const AWARENESS_ENTRAPMENT_THRESHOLD = 20
const AWARENESS_CLARITY_THRESHOLD = 80
/** Seconds-like smoothing; higher = snappier toward target baseline. */
const BASELINE_AWARENESS_SMOOTH_TAU_MS = 180
/** Extra awareness gained when the LLM indicates player-signal genuinely influenced choice. */
const PLAYER_SIGNAL_USED_AWARENESS_BONUS = 5
/** Awareness penalty when the LLM says player-signal was ignored. */
const PLAYER_SIGNAL_IGNORED_AWARENESS_PENALTY = -2

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
const RECENT_FELT_OUTCOMES_MAX = 12
const RECENT_PATTERN_SUMMARIES_MAX = 8

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
      felt_memory: decision.felt_memory != null && decision.felt_memory !== '' ? decision.felt_memory : null,
      signal_response: decision.signal_response != null && decision.signal_response !== '' ? decision.signal_response : null,
      guidance: decision.guidance != null && decision.guidance !== '' ? decision.guidance : null,
      what_i_am_testing: decision.what_i_am_testing != null && decision.what_i_am_testing !== '' ? decision.what_i_am_testing : null,
      state: decision.state != null && decision.state !== '' ? decision.state : null
    }
  }
  return {
    source: 'fallback',
    thought: '',
    reason: typeof fallbackReasonText === 'string' ? fallbackReasonText : '',
    unease: null,
    pattern_noticed: null,
    felt_memory: null,
    signal_response: null,
    guidance: null,
    what_i_am_testing: null,
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

function buildLoopHintFromRecentActions(recentActionIds) {
  const ids = Array.isArray(recentActionIds) ? recentActionIds.filter(Boolean) : []
  if (ids.length < 4) return null
  const window = ids.slice(-8)
  const counts = new Map()
  for (const id of window) {
    counts.set(id, (counts.get(id) || 0) + 1)
  }
  let topId = null
  let topCount = 0
  for (const [id, count] of counts.entries()) {
    if (count > topCount) {
      topId = id
      topCount = count
    }
  }
  if (!topId || topCount < 3) return null
  const label = getActionLabel(topId) || topId
  return `I keep circling back to ${label}.`
}

/** Subjective outcome phrasing after an em dash ("it …"), for pairing with the past-tense action. */
function buildFeltOutcomeTail(primaryNeedKey, secondaryNeedKey, primaryResult, secondaryResult, needsBefore, needsAfter) {
  const hasPrimaryNeed = !!primaryNeedKey
  const hasSecondaryNeed = !!secondaryNeedKey

  if (!hasPrimaryNeed && !hasSecondaryNeed) {
    return 'it did not really help.'
  }

  if (hasPrimaryNeed && hasSecondaryNeed && primaryNeedKey !== secondaryNeedKey) {
    const pText = makeDeltaText(needsBefore?.[primaryNeedKey], needsAfter?.[primaryNeedKey])
    const sText = makeDeltaText(needsBefore?.[secondaryNeedKey], needsAfter?.[secondaryNeedKey])
    const primaryLabel = NEED_LABELS[primaryNeedKey]?.toLowerCase() || primaryNeedKey
    const secondaryLabel = NEED_LABELS[secondaryNeedKey]?.toLowerCase() || secondaryNeedKey

    // Converts delta text into a clause without the leading subject ("it ...").
    const clauseFor = (deltaText, label) => {
      if (deltaText === 'did not really help') return `did not help with ${label}`
      if (deltaText === 'made it worse') return `made ${label} worse`
      return `${deltaText} with ${label}`
    }

    if (isSuccessResult(primaryResult) && isFailureResult(secondaryResult)) {
      return `it ${pText} with ${primaryLabel}. I still feel ${secondaryLabel}.`
    }
    if (isFailureResult(primaryResult) && isSuccessResult(secondaryResult)) {
      return `it ${sText} with ${secondaryLabel}. I still feel ${primaryLabel}.`
    }
    if (isSuccessResult(primaryResult) && isSuccessResult(secondaryResult)) {
      return `it ${pText} with ${primaryLabel} and ${sText} with ${secondaryLabel}.`
    }

    // Both are failures: either no meaningful help or got worse.
    // We spell out both remaining/problem needs to avoid vague "did not help".
    if (isFailureResult(primaryResult) && isFailureResult(secondaryResult)) {
      return `it ${clauseFor(pText, primaryLabel)} and ${clauseFor(sText, secondaryLabel)}.`
    }

    // Fallback for unexpected result combinations.
    return `it ${pText} with ${primaryLabel}, and it was not enough for ${secondaryLabel}.`
  }

  const needKey = primaryNeedKey || secondaryNeedKey
  const label = NEED_LABELS[needKey]?.toLowerCase() || needKey
  const text = makeDeltaText(needsBefore?.[needKey], needsAfter?.[needKey])
  if (text === 'did not really help') return `it did not help with ${label}.`
  if (text === 'made it worse') return `it made ${label} worse.`
  return `it ${text} with ${label}.`
}

function buildFeltOutcomeLine(actionId, primaryNeedKey, secondaryNeedKey, primaryResult, secondaryResult, needsBefore, needsAfter) {
  const actionLabel = getActionLabel(actionId) || actionId || 'that'
  const actionText = actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)
  const tail = buildFeltOutcomeTail(
    primaryNeedKey,
    secondaryNeedKey,
    primaryResult,
    secondaryResult,
    needsBefore,
    needsAfter
  )
  const rest = tail.startsWith('it ') ? tail.slice(3) : tail
  return `${actionText} ${rest}`
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

    /**
     * Baseline: needs-derived foundation (0–50). Dynamic: mode-driven buffer, clamped [0, baseline].
     * Final (instant) = baseline + dynamic ∈ [baseline, 2×baseline]; HUD uses smoothed final (0–100).
     */
    baselineAwareness: 0,
    awarenessDynamicBuffer: 0,
    /** Smoothed final awareness for HUD (0–100). */
    awareness: 0,
    /** Lerp target = baselineAwareness + awarenessDynamicBuffer (single needle, coherent with bands). */
    _awarenessFinalSmoothed: null,
    _lastBaselineBreakdown: null,
    _lastLoggedAwarenessMeter: null,
    isEntrapped: false,
    isClear: false,

    _completedDecisionCount: 0,

    // Per-action context captured when the action is chosen.
    _activeActionDecision: null,
    _activeActionReasonText: '',
    _activeHabituationCounterKeys: [],
    _activeHabituationDetails: [],
    _activePostActionEvaluation: null,
    _lastPostActionEvaluation: null,
    _pendingFeltOutcomeLine: null,
    _recentFeltOutcomeLines: [],
    _recentPatternSummaries: [],

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
      if (typeof room.setDirectionalPullHighlights === 'function') {
        const objectTypeIds = [...new Set(ids.map((id) => ACTIONS[id]?.objectTypeId).filter(Boolean).map(String))]
        room.setDirectionalPullHighlights(objectTypeIds)
      }
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

      // Synchronicity availability: baseline 50% + dynamic awareness amount.
      // Dynamic awareness is stored in `awarenessDynamicBuffer` and is in the 0..50 range.
      const dynamicAwarenessLevel = Number(this.awarenessDynamicBuffer) || 0
      const dynamicScale = dynamicAwarenessLevel / BASELINE_AWARENESS_MAX
      const noticeP = buildClamp(0.5 + dynamicScale, 0, 1)

      // Keep the old priming signal for logging/debug context.
      const primed =
        perception > SYNCHRONICITY_NOTICE_PERCEPTION_THRESHOLD ||
        boredom > SYNCHRONICITY_NOTICE_BOREDOM_THRESHOLD ||
        level >= SYNCHRONICITY_NOTICE_LEVEL_MIN
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
      const loopHint = buildLoopHintFromRecentActions(this._recentActionIds)

      this._decisionInFlight = true
      try {
        let actionId = null
        let usedLLM = false
        let availableActionsForDecision = null
        try {
          const allowedActions = this.getAvailableActionIdsForDecision()
          availableActionsForDecision = allowedActions
          actionId = await this.chooseNextActionAsync({
            playerSignal: null,
            playerSignalNote: note,
            availableActions: allowedActions,
            salientActionIds,
            significantMemory: null,
            feltOutcomeLine,
            recentFeltOutcomes: this._recentFeltOutcomeLines.slice(-5),
            loopHint,
            patternSummaries: this._recentPatternSummaries.slice(-2)
          })
          usedLLM = true
        } catch (e) {
          actionId = pickUniformRandomActionId(this.getAvailableActionIdsForDecision())
          availableActionsForDecision = this.getAvailableActionIdsForDecision()
          usedLLM = false
          this.setReasoningFromDecision({
            action: actionId,
            thought: '',
            reason: `Fallback (no LLM): ${getActionLabel(actionId)}`
          })
        }

        if (actionId) {
          this._activeActionDecision = this._lastLLMDecision

          // Apply player-signal awareness bump/penalty at decision time.
          const hasAnySalientActions =
            usedLLM &&
            Array.isArray(salientActionIds) &&
            salientActionIds.some((id) => availableActionsForDecision?.includes(String(id)))
          const decisionForAwareness = this._lastLLMDecision
          const revertAwarenessSnapshot = hasAnySalientActions && decisionForAwareness
            ? {
                baselineAwareness: this.baselineAwareness,
                awarenessDynamicBuffer: this.awarenessDynamicBuffer,
                awareness: this.awareness,
                awarenessFinalSmoothed: this._awarenessFinalSmoothed
              }
            : null
          if (hasAnySalientActions && decisionForAwareness) {
            this._applyPlayerSignalDynamicAwarenessOnDecision(decisionForAwareness)
            this.emitRoomUiImmediate()
          }

          this._recentActionIds.push(actionId)
          if (this._recentActionIds.length > 20) this._recentActionIds = this._recentActionIds.slice(-20)

          const started = this.scene.executeAction(actionId)
          if (!started) {
            if (revertAwarenessSnapshot) {
              this.baselineAwareness = revertAwarenessSnapshot.baselineAwareness
              this.awarenessDynamicBuffer = revertAwarenessSnapshot.awarenessDynamicBuffer
              this.awareness = revertAwarenessSnapshot.awareness
              this._awarenessFinalSmoothed = revertAwarenessSnapshot.awarenessFinalSmoothed
              this.refreshAwarenessStates()
              this.emitRoomUiImmediate()
            }
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
        awarenessBaseline: this.baselineAwareness,
        awarenessDynamicBuffer: this.awarenessDynamicBuffer,
        awarenessModel: 'baseline_plus_mode_dynamic_v1',
        awarenessStates: {
          entrapped: this.isEntrapped,
          clear: this.isClear
        },
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

    refreshAwarenessStates() {
      const a = buildClamp(this.awareness, AWARENESS_METER_MIN, AWARENESS_METER_MAX)
      this.isEntrapped = a <= AWARENESS_ENTRAPMENT_THRESHOLD
      this.isClear = a >= AWARENESS_CLARITY_THRESHOLD
    },

    /**
     * Dynamic awareness layer: `decision_factors.mode` only, scaled by baseline/50.
     * Outcome-agnostic.
     * @returns {object} debug fields for logging
     */
    _applyModeDynamicAwarenessOnActionComplete(decision, needsAfter) {
      const breakdown = computeBaselineAwarenessBreakdown(needsAfter)
      const baselineForScale = breakdown.baselineAwareness
      const prevDynamic = Number(this.awarenessDynamicBuffer)
      const prevSafe = Number.isFinite(prevDynamic) ? prevDynamic : 0

      const baselineScale = baselineForScale / BASELINE_AWARENESS_MAX

      const rawMode = decision?.decision_factors?.mode
      const mode = typeof rawMode === 'string' ? rawMode.trim() : null
      const baseDelta = mode ? getBaseModeAwarenessDelta(mode) : null

      if (baseDelta == null) {
        this.awarenessDynamicBuffer = buildClamp(prevSafe, 0, baselineForScale)
        return {
          modeApplied: false,
          mode: mode || null,
          baseModeDelta: null,
          baselineAwarenessAtApply: baselineForScale,
          baselineScale,
          scaledModeDelta: null,
          prevDynamicAwareness: prevSafe,
          newDynamicAwareness: this.awarenessDynamicBuffer,
          finalAwarenessInstant: baselineForScale + this.awarenessDynamicBuffer,
          skipReason: !mode ? 'missing_mode' : 'mode_not_in_mode_delta_table'
        }
      }

      const scaledDelta = scaleModeDeltaByBaseline(baseDelta, baselineForScale)
      this.awarenessDynamicBuffer = buildClamp(prevSafe + scaledDelta, 0, baselineForScale)

      return {
        modeApplied: true,
        mode,
        baseModeDelta: baseDelta,
        baselineAwarenessAtApply: baselineForScale,
        baselineScale,
        scaledModeDelta: scaledDelta,
        prevDynamicAwareness: prevSafe,
        newDynamicAwareness: this.awarenessDynamicBuffer,
        finalAwarenessInstant: baselineForScale + this.awarenessDynamicBuffer
      }
    },

    /**
     * Player-signal awareness bump is applied at decision time.
     * (Only call this when there were any '*' actions in the prompt.)
     * @returns {object|null} debug fields for logging
     */
    _applyPlayerSignalDynamicAwarenessOnDecision(decision) {
      const rawPlayerSignalUsed = decision?.decision_factors?.player_signal_used
      if (typeof rawPlayerSignalUsed !== 'boolean') return null

      const needsNow = this.needsState.getNeeds()
      const breakdown = computeBaselineAwarenessBreakdown(needsNow)
      const baselineForScale = breakdown.baselineAwareness
      const baselineScale = baselineForScale / BASELINE_AWARENESS_MAX

      const delta =
        (rawPlayerSignalUsed ? PLAYER_SIGNAL_USED_AWARENESS_BONUS : PLAYER_SIGNAL_IGNORED_AWARENESS_PENALTY) *
        baselineScale

      const prevDynamic = Number(this.awarenessDynamicBuffer)
      const prevSafe = Number.isFinite(prevDynamic) ? prevDynamic : 0
      const nextDynamic = buildClamp(prevSafe + delta, 0, baselineForScale)

      this.baselineAwareness = baselineForScale
      this.awarenessDynamicBuffer = nextDynamic

      // Snap the displayed meter to the decision-time bump.
      const targetFinal = buildClamp(this.baselineAwareness + this.awarenessDynamicBuffer, 0, 100)
      this._awarenessFinalSmoothed = targetFinal
      this.awareness = buildClamp(this._awarenessFinalSmoothed, AWARENESS_METER_MIN, AWARENESS_METER_MAX)
      this.refreshAwarenessStates()

      return {
        playerSignalApplied: true,
        playerSignalUsed: rawPlayerSignalUsed,
        playerSignalDelta: delta,
        baselineAwarenessAtApply: baselineForScale,
        baselineScale,
        prevDynamicAwareness: prevSafe,
        newDynamicAwareness: this.awarenessDynamicBuffer,
        finalAwarenessInstant: targetFinal
      }
    },

    /**
     * Recompute needs-derived baseline (0–50), optional exponential smoothing toward target for HUD.
     * @param {number} deltaMs - frame delta; <= 0 snaps smoothed value to target (init / large jumps).
     */
    syncBaselineAwarenessFromNeeds(deltaMs) {
      const needs = this.needsState.getNeeds()
      const breakdown = computeBaselineAwarenessBreakdown(needs)
      this._lastBaselineBreakdown = breakdown
      const target = breakdown.baselineAwareness
      this.baselineAwareness = target

      const dyn = Number(this.awarenessDynamicBuffer)
      this.awarenessDynamicBuffer = buildClamp(Number.isFinite(dyn) ? dyn : 0, 0, target)

      const targetFinal = buildClamp(this.baselineAwareness + this.awarenessDynamicBuffer, 0, 100)

      if (this._awarenessFinalSmoothed == null || !Number.isFinite(this._awarenessFinalSmoothed)) {
        this._awarenessFinalSmoothed = targetFinal
      } else if (deltaMs <= 0) {
        this._awarenessFinalSmoothed = targetFinal
      } else {
        const t = 1 - Math.exp(-deltaMs / BASELINE_AWARENESS_SMOOTH_TAU_MS)
        this._awarenessFinalSmoothed += (targetFinal - this._awarenessFinalSmoothed) * t
      }

      this.awareness = buildClamp(this._awarenessFinalSmoothed, AWARENESS_METER_MIN, AWARENESS_METER_MAX)
      this.refreshAwarenessStates()

      const logStep = Math.round(this.awareness * 10) / 10
      if (DEBUG_AWARENESS_CHANGES && logStep !== this._lastLoggedAwarenessMeter) {
        this._lastLoggedAwarenessMeter = logStep
        console.log('[awareness]', {
          type: 'awareness_recompute',
          model: 'baseline_plus_mode_dynamic_v1',
          baselineAwareness: this.baselineAwareness,
          awarenessDynamicBuffer: this.awarenessDynamicBuffer,
          finalAwarenessSmoothed: this.awareness,
          weightedBurden: breakdown.weightedBurden,
          maxWeightedBurden: breakdown.maxWeightedBurden,
          burdenRatio: breakdown.burdenRatio
        })
      }
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
      if (actionId === 'go_to_sleep') {
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

      const levelAtAction = getCharacterState().consciousnessLevel
      const decision = this._activeActionDecision
      const needsBefore = this._activeActionNeedsSnapshot
      const needsAfter = this.needsState.getNeeds()
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
        const feltOutcomeForPrompt = buildFeltOutcomeTail(
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
        this._pendingFeltOutcomeLine = feltOutcomeForPrompt
        this._recentFeltOutcomeLines.push(feltOutcomeForPrompt)
        if (this._recentFeltOutcomeLines.length > RECENT_FELT_OUTCOMES_MAX) {
          this._recentFeltOutcomeLines = this._recentFeltOutcomeLines.slice(-RECENT_FELT_OUTCOMES_MAX)
        }
      } else {
        this._lastPostActionEvaluation = null
      }

      // Keep recent interpreted memory for higher-consciousness prompt context.
      if (decision && decision.pattern_noticed) {
        this._recentPatternSummaries.push(String(decision.pattern_noticed))
      }
      if (decision && decision.felt_memory) {
        this._recentPatternSummaries.push(String(decision.felt_memory))
      }
      if (this._recentPatternSummaries.length > RECENT_PATTERN_SUMMARIES_MAX) {
        this._recentPatternSummaries = this._recentPatternSummaries.slice(-RECENT_PATTERN_SUMMARIES_MAX)
      }

      const baselineBeforeBreakdown =
        needsBefore ? computeBaselineAwarenessBreakdown(needsBefore) : null
      const baselineAfterBreakdown = computeBaselineAwarenessBreakdown(needsAfter)
      const serializeBaseline = (b) =>
        b
          ? {
              weightedBurden: b.weightedBurden,
              maxWeightedBurden: b.maxWeightedBurden,
              burdenRatio: b.burdenRatio,
              baselineAwareness: b.baselineAwareness,
              weightedTerms: b.weightedTerms
            }
          : null

      const modeAwarenessDebug = this._applyModeDynamicAwarenessOnActionComplete(decision, needsAfter)
      const awarenessTickMs = Math.max(1, this.scene?.time?.delta ?? 16)
      this.syncBaselineAwarenessFromNeeds(awarenessTickMs)

      if (DEBUG_AWARENESS_CHANGES) {
        const realWorldTimestamp = buildRealWorldTimestamp(this._realSessionStartedAtMs)
        const awarenessLogPayload = {
          type: 'action_complete',
          model: 'baseline_plus_mode_dynamic_v1',
          actionId,
          level: levelAtAction,
          llmReasoning: buildLlmReasoningPayload(decision, this._activeActionReasonText),
          gameClock: {
            minutes: this._gameClockMinutes,
            label: formatInGameClock(this._gameClockMinutes)
          },
          realWorldTimestamp,
          needsAtActionStart: needsBefore ? { ...needsBefore } : null,
          needsAtActionEnd: { ...needsAfter },
          baseline: {
            needWeights: baselineAfterBreakdown.needWeights,
            before: serializeBaseline(baselineBeforeBreakdown),
            after: serializeBaseline(baselineAfterBreakdown)
          },
          modeDynamicLayer: {
            ...modeAwarenessDebug,
            note:
              'Baseline from needs only; dynamic buffer from decision_factors.mode only, scaled by baselineAwareness/50'
          },
          baselineAwarenessInstant: this.baselineAwareness,
          awarenessDynamicBuffer: this.awarenessDynamicBuffer,
          finalAwarenessInstant: this.baselineAwareness + this.awarenessDynamicBuffer,
          finalAwarenessSmoothed: this.awareness,
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

      this.emitRoomUiImmediate()

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
      feltOutcomeLine = null,
      recentFeltOutcomes = null,
      loopHint = null,
      patternSummaries = null
    } = {}) {
      this._lastLLMDecision = null
      const consciousnessLevel = getCharacterState().consciousnessLevel
      const recentActionsLimit =
        consciousnessLevel <= 0 ? 3 : (consciousnessLevel === 1 ? 5 : (consciousnessLevel >= 4 ? 10 : 8))

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
          consciousnessLevel,
          needs: this.needsState.getNeeds(),
          traits: this.defaultTraits,
          traitTensions,
          availableActions: actionsList,
          salientActionIds: salient,
          playerSignal,
          playerSignalNote: playerSignalNote ?? null,
          feltOutcomeLine: feltOutcomeLine ?? null,
          recentFeltOutcomes: Array.isArray(recentFeltOutcomes) ? recentFeltOutcomes : [],
          loopHint: loopHint ?? null,
          patternSummaries: Array.isArray(patternSummaries) ? patternSummaries : [],
          recentActions: this._recentActionIds.slice(-recentActionsLimit),
          significantMemory
        })
      })

      if (!res.ok) throw new Error(`decision HTTP ${res.status}`)
      const data = await res.json()
      if (!data || !data.action) throw new Error('missing action in response')

      if (data._llmDebug) {
        const d = data._llmDebug
        const systemMsg = Array.isArray(d.messages) ? d.messages.find((m) => m.role === 'system') : null
        const userMsg = Array.isArray(d.messages) ? d.messages.find((m) => m.role === 'user') : null

        if (LOG_LLM_PROMPT_BROWSER && Array.isArray(d.messages)) {
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
          console.log('[llm-decision] system prompt', systemMsg?.content ?? '')
          console.log('[llm-decision] user message', userMsg?.content ?? '')
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
      const extras = ['unease', 'pattern_noticed', 'felt_memory', 'signal_response', 'guidance', 'what_i_am_testing', 'state']
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

      // Awareness is currently placeholder-only: no passive drains/fills in update().

      // Gradual need resolution during actions.
      this.applyPendingNeedDeltas(deltaMs * TEST_SPEED_MULTIPLIER)

      this.syncBaselineAwarenessFromNeeds(deltaMs * TEST_SPEED_MULTIPLIER)

      this.emitUiStateThrottled()
    }
  }

  engine.syncBaselineAwarenessFromNeeds(0)

  engineSingleton = engine
  return engine
}

