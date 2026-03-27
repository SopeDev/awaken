/**
 * Room grid for cardinal-only movement and obstacle avoidance.
 *
 * Tiles inside ROOM_OBJECTS are not walkable.
 * ROOM_BORDERS are converted into a 1-tile-thick "fence frame" on the grid, so wall
 * blocking is handled via isWalkable() rather than edge-crossing gap logic.
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
 * Convert border-rect definitions into actual blocked grid tiles (fences).
 *
 * Previously, walls were represented as "blocked edges" (movement crossing checks).
 * That required the gap coordinate to be interpreted perfectly, and small off-by-one
 * errors could either block entrances or open accidental passages.
 *
 * Now we treat borders as a 1-tile-thick fence frame on the grid, with a single
 * "hole" at the configured gap coordinate.
 */
function buildBorderWallTiles() {
  const walls = new Set()

  const addWall = (tx, ty) => {
    if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return
    walls.add(`${tx},${ty}`)
  }

  for (const b of ROOM_BORDERS) {
    if (b.type !== 'rect') continue
    const { gridX: gx, gridY: gy, gridW: gw, gridH: gh } = b

    // Vertical edges: x = gx and x = gx + gw
    for (let ty = gy; ty <= gy + gh; ty++) {
      const leftX = gx
      const rightX = gx + gw
      if (!isGap(b, leftX, ty)) addWall(leftX, ty)
      if (!isGap(b, rightX, ty)) addWall(rightX, ty)
    }

    // Horizontal edges: y = gy and y = gy + gh
    for (let tx = gx; tx <= gx + gw; tx++) {
      const topY = gy
      const bottomY = gy + gh
      if (!isGap(b, tx, topY)) addWall(tx, topY)
      if (!isGap(b, tx, bottomY)) addWall(tx, bottomY)
    }
  }

  return walls
}

const BORDER_WALL_TILES = buildBorderWallTiles()

export function getBorderWallTiles() {
  return [...BORDER_WALL_TILES].map((s) => {
    const [tx, ty] = s.split(',').map((n) => Number(n))
    return { tx, ty }
  })
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
      // Crossing the right edge happens at the boundary x coordinate (toTx),
      // so gap checks must use (boundaryX, fromTy) consistently.
      const rightEdge = gx + gw === toTx && fromTy >= gy && fromTy < gy + gh && !isGap(b, toTx, fromTy)
      if (leftEdge || rightEdge) return true
    }
    if (dx === -1) {
      const leftEdge = gx === fromTx && fromTy >= gy && fromTy < gy + gh && !isGap(b, fromTx, fromTy)
      const rightEdge = gx + gw === fromTx && fromTy >= gy && fromTy < gy + gh && !isGap(b, fromTx, fromTy)
      if (leftEdge || rightEdge) return true
    }
    if (dy === 1) {
      const topEdge = gy === toTy && fromTx >= gx && fromTx < gx + gw && !isGap(b, fromTx, toTy)
      const bottomEdge = gy + gh === toTy && fromTx >= gx && fromTx < gx + gw && !isGap(b, fromTx, toTy)
      if (topEdge || bottomEdge) return true
    }
    if (dy === -1) {
      const topEdge = gy === fromTy && fromTx >= gx && fromTx < gx + gw && !isGap(b, fromTx, fromTy)
      const bottomEdge = gy + gh === fromTy && fromTx >= gx && fromTx < gx + gw && !isGap(b, fromTx, fromTy)
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

  // Fences: derived from ROOM_BORDERS frame.
  if (BORDER_WALL_TILES.has(`${tx},${ty}`)) return false

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
 * `preferredSide` may be: top | bottom | left | right.
 */
export function getWalkableTilesAdjacentToObject(obj, preferredSide = null) {
  const { gridX: gx, gridY: gy, gridW: gw, gridH: gh } = obj
  const out = []
  const pushIfWalkable = (tx, ty) => {
    if (tx >= 0 && tx < COLS && ty >= 0 && ty < ROWS && isWalkable(tx, ty)) out.push({ tx, ty })
  }
  const side = typeof preferredSide === 'string' ? preferredSide.trim().toLowerCase() : null

  if (side === 'top') {
    for (let i = 0; i < gw; i++) pushIfWalkable(gx + i, gy - 1)
    return out
  }
  if (side === 'bottom') {
    for (let i = 0; i < gw; i++) pushIfWalkable(gx + i, gy + gh)
    return out
  }
  if (side === 'left') {
    for (let j = 0; j < gh; j++) pushIfWalkable(gx - 1, gy + j)
    return out
  }
  if (side === 'right') {
    for (let j = 0; j < gh; j++) pushIfWalkable(gx + gw, gy + j)
    return out
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
