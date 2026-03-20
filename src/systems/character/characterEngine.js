import { EventBus } from '../../eventBus.js'
import { createNeedsState, NEED_KEYS, ACTION_EFFECTS, INITIAL_NEEDS } from '../needs/index.js'
import { createEntropyState, updateEntropyFromNeeds } from '../entropy/index.js'
import { exampleChart1, generateTraitSheet, generateTraitSheetDetailed } from '../cosmicBlueprint/index.js'
import { NEED_LABELS } from '../needs/ui.js'
import { ACTIONS, AVAILABLE_ACTION_IDS, INTERACTION_DURATION, getActionLabel } from '../../data/actions.js'
import { getCharacterState, setConsciousnessLevel } from './characterState.js'

const GAME_MINUTES_PER_REAL_SECOND = 1 / 60
// Base multiplier is 1. Game speed is controlled at runtime via Phaser `timeScale`.
const TEST_SPEED_MULTIPLIER = 1

const LOG_LLM_DECISION_DEBUG = false
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
  novel_action: 2,
  broke_loop: 3
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

const NOVEL_ACTION_RECENT_WINDOW = 10
const NEED_RESOLUTION_MIN_NEED = 75
const NEED_RESOLUTION_COOLDOWN_DECISIONS = 5
const PSYCHOLOGICAL_NEED_KEYS = ['boredom', 'stress', 'connection_need']
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

const buildClamp = (v, min, max) => Math.max(min, Math.min(max, v))
const getHabituationCounterKey = (actionId, needKey) => `${actionId}:${needKey}`

function isAvoidanceReasonText(reasonText) {
  const t = String(reasonText || '').toLowerCase()
  if (!t) return false
  return AVOIDANCE_KEYWORDS.some((kw) => t.includes(String(kw).toLowerCase()))
}

function buildInGameTimestamp(scene) {
  const totalGameMinutes = Number(scene?.gameTimeMinutes ?? 0)
  if (!Number.isFinite(totalGameMinutes) || totalGameMinutes < 0) {
    return {
      gameMinutesTotal: 0,
      day: 1,
      hour24: 0,
      minute: 0,
      clock24: '00:00',
      label: 'Day 1 00:00'
    }
  }

  const totalWholeMinutes = Math.floor(totalGameMinutes)
  const minutesPerDay = 24 * 60
  const day = Math.floor(totalWholeMinutes / minutesPerDay) + 1
  const minuteOfDay = totalWholeMinutes % minutesPerDay
  const hour24 = Math.floor(minuteOfDay / 60)
  const minute = minuteOfDay % 60
  const hh = String(hour24).padStart(2, '0')
  const mm = String(minute).padStart(2, '0')
  return {
    gameMinutesTotal: totalGameMinutes,
    day,
    hour24,
    minute,
    clock24: `${hh}:${mm}`,
    label: `Day ${day} ${hh}:${mm}`
  }
}

function getPsychologicalFillMultiplier(needs, consciousnessLevel) {
  const boredom = Number(needs?.boredom ?? 0)
  const stress = Number(needs?.stress ?? 0)
  const connectionNeed = Number(needs?.connection_need ?? 0)

  let multiplier = 1
  if (boredom > 80 && stress > 80) multiplier = 0
  else if (boredom > 80 || stress > 80) multiplier = 0.3
  else if (boredom > 65 || stress > 65) multiplier = 0.6

  if (consciousnessLevel >= 2) {
    if (connectionNeed > 90) multiplier *= 0.75
    else if (connectionNeed > 75) multiplier *= 0.85
    else if (connectionNeed > 60) multiplier *= 0.95
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
    _pendingActionNovelty: false,
    _activeActionDecision: null,
    _activeActionReasonText: '',
    _activeHabituationCounterKeys: [],
    _activeHabituationDetails: [],

    // Snapshot at action start.
    _activeActionNeedsSnapshot: null,
    habituationCounters: {},

    // Latest reasoning text for UI.
    _reasoningText: 'Waiting for next decision…',
    _lastLLMDecision: null,

    // Recent actions for LLM context and novelty detection.
    _recentActionIds: [],
    _suppressAIUntilMs: 0,

    attachScene(scene) {
      this.scene = scene
      this._aiLoopToken += 1
      this._startAIActionLoop(this._aiLoopToken)
    },

    detachScene() {
      this.scene = null
      this._aiLoopToken += 1
    },

    emitUiStateThrottled() {
      if (!this.scene) return
      const now = this.scene.time.now
      if (now - this._lastUiEmit < 100) return
      this._lastUiEmit = now

      const needs = this.needsState.getNeeds()
      EventBus.emit('room-ui-state', {
        needs: { ...needs },
        pendingNeedDeltas: { ...this.pendingNeedDeltas },
        awareness: this.awareness,
        traits: this.defaultTraits ? { ...this.defaultTraits } : {},
        reasoningText: this._reasoningText || 'Waiting for next decision…'
      })
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

      // Repetition penalty.
      if (actionId === this._lastCompletedActionId) {
        this._repeatStreakLen += 1
        const streakLen = this._repeatStreakLen
        if (streakLen >= 2) {
          const capped = Math.min(streakLen, 5)
          const penaltyBase = REPETITION_DRAIN_POINTS_BY_STREAK_LEN[capped] || 15
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

      // Novel action fill (passive).
      if (this._pendingActionNovelty) {
        const fill = FILL_BASES.novel_action * meterFillMultiplier
        addPositiveFill('novel_action', fill)
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
        const inGameTimestamp = buildInGameTimestamp(this.scene)
        const awarenessLogPayload = {
          type: 'action_complete',
          actionId,
          level: levelAtAction,
          inGameTimestamp,
          needsAtActionStart: needsBefore ? { ...needsBefore } : null,
          awarenessBefore,
          awarenessAfterApply: awarenessAfter,
          awarenessAfterFinal: awarenessFinal,
          deltaApplied: awarenessAfter - awarenessBefore,
          deltaFinalApplied: awarenessFinal - awarenessBefore,
          hasAwarenessChange: awarenessAfter !== awarenessBefore,
          psychologicalFillMultiplier,
          breakdown: awarenessBreakdown,
          habituation: {
            details: this._activeHabituationDetails,
            counterUpdates: habituationCounterUpdates,
            sleepRecovery: sleepHabituationRecovery
          }
        }
        console.log('[awareness]', awarenessLogPayload)
        if (DEBUG_AWARENESS_CHANGES_JSON) {
          console.log('[awareness-json]', JSON.stringify(awarenessLogPayload))
        }
      }

      // Clear per-action context.
      this._pendingActionNovelty = false
      this._activeActionNeedsSnapshot = null
      this._activeActionReasonText = ''
      this._activeActionDecision = null
      this._activeHabituationCounterKeys = []
      this._activeHabituationDetails = []
    },

    async chooseNextActionAsync({ playerSignal = null, significantMemory = null } = {}) {
      this._lastLLMDecision = null

      let traitTensions = null
      if (Array.isArray(this.cosmicChartPlacements) && this.cosmicChartPlacements.length > 0) {
        const detail = generateTraitSheetDetailed(this.cosmicChartPlacements)
        traitTensions = detail.tensions
      }

      const res = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consciousnessLevel: getCharacterState().consciousnessLevel,
          needs: this.needsState.getNeeds(),
          traits: this.defaultTraits,
          traitTensions,
          availableActions: [...AVAILABLE_ACTION_IDS],
          playerSignal,
          recentActions: this._recentActionIds.slice(-3),
          significantMemory
        })
      })

      if (!res.ok) throw new Error(`decision HTTP ${res.status}`)
      const data = await res.json()
      if (!data || !data.action) throw new Error('missing action in response')

      if (LOG_LLM_DECISION_DEBUG && data._llmDebug) {
        const d = data._llmDebug
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
        delete data._llmDebug
      }

      this._lastLLMDecision = data
      this.setReasoningFromDecision(data)
      return data.action
    },

    setReasoningFromDecision(decision) {
      if (!decision) return
      const thought = decision.thought || ''
      const reason = decision.reason || ''
      const lines = [thought, reason].filter(Boolean)
      const extras = ['unease', 'pattern_noticed', 'signal_response', 'guidance', 'state']
        .map((k) => (decision[k] ? `${k}: ${decision[k]}` : null))
        .filter(Boolean)
      this._reasoningText = [...lines, ...extras].join('\n\n') || '…'
    },

    chooseNextActionWeightedRandom() {
      const needs = this.needsState.getNeeds()
      const traits = this.defaultTraits
      const scores = {}

      const t = (key) => (traits && traits[key] != null ? traits[key] : 50) / 100
      const n = (key) => (needs[key] != null ? needs[key] : 50) / 100

      for (const actionId of AVAILABLE_ACTION_IDS) {
        let score = 0.1
        const meta = ACTIONS[actionId] || {}

        if (n('boredom') > 0.5) {
          const curiosity = t('curiosity')
          const resilience = t('resilience')
          const discipline = t('discipline')
          const courage = t('courage')
          const desire = t('desire')
          const impulsiveness = (1 - resilience) * 0.5 + (1 - discipline) * 0.5
          const comfort = (1 - courage) * 0.6 + desire * 0.4
          const perception = t('perception')
          if (actionId === 'check_phone') score += comfort * 0.5 + impulsiveness * 0.3
          if (actionId === 'watch_tv') score += comfort * 0.4
          if (actionId === 'look_out_window') score += curiosity * 0.4 + perception * 0.2
          if (actionId === 'read_book') score += curiosity * 0.45 + (1 - impulsiveness) * 0.15
          if (actionId === 'open_computer') score += impulsiveness * 0.3
          if (actionId === 'sit_on_couch') score += comfort * 0.2
          if (actionId === 'use_treadmill') score += (1 - comfort) * 0.2
        }

        if (n('stress') > 0.5) {
          if (actionId === 'go_back_to_sleep') score += 0.4
          if (actionId === 'look_out_window') score += 0.35
          if (actionId === 'use_treadmill' || actionId === 'take_shower') score += 0.3
          if (actionId === 'read_book') score += 0.32
          if (actionId === 'sit_on_couch') score += 0.2
        }

        if (n('fatigue') > 0.65) {
          if (actionId === 'go_back_to_sleep') score += 0.5
          if (actionId === 'sit_on_couch') score += 0.25
        }

        if (n('fatigue') < 0.3 && actionId === 'use_treadmill') score += 0.3

        if (n('hunger') > 0.55 && actionId === 'eat_snack') score += 0.6
        if (n('thirst') > 0.4 && actionId === 'drink_water') score += 0.5

        if (n('hygiene_need') > 0.5) {
          if (actionId === 'take_shower') score += 0.55
          if (actionId === 'use_sink') score += 0.25
        }

        if (n('stress') > 0.4 && (actionId === 'use_toilet' || actionId === 'use_sink')) score += 0.15

        if (t('curiosity') >= 0.55 && actionId === 'read_book') score += 0.18

        // Critical state biases options.
        if (this.isCriticalState) {
          if (meta.insightCapable) score *= 0.01
          else if (meta.loopReinforcing) score *= 1.6
          else score *= 0.25
        }

        scores[actionId] = Math.max(0.01, score)
      }

      const total = Object.values(scores).reduce((a, b) => a + b, 0)
      let r = Math.random() * total
      for (const actionId of AVAILABLE_ACTION_IDS) {
        r -= scores[actionId]
        if (r <= 0) return actionId
      }
      return AVAILABLE_ACTION_IDS[AVAILABLE_ACTION_IDS.length - 1]
    },

    _startAIActionLoop(token, { playerSignal = null, significantMemory = null } = {}) {
      if (!this.scene) return

      const AI_DECISION_INTERVAL_MS = 5000 / TEST_SPEED_MULTIPLIER
      const tryScheduleNext = async () => {
        if (!this.scene) return
        if (token !== this._aiLoopToken) return
        if (this._suppressAIUntilMs && this.scene.time.now < this._suppressAIUntilMs) {
          this.scene.time.delayedCall(AI_DECISION_INTERVAL_MS, tryScheduleNext)
          return
        }

        if (this.scene.isExecutingAction) {
          this.scene.time.delayedCall(AI_DECISION_INTERVAL_MS, tryScheduleNext)
          return
        }

        let actionId = null
        try {
          actionId = await this.chooseNextActionAsync({ playerSignal, significantMemory })
        } catch (e) {
          actionId = this.chooseNextActionWeightedRandom()
          this.setReasoningFromDecision({ action: actionId, thought: '', reason: `Fallback: choosing ${getActionLabel(actionId)}` })
        }

        if (actionId) {
          const prevWindow = this._recentActionIds.slice(-NOVEL_ACTION_RECENT_WINDOW)
          const isNovel = !prevWindow.includes(actionId)
          this._pendingActionNovelty = isNovel

          this._activeActionDecision = this._lastLLMDecision
          this._activeActionReasonText = this._reasoningText

          this._recentActionIds.push(actionId)
          if (this._recentActionIds.length > 10) this._recentActionIds = this._recentActionIds.slice(-10)

          const started = this.scene.executeAction(actionId)
          if (!started) {
            this._activeActionDecision = null
            this._activeActionReasonText = ''
            this._pendingActionNovelty = false
          }
        }

        this.scene.time.delayedCall(AI_DECISION_INTERVAL_MS, tryScheduleNext)
      }

      this.scene.time.delayedCall(AI_DECISION_INTERVAL_MS, tryScheduleNext)
    },

    // Called from Room.update().
    update(deltaMs) {
      if (!this.scene) return

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

