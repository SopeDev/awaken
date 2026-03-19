/**
 * The Room scene — grid-based like Game scene. Same TILE_SIZE and movement.
 * Uses the same Player class; objects are grid rects (e.g. bed 2x3, phone 1x1).
 */

import ANIMATION from '../animation.js'
import Player from '../gameObjects/Player.js'
import {
  ROOM_FLOOR,
  ROOM_OBJECTS,
  ROOM_BORDERS,
  AVATAR_START_TILE,
  TILE_SIZE,
  getObjectPixelBounds
} from '../data/roomData.js'
import {
  ACTIONS,
  AVAILABLE_ACTION_IDS,
  INTERACTION_DURATION,
  getActionLabel
} from '../data/actions.js'
import {
  borderBlocksMove,
  findPath,
  getWalkableTilesAdjacentToObject,
  isWalkable,
  pixelToTile,
  tileToPixel
} from '../data/roomGrid.js'
import { createNeedsState, NEED_KEYS, ACTION_EFFECTS } from '../systems/needs/index.js'
import { EventBus } from '../eventBus.js'
import { BALANCED_TRAIT_SHEET } from '../systems/cosmicBlueprint/index.js'
import { NEED_LABELS } from '../systems/needs/ui.js'
import {
  createEntropyState,
  updateEntropyFromNeeds,
  applyEntropyDelta,
  getSignalStrengthMultiplier,
  updateEntrapmentState
} from '../systems/entropy/index.js'

const FLOOR_COLOR = 0x3d3d3d
const NEEDS_PANEL_HEIGHT = 140
const ENTROPY_STRIP_HEIGHT = 28
// Needs use "per game-time minute" drift.
// Calibration: 30 real minutes ~= 1 in-game day → 1 game minute = 1 real minute.
// So 1 real second = 1/60 game minutes (needs tick slowly).
const GAME_MINUTES_PER_REAL_SECOND = 1 / 60
// Testing: set to 30 to run needs, entropy, and actions 30x faster.
const TEST_SPEED_MULTIPLIER = 30
const REASONING_PANEL_PADDING = 10
const REASONING_TITLE = 'Avatar\'s reasoning'

const WALL_COLOR = 0x2a2a2a
const OBJECT_COLOR = 0x555555
const OBJECT_STROKE = 0x888888
const LABEL_COLOR = '#cccccc'
const BORDER_COLOR = 0x666666
const BORDER_WIDTH = 2

const ACTION_PROGRESS_BAR_WIDTH = 46
const ACTION_PROGRESS_BAR_HEIGHT = 6
const ACTION_PROGRESS_BAR_OFFSET_Y = -18

// How long (ms) to spread action need deltas over when not during an action (fallback).
const NEED_CHANGE_DURATION_MS = 2500
const NEED_ARROW_PADDING = 14

export class Room extends Phaser.Scene {
  constructor() {
    super('Room')
  }

  create() {
    this.isExecutingAction = false
    this.initVariables()
    this.objectsById = Object.fromEntries(ROOM_OBJECTS.map(o => [o.id, o]))
    this.initInput()
    this.initAnimations()
    this.drawRoomBackground()
    this.drawBorders()
    this.drawObjects()
    this.initPlayer()
    this.initNeedsSystem()
    this.initEntropySystem()
    this._reasoningText = 'Waiting for next decision…'
    this._lastUiEmit = 0
    this._runLog = []
    this._runStartedAt = new Date().toISOString()
    this._runLog.push({
      type: 'run_start',
      timestamp: Date.now(),
      startedAt: this._runStartedAt,
      needs: { ...this.needsState.getNeeds() },
      entropy: this.entropyState.entropy,
      gameTimeMinutes: this.gameTimeMinutes
    })
    this.startAIActionLoop()
    EventBus.emit('current-scene-ready', this)
    this.emitRoomUIState()
  }

  /** Write run log to a JSON file and trigger download (browser cannot write to disk directly). */
  downloadRunLog() {
    if (!this._runLog || this._runLog.length === 0) return
    const payload = {
      runStartedAt: this._runStartedAt,
      runEndedAt: new Date().toISOString(),
      finalEntropy: this.entropyState?.entropy ?? 100,
      finalGameTimeMinutes: this.gameTimeMinutes,
      decisionCount: this._runLog.filter((e) => e.type === 'decision').length,
      entries: this._runLog
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `awaken-run-${this._runStartedAt.replace(/[:.]/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  initVariables() {
    this.tileSize = 32
    this.halfTileSize = this.tileSize / 2
    this.mapWidth = 11
    this.mapHeight = 11
    this.centreX = this.scale.width * 0.5
    const contentHeight = this.scale.height - NEEDS_PANEL_HEIGHT - ENTROPY_STRIP_HEIGHT
    this.centreY = contentHeight * 0.5
    this.mapX = this.centreX - (this.mapWidth * this.tileSize * 0.5)
    this.mapY = this.centreY - (this.mapHeight * this.tileSize * 0.5)
    this.playerStart = { x: AVATAR_START_TILE.x, y: AVATAR_START_TILE.y }
    this.gameTimeMinutes = 0
  }

  initInput() {
    this.cursors = this.input.keyboard.createCursorKeys()
  }

  initAnimations() {
    const playerAnimations = ANIMATION.player
    for (const key in playerAnimations) {
      const animation = playerAnimations[key]
      if (!this.anims.exists(animation.key)) {
        this.anims.create({
          key: animation.key,
          frames: this.anims.generateFrameNumbers(animation.texture, animation.config),
          frameRate: animation.frameRate,
          repeat: animation.repeat
        })
      }
    }
  }

  getMapOffset() {
    return {
      x: this.mapX + this.halfTileSize,
      y: this.mapY + this.halfTileSize,
      width: this.mapWidth,
      height: this.mapHeight,
      tileSize: this.tileSize
    }
  }

  getTileAt(worldX, worldY) {
    const next = pixelToTile(worldX - this.mapX, worldY - this.mapY)
    if (!isWalkable(next.tx, next.ty)) return 0
    const cur = pixelToTile(this.player.x - this.mapX, this.player.y - this.mapY)
    if (borderBlocksMove(cur.tx, cur.ty, next.tx, next.ty)) return 0
    return -1
  }

  drawRoomBackground() {
    const { width, height } = ROOM_FLOOR
    const cx = this.mapX + width / 2
    const cy = this.mapY + height / 2
    this.add.rectangle(cx, cy, width, height, FLOOR_COLOR).setOrigin(0.5)
    this.add.rectangle(this.mapX, this.mapY, width, height).setOrigin(0, 0).setStrokeStyle(4, WALL_COLOR).setFillStyle(0x000000, 0)
  }

  /** Draw section borders with a one-tile gap (the opening). */
  drawBorders() {
    const g = this.add.graphics().setDepth(5)
    g.lineStyle(BORDER_WIDTH, BORDER_COLOR, 1)
    const ts = TILE_SIZE
    const line = (x1, y1, x2, y2) => g.lineBetween(this.mapX + x1, this.mapY + y1, this.mapX + x2, this.mapY + y2)
    for (const b of ROOM_BORDERS) {
      if (b.type !== 'rect') continue
      const x0 = b.gridX * ts
      const y0 = b.gridY * ts
      const x1 = (b.gridX + b.gridW) * ts
      const y1 = (b.gridY + b.gridH) * ts
      const gx = b.gapGridX * ts
      const gy = b.gapGridY * ts
      if (b.gapGridY === b.gridY) {
        line(x0, y0, gx, y0)
        line(gx + ts, y0, x1, y0)
      } else {
        line(x0, y0, x1, y0)
      }
      if (b.gapGridY === b.gridY + b.gridH - 1) {
        line(x0, y1, gx, y1)
        line(gx + ts, y1, x1, y1)
      } else {
        line(x0, y1, x1, y1)
      }
      if (b.gapGridX === b.gridX) {
        line(x0, y0, x0, gy)
        line(x0, gy + ts, x0, y1)
      } else {
        line(x0, y0, x0, y1)
      }
      if (b.gapGridX === b.gridX + b.gridW - 1) {
        line(x1, y0, x1, gy)
        line(x1, gy + ts, x1, y1)
      } else {
        line(x1, y0, x1, y1)
      }
    }
  }

  drawObjects() {
    this.objects = {}
    for (const obj of ROOM_OBJECTS) {
      const b = getObjectPixelBounds(obj)
      const cx = this.mapX + b.x + b.width / 2
      const cy = this.mapY + b.y + b.height / 2
      const rect = this.add.rectangle(cx, cy, b.width, b.height, OBJECT_COLOR)
        .setStrokeStyle(2, OBJECT_STROKE)
        .setOrigin(0.5)
      const label = this.add.text(cx, cy, obj.id, {
        fontSize: 14,
        color: LABEL_COLOR
      }).setOrigin(0.5).setDepth(10)
      this.objects[obj.id] = { graphic: rect, label }
    }
  }

  initPlayer() {
    this.player = new Player(this, this.playerStart.x, this.playerStart.y)
    this.player.moveSpeed = Math.max(1, this.player.moveSpeed / TEST_SPEED_MULTIPLIER)
    this.player.frameDuration = this.player.moveSpeed / this.player.mapOffset.tileSize
    // Room movement is AI-driven (Room scene sets `player.target`).
    // Lock player input so movement doesn't depend on scene-specific controls.
    this.player.setInputController({ isLocked: () => true })
  }

  initNeedsSystem() {
    this.needsState = createNeedsState()
    this.defaultTraits = { ...BALANCED_TRAIT_SHEET }
    // Pending need deltas from actions; applied gradually (key -> remaining delta).
    this.pendingNeedDeltas = {}
  }

  initEntropySystem() {
    this.entropyState = createEntropyState()
    // Exposed for UI / future decision logic.
    this.entropy = this.entropyState.entropy
    this.isEntrapped = this.entropyState.isEntrapped
    // Placeholder for future AI/LLM influence damping.
    this.signalStrengthMultiplier = getSignalStrengthMultiplier(this.entropyState.entropy)
  }

  setReasoning(actionId, needs, traits) {
    const { feelingPhrase, actionPhrase, details } = this.buildReasoningText(actionId, needs, traits)
    const main = `I feel ${feelingPhrase}. I am going to ${actionPhrase}.`
    const detailStr = details.length ? '\n\n' + details.join('\n') : ''
    this._reasoningText = main + detailStr
  }

  buildReasoningText(actionId, needs, traits) {
    const actionPhrase = getActionLabel(actionId)
    const high = []
    NEED_KEYS.forEach(key => {
      const v = needs[key] != null ? needs[key] : 50
      if (v >= 65) high.push({ key, v, label: NEED_LABELS[key] || key })
    })

    const feelingParts = []
    if (high.length >= 2) {
      feelingParts.push(high.slice(0, 2).map(({ label, v }) => `${label.toLowerCase()} (${Math.round(v)}%)`).join(' and '))
    } else if (high.length === 1) {
      const { label, v } = high[0]
      feelingParts.push(`${label.toLowerCase()} (${Math.round(v)}%)`)
    } else {
      feelingParts.push('like doing something')
    }

    const feelingPhrase = feelingParts.join(', ')

    const details = []
    high.forEach(({ label, v }) => {
      details.push(`• ${label}: ${Math.round(v)}%`)
    })

    const t = (k) => (traits && traits[k] != null ? traits[k] : 50)
    const traitNotes = []
    if (actionId === 'look_out_window' && t('curiosity') >= 55) traitNotes.push(`Curiosity (${t('curiosity')}) drew me to the window.`)
    if (actionId === 'read_book' && t('curiosity') >= 55) traitNotes.push(`Curiosity (${t('curiosity')}) made reading appealing.`)
    if ((actionId === 'check_phone' || actionId === 'watch_tv') && t('impulsiveness') >= 45) traitNotes.push(`Impulsiveness (${t('impulsiveness')}) made me reach for stimulation.`)
    if (actionId === 'meditate' && t('anxiety') >= 50) traitNotes.push(`Anxiety (${t('anxiety')}) made me seek calm.`)
    if (actionId === 'use_treadmill' && t('discipline') >= 45) traitNotes.push(`Discipline (${t('discipline')}) pushed me to move.`)
    if (actionId === 'sit_on_couch' && t('comfort_seeking') >= 45) traitNotes.push(`Comfort-seeking (${t('comfort_seeking')}) led me to the couch.`)
    if ((actionId === 'go_back_to_sleep' || actionId === 'sit_on_bed') && t('comfort_seeking') >= 45) traitNotes.push(`Comfort-seeking (${t('comfort_seeking')}) drew me to rest.`)
    if ((actionId === 'take_shower' || actionId === 'look_out_window') && (needs.stress || 0) >= 50) traitNotes.push(`Stress (${Math.round(needs.stress)}%) made me seek relief.`)
    if (actionId === 'eat_snack' && (needs.hunger || 0) >= 50) traitNotes.push(`Hunger (${Math.round(needs.hunger)}%) drove this choice.`)
    if (actionId === 'drink_water' && (needs.thirst || 0) >= 35) traitNotes.push(`Thirst (${Math.round(needs.thirst)}%) drove this choice.`)
    if ((actionId === 'take_shower' || actionId === 'use_sink') && (needs.hygiene_need || 0) >= 50) traitNotes.push(`Hygiene (${Math.round(needs.hygiene_need)}%) drove this choice.`)
    if (traitNotes.length) details.push(...traitNotes)

    return { feelingPhrase, actionPhrase, details }
  }

  /** Emit UI state to React (throttled). */
  emitRoomUIState() {
    const now = this.time.now
    if (now - this._lastUiEmit < 100) return
    this._lastUiEmit = now
    const needs = this.needsState.getNeeds()
    EventBus.emit('room-ui-state', {
      needs: { ...needs },
      pendingNeedDeltas: { ...this.pendingNeedDeltas },
      entropy: this.entropyState ? this.entropyState.entropy : 0,
      traits: this.defaultTraits ? { ...this.defaultTraits } : {},
      reasoningText: this._reasoningText || 'Waiting for next decision…'
    })
  }

  /** Apply a portion of pending need deltas over the action duration (or fallback). */
  applyPendingNeedDeltas(deltaMs) {
    const needs = this.needsState.getNeeds()
    const pending = this.pendingNeedDeltas
    const durationMs = this.pendingNeedChangeTotalMs || NEED_CHANGE_DURATION_MS
    for (const key of Object.keys(pending)) {
      const remaining = pending[key]
      if (remaining === 0 || !NEED_KEYS.includes(key)) continue
      const toApply = (remaining / durationMs) * deltaMs
      const current = needs[key]
      const target = current + toApply
      const clamped = Math.max(0, Math.min(100, target))
      const actual = clamped - current
      needs[key] = clamped
      pending[key] = remaining - actual
      if (Math.abs(pending[key]) < 0.5) delete pending[key]
    }
  }

  update(time, delta) {
    const gameMinutesDelta = (delta / 1000) * GAME_MINUTES_PER_REAL_SECOND * TEST_SPEED_MULTIPLIER
    this.gameTimeMinutes += gameMinutesDelta
    this.needsState.tick(gameMinutesDelta, this.defaultTraits, null)

    // Passive entropy drift from unmet needs.
    const needs = this.needsState.getNeeds()
    this.entropyState.entropy = updateEntropyFromNeeds(needs, this.entropyState.entropy, gameMinutesDelta)
    this.entropyState = updateEntrapmentState(this.entropyState, delta * TEST_SPEED_MULTIPLIER)
    this.entropy = this.entropyState.entropy
    this.isEntrapped = this.entropyState.isEntrapped
    this.signalStrengthMultiplier = getSignalStrengthMultiplier(this.entropyState.entropy)
    if (this.entropy >= 100 && !this._gameOver) {
      this._gameOver = true
      this._runLog.push({
        type: 'run_end',
        timestamp: Date.now(),
        entropy: this.entropy,
        gameTimeMinutes: this.gameTimeMinutes,
        needs: { ...this.needsState.getNeeds() }
      })
      this.downloadRunLog()
      this.scene.start('GameOver')
    }

    this.applyPendingNeedDeltas(delta * TEST_SPEED_MULTIPLIER)
    this.emitRoomUIState()
    this.updateActionProgressBar()

    if (this.isExecutingAction && this.player) {
      this.updateActionPath()
      this.player.update(delta)
    }
  }

  updateActionProgressBar() {
    if (!this._actionProgressBg || !this.player) return

    // Only show while we're in the interaction timer phase.
    if (this._interactionStartAtMs == null || this._interactionDurationMs == null) {
      this._actionProgressBg.setAlpha(0)
      if (this._actionProgressFill) this._actionProgressFill.setAlpha(0)
      return
    }

    const elapsed = this.time.now - this._interactionStartAtMs
    const ratio = this._interactionDurationMs > 0 ? elapsed / this._interactionDurationMs : 0
    const clamped = Math.max(0, Math.min(1, ratio))

    const barX = this.player.x
    const barY = this.player.y + ACTION_PROGRESS_BAR_OFFSET_Y
    this._actionProgressBg.setPosition(barX, barY)

    if (this._actionProgressFill) {
      this._actionProgressFill.setAlpha(1)
      this._actionProgressFill.setPosition(barX - ACTION_PROGRESS_BAR_WIDTH / 2, barY)
      const innerW = ACTION_PROGRESS_BAR_WIDTH - 2
      const fillW = clamped * innerW
      this._actionProgressFill.width = fillW
    }

    this._actionProgressBg.setAlpha(clamped >= 1 ? 0.0 : 1.0)
  }

  executeAction(actionId) {
    if (this.isExecutingAction) return false
    const config = ACTIONS[actionId]
    if (!config) return false
    const obj = this.objectsById[config.objectTypeId]
    if (!obj) return false

    const from = pixelToTile(this.player.x - this.mapX, this.player.y - this.mapY)
    const candidates = getWalkableTilesAdjacentToObject(obj)
    if (!candidates.length) return false

    let bestGoal = null
    let bestPathLength = Infinity
    for (const tile of candidates) {
      const p = findPath(from.tx, from.ty, tile.tx, tile.ty)
      if (p.length > 0 && p.length < bestPathLength) {
        bestPathLength = p.length
        bestGoal = tile
      }
    }
    if (!bestGoal) return false

    const fullPath = findPath(from.tx, from.ty, bestGoal.tx, bestGoal.ty)
    const path = fullPath.slice(1)
    if (path.length === 0) {
      this.isExecutingAction = true
      this.playInteractionState(actionId)
      return true
    }

    this.isExecutingAction = true
    this._actionPath = path
    this._actionPathIndex = 0
    this._actionPathActionId = actionId
    const first = tileToPixel(path[0].tx, path[0].ty)
    this.player.target.x = this.mapX + first.x
    this.player.target.y = this.mapY + first.y
    return true
  }

  updateActionPath() {
    if (!this._actionPath || this._actionPathIndex >= this._actionPath.length) return
    const p = this.player
    if (p.x !== p.target.x || p.y !== p.target.y) return
    this._actionPathIndex++
    if (this._actionPathIndex >= this._actionPath.length) {
      this._actionPath = null
      this.playInteractionState(this._actionPathActionId)
      return
    }
    const next = tileToPixel(this._actionPath[this._actionPathIndex].tx, this._actionPath[this._actionPathIndex].ty)
    p.target.x = this.mapX + next.x
    p.target.y = this.mapY + next.y
  }

  playInteractionState(actionId) {
    this.player.setTint(0x8ba8e8)
    this.player.setScale(1.08)
    const config = ACTIONS[actionId]
    const durationMs = (config && config.durationMs) || INTERACTION_DURATION
    this._interactionStartAtMs = this.time.now
    this._interactionDurationMs = durationMs
    this._interactionActionId = actionId

    // Start gradual need change during the action (<< / >> indicators).
    const effects = ACTION_EFFECTS[actionId]
    if (effects) {
      this.pendingNeedDeltas = {}
      for (const [key, delta] of Object.entries(effects)) {
        if (NEED_KEYS.includes(key)) this.pendingNeedDeltas[key] = delta
      }
      this.pendingNeedChangeTotalMs = durationMs
    }

    // Lazy-create the progress bar once we actually begin an interaction.
    if (!this._actionProgressBg) {
      const x = this.player.x
      const y = this.player.y + ACTION_PROGRESS_BAR_OFFSET_Y
      this._actionProgressBg = this.add.rectangle(x, y, ACTION_PROGRESS_BAR_WIDTH, ACTION_PROGRESS_BAR_HEIGHT, 0x2a2a2a)
        .setOrigin(0.5, 0.5)
        .setDepth(80)
      this._actionProgressFill = this.add.rectangle(
        x - ACTION_PROGRESS_BAR_WIDTH / 2,
        y,
        0,
        ACTION_PROGRESS_BAR_HEIGHT - 2,
        0x8a8a3a
      )
        .setOrigin(0, 0.5)
        .setDepth(81)
    }

    this._actionProgressBg.setAlpha(1)
    this._actionProgressFill && this._actionProgressFill.setAlpha(1)

    this.time.delayedCall(durationMs / TEST_SPEED_MULTIPLIER, () => this.finishAction(actionId))
  }

  finishAction(actionId) {
    // Need deltas were queued at interaction start and applied gradually during the action.

    // Apply entropy delta from the action metadata.
    const meta = ACTIONS[actionId]
    const deltaEntropy = meta && typeof meta.entropyDelta === 'number' ? meta.entropyDelta : 0
    this.entropyState.entropy = applyEntropyDelta(this.entropyState.entropy, deltaEntropy)
    this.entropy = this.entropyState.entropy

    // Clear interaction progress.
    this._interactionStartAtMs = null
    this._interactionDurationMs = null
    this._interactionActionId = null
    if (this._actionProgressBg) this._actionProgressBg.setAlpha(0)
    if (this._actionProgressFill) this._actionProgressFill.setAlpha(0)

    this.player.clearTint()
    this.player.setScale(1)
    this.isExecutingAction = false
    this.events.emit('actionComplete', { actionId })
  }

  /** Every 5s, if no action is running, pick a new action from personality + needs and run it. */
  startAIActionLoop() {
    const AI_DECISION_INTERVAL_MS = 5000 / TEST_SPEED_MULTIPLIER
    const tryScheduleNext = () => {
      if (this._gameOver) return
      if (this.entropyState.entropy >= 100) {
        this._gameOver = true
        this._runLog.push({
          type: 'run_end',
          timestamp: Date.now(),
          entropy: this.entropyState.entropy,
          gameTimeMinutes: this.gameTimeMinutes,
          needs: { ...this.needsState.getNeeds() }
        })
        this.downloadRunLog()
        this.scene.start('GameOver')
        return
      }
      if (this.isExecutingAction) {
        this.time.delayedCall(AI_DECISION_INTERVAL_MS, tryScheduleNext)
        return
      }
      const actionId = this.chooseNextAction()
      if (actionId) {
        this.setReasoning(actionId, this.needsState.getNeeds(), this.defaultTraits)
        const needs = this.needsState.getNeeds()
        this._runLog.push({
          type: 'decision',
          index: this._runLog.filter((e) => e.type === 'decision').length + 1,
          decision: actionId,
          reason: this._reasoningText,
          needs: { ...needs },
          entropy: this.entropyState.entropy,
          gameTimeMinutes: this.gameTimeMinutes,
          timestamp: Date.now()
        })
        this.executeAction(actionId)
      }
      this.time.delayedCall(AI_DECISION_INTERVAL_MS, tryScheduleNext)
    }
    this.time.delayedCall(AI_DECISION_INTERVAL_MS, tryScheduleNext)
  }

  /**
   * Score actions by current needs and personality traits; return one action id (weighted random).
   */
  chooseNextAction() {
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
        const impulsiveness = t('impulsiveness')
        const comfort = t('comfort_seeking')
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
        if (actionId === 'go_back_to_sleep' || actionId === 'sit_on_bed') score += 0.4
        if (actionId === 'look_out_window' || actionId === 'meditate') score += 0.35
        if (actionId === 'use_treadmill' || actionId === 'take_shower') score += 0.3
        if (actionId === 'read_book') score += 0.32
        if (actionId === 'sit_on_couch') score += 0.2
      }

      if (n('fatigue') > 0.65) {
        if (actionId === 'go_back_to_sleep') score += 0.5
        if (actionId === 'sit_on_bed' || actionId === 'sit_on_couch') score += 0.25
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

      // Entrapment reduces insight-capable options and favors loop actions.
      if (this.entropyState && this.entropyState.isEntrapped) {
        if (meta.insightCapable) {
          score *= 0.01
        } else if (meta.loopReinforcing) {
          score *= 1.6
        } else {
          score *= 0.25
        }
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
  }
}
