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
  INTERACTION_DURATION,
} from '../data/actions.js'
import {
  findPath,
  getBorderWallTiles,
  getWalkableTilesAdjacentToObject,
  isWalkable,
  pixelToTile,
  tileToPixel
} from '../data/roomGrid.js'
import { EventBus } from '../eventBus.js'
import { getCharacterEngine } from '../systems/character/characterEngine.js'

const FLOOR_COLOR = 0x3d3d3d
const NEEDS_PANEL_HEIGHT = 140
const ENTROPY_STRIP_HEIGHT = 28
// Needs use "per game-time minute" drift.
// Calibration: 30 real minutes ~= 1 in-game day → 1 game minute = 1 real minute.
// So 1 real second = 1/60 game minutes (needs tick slowly).
const GAME_MINUTES_PER_REAL_SECOND = 1 / 60
// Base multiplier is 1. Game speed is controlled at runtime via `this.time.timeScale`.
const TEST_SPEED_MULTIPLIER = 1
const WALL_COLOR = 0x2a2a2a
const OBJECT_COLOR = 0x555555
const OBJECT_STROKE = 0x888888
const LABEL_COLOR = '#cccccc'
const BORDER_COLOR = 0x666666
const BORDER_WIDTH = 2

const ACTION_PROGRESS_BAR_WIDTH = 46
const ACTION_PROGRESS_BAR_HEIGHT = 6
const ACTION_PROGRESS_BAR_OFFSET_Y = -18

export class Room extends Phaser.Scene {
  constructor() {
    super('Room')
  }

  create() {
    this.isExecutingAction = false
    this.isPaused = false
    this.speedMultiplier = 1
    this.time.timeScale = this.speedMultiplier
    this.initVariables()
    this.objectsById = Object.fromEntries(ROOM_OBJECTS.map(o => [o.id, o]))
    this.initInput()
    this.initAnimations()
    this.drawRoomBackground()
    this.drawBorders()
    this.drawObjects()
    this.initPlayer()

    this.characterEngine = getCharacterEngine()
    this.characterEngine.attachScene(this)

    this._pauseHandler = (paused) => {
      this.isPaused = !!paused
      this.time.timeScale = this.isPaused ? 0 : this.speedMultiplier
    }
    EventBus.on('toggle-pause', this._pauseHandler)

    this._speedHandler = (nextSpeed) => {
      const x = Number(nextSpeed)
      if (!Number.isFinite(x) || x <= 0) return
      this.speedMultiplier = x
      if (!this.isPaused) this.time.timeScale = this.speedMultiplier
    }
    EventBus.on('set-speed', this._speedHandler)
    this.events.on('shutdown', () => {
      if (this._pauseHandler) EventBus.off('toggle-pause', this._pauseHandler)
      if (this._speedHandler) EventBus.off('set-speed', this._speedHandler)
    })

    EventBus.emit('current-scene-ready', this)
    this.characterEngine.emitUiStateThrottled()
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
    return -1
  }

  drawRoomBackground() {
    const { width, height } = ROOM_FLOOR
    const cx = this.mapX + width / 2
    const cy = this.mapY + height / 2
    this.add.rectangle(cx, cy, width, height, FLOOR_COLOR).setOrigin(0.5)
    this.add.rectangle(this.mapX, this.mapY, width, height).setOrigin(0, 0).setStrokeStyle(4, WALL_COLOR).setFillStyle(0x000000, 0)
  }

  /** Draw border "fence" tiles as blocked wall cells (single gap remains walkable). */
  drawBorders() {
    const g = this.add.graphics().setDepth(5)
    const ts = TILE_SIZE

    // Visual wall styling (kept distinct so players can read the partitions).
    const wallFill = 0x8b1d1d
    const wallStroke = 0xc05050

    const isInsideAnyObject = (tx, ty) => {
      for (const obj of ROOM_OBJECTS) {
        if (
          tx >= obj.gridX &&
          tx < obj.gridX + obj.gridW &&
          ty >= obj.gridY &&
          ty < obj.gridY + obj.gridH
        ) return true
      }
      return false
    }

    g.fillStyle(wallFill, 0.55)
    g.lineStyle(2, wallStroke, 0.95)

    for (const { tx, ty } of getBorderWallTiles()) {
      if (isInsideAnyObject(tx, ty)) continue
      const x = this.mapX + tx * ts
      const y = this.mapY + ty * ts
      g.fillRect(x, y, ts, ts)
      g.strokeRect(x, y, ts, ts)
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

  update(time, delta) {
    if (this.isPaused) return
    const dtMs = delta * (this.time?.timeScale || 1)
    const gameMinutesDelta = (dtMs / 1000) * GAME_MINUTES_PER_REAL_SECOND * TEST_SPEED_MULTIPLIER
    this.gameTimeMinutes += gameMinutesDelta

    if (this.characterEngine) {
      this.characterEngine.update(dtMs)
    }
    this.updateActionProgressBar()

    if (this.isExecutingAction && this.player) {
      this.updateActionPath()
      this.player.update(dtMs)
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

    if (this.characterEngine && this.characterEngine.onActionStarted) {
      this.characterEngine.onActionStarted(actionId, durationMs)
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
    if (this.characterEngine && this.characterEngine.onActionCompleted) {
      this.characterEngine.onActionCompleted(actionId)
    }

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

 
}
