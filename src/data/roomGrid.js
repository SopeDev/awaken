/**
 * Room grid for cardinal-only movement and obstacle avoidance.
 * Tiles inside ROOM_OBJECTS are not walkable. Borders block movement *between* tiles (on the line), so no tiles are consumed — full interior is walkable.
 */

import { ROOM_OBJECTS, ROOM_BORDERS, TILE_SIZE, ROOM_GRID_COLS, ROOM_GRID_ROWS } from './roomData.js'

const COLS = ROOM_GRID_COLS
const ROWS = ROOM_GRID_ROWS

const CARDINAL_OFFSETS = [
  { dx: 0, dy: -1 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 }
]

function isGap(b, tx, ty) {
  return tx === b.gapGridX && ty === b.gapGridY
}

/**
 * True if moving from (fromTx, fromTy) to (toTx, toTy) crosses a border (and the crossing is not at the gap).
 */
export function borderBlocksMove(fromTx, fromTy, toTx, toTy) {
  const dx = toTx - fromTx
  const dy = toTy - fromTy
  for (const b of ROOM_BORDERS) {
    if (b.type !== 'rect') continue
    const { gridX: gx, gridY: gy, gridW: gw, gridH: gh } = b
    if (dx === 1) {
      const leftEdge = gx === toTx && fromTy >= gy && fromTy < gy + gh && !isGap(b, toTx, fromTy)
      const rightEdge = gx + gw === toTx && fromTy >= gy && fromTy < gy + gh && !isGap(b, fromTx, fromTy)
      if (leftEdge || rightEdge) return true
    }
    if (dx === -1) {
      const leftEdge = gx === fromTx && fromTy >= gy && fromTy < gy + gh && !isGap(b, fromTx, fromTy)
      const rightEdge = gx + gw === fromTx && fromTy >= gy && fromTy < gy + gh && !isGap(b, toTx, fromTy)
      if (leftEdge || rightEdge) return true
    }
    if (dy === 1) {
      const topEdge = gy === toTy && fromTx >= gx && fromTx < gx + gw && !isGap(b, fromTx, toTy)
      const bottomEdge = gy + gh === toTy && fromTx >= gx && fromTx < gx + gw && !isGap(b, fromTx, fromTy)
      if (topEdge || bottomEdge) return true
    }
    if (dy === -1) {
      const topEdge = gy === fromTy && fromTx >= gx && fromTx < gx + gw && !isGap(b, fromTx, fromTy)
      const bottomEdge = gy + gh === fromTy && fromTx >= gx && fromTx < gx + gw && !isGap(b, fromTx, toTy)
      if (topEdge || bottomEdge) return true
    }
  }
  return false
}

/**
 * Tile (tx, ty) is blocked only if inside an object. Borders do not consume tiles.
 */
export function isWalkable(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return false
  for (const obj of ROOM_OBJECTS) {
    if (
      tx >= obj.gridX &&
      tx < obj.gridX + obj.gridW &&
      ty >= obj.gridY &&
      ty < obj.gridY + obj.gridH
    ) {
      return false
    }
  }
  return true
}

/**
 * World position to tile indices (same as Game: tile (0,0) = pixels 0..32).
 */
export function pixelToTile(px, py) {
  return {
    tx: Math.floor(px / TILE_SIZE),
    ty: Math.floor(py / TILE_SIZE)
  }
}

/**
 * Center of tile in pixel coordinates (same as Game mapOffset + tile coords).
 */
export function tileToPixel(tx, ty) {
  return {
    x: tx * TILE_SIZE + TILE_SIZE / 2,
    y: ty * TILE_SIZE + TILE_SIZE / 2
  }
}

/**
 * All walkable tiles that share an edge with the object (candidates for interaction goal).
 */
export function getWalkableTilesAdjacentToObject(obj) {
  const { gridX: gx, gridY: gy, gridW: gw, gridH: gh } = obj
  const out = []
  const pushIfWalkable = (tx, ty) => {
    if (tx >= 0 && tx < COLS && ty >= 0 && ty < ROWS && isWalkable(tx, ty)) out.push({ tx, ty })
  }
  for (let i = 0; i < gw; i++) {
    pushIfWalkable(gx + i, gy - 1)
    pushIfWalkable(gx + i, gy + gh)
  }
  for (let j = 0; j < gh; j++) {
    pushIfWalkable(gx - 1, gy + j)
    pushIfWalkable(gx + gw, gy + j)
  }
  return out
}

/**
 * Nearest walkable tile to a pixel point (for goal snapping).
 */
export function getWalkableTileNear(px, py) {
  const { tx, ty } = pixelToTile(px, py)
  if (isWalkable(tx, ty)) return { tx, ty }
  const maxRadius = Math.max(COLS, ROWS)
  for (let r = 1; r <= maxRadius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue
        const nx = tx + dx
        const ny = ty + dy
        if (isWalkable(nx, ny)) return { tx: nx, ty: ny }
      }
    }
  }
  return null
}

/**
 * BFS path from start tile to goal tile. Cardinal only. Returns array of { tx, ty } including start and goal.
 */
export function findPath(fromTx, fromTy, toTx, toTy) {
  if (!isWalkable(fromTx, fromTy) || !isWalkable(toTx, toTy)) return []
  if (fromTx === toTx && fromTy === toTy) return [{ tx: fromTx, ty: fromTy }]
  const queue = [{ tx: fromTx, ty: fromTy }]
  const visited = new Set()
  visited.add(`${fromTx},${fromTy}`)
  const parent = {}
  parent[`${fromTx},${fromTy}`] = null
  while (queue.length) {
    const { tx, ty } = queue.shift()
    for (const { dx, dy } of CARDINAL_OFFSETS) {
      const nx = tx + dx
      const ny = ty + dy
      const key = `${nx},${ny}`
      if (visited.has(key)) continue
      if (!isWalkable(nx, ny)) continue
      if (borderBlocksMove(tx, ty, nx, ny)) continue
      visited.add(key)
      parent[key] = { tx, ty }
      if (nx === toTx && ny === toTy) {
        const path = []
        let cur = { tx: nx, ty: ny }
        while (cur) {
          path.unshift(cur)
          const p = parent[`${cur.tx},${cur.ty}`]
          cur = p
        }
        return path
      }
      queue.push({ tx: nx, ty: ny })
    }
  }
  return []
}

export { COLS as ROOM_GRID_COLS, ROWS as ROOM_GRID_ROWS }
