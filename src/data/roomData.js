/**
 * Room layout — grid size, borders, avatar start, and object placements.
 * Object definitions come from the global object type registry; this file only defines where they go.
 */

import { OBJECT_TYPES } from './objectTypes.js'

export const TILE_SIZE = 32

/** Same as Game scene yard: 11x11 tiles. */
export const ROOM_GRID_COLS = 11
export const ROOM_GRID_ROWS = 11

export const ROOM_FLOOR = {
  x: 0,
  y: 0,
  width: ROOM_GRID_COLS * TILE_SIZE,
  height: ROOM_GRID_ROWS * TILE_SIZE
}

/** Room layout: which object type is placed at which grid cell. Sizes come from objectTypes. */
export const ROOM_PLACEMENTS = [
  { objectTypeId: 'bed', gridX: 0, gridY: 8 },
  { objectTypeId: 'phone', gridX: 0, gridY: 7 },
  { objectTypeId: 'tv', gridX: 0, gridY: 4 },
  { objectTypeId: 'treadmill', gridX: 9, gridY: 5 },
  { objectTypeId: 'computer', gridX: 10, gridY: 8 },
  { objectTypeId: 'books', gridX: 8, gridY: 10 },
  { objectTypeId: 'window', gridX: 5, gridY: 0 },
  { objectTypeId: 'door', gridX: 5, gridY: 10 },
  { objectTypeId: 'refrigerator', gridX: 0, gridY: 1 },
  { objectTypeId: 'couch', gridX: 2, gridY: 4 },
  { objectTypeId: 'water_dispenser', gridX: 0, gridY: 2 },
  { objectTypeId: 'shower', gridX: 9, gridY: 0 },
  { objectTypeId: 'toilet', gridX: 10, gridY: 1 },
  { objectTypeId: 'sink', gridX: 10, gridY: 2 }
]

/** Built from ROOM_PLACEMENTS + object type sizes. Used by Room scene and roomGrid. */
export const ROOM_OBJECTS = ROOM_PLACEMENTS.map((p) => {
  const type = OBJECT_TYPES[p.objectTypeId]
  return {
    id: p.objectTypeId,
    gridX: p.gridX,
    gridY: p.gridY,
    gridW: type ? type.gridW : 1,
    gridH: type ? type.gridH : 1
  }
})

/** Avatar start: center-bottom of room (in front of bed area). */
export const AVATAR_START_TILE = { x: 1, y: 7 }

/**
 * Section borders: block movement except at gap tile (the opening). No door objects.
 * - type: 'rect' — perimeter blocks; gapGridX, gapGridY is the one walkable tile (the opening).
 */
export const ROOM_BORDERS = [
  { type: 'rect', gridX: 8, gridY: 0, gridW: 3, gridH: 3, gapGridX: 8, gapGridY: 2 },
  { type: 'rect', gridX: 0, gridY: 0, gridW: 3, gridH: 3, gapGridX: 3, gapGridY: 2 }
]

/**
 * Pixel bounds of an object for drawing (local to map: origin top-left of room).
 */
export function getObjectPixelBounds(obj) {
  return {
    x: obj.gridX * TILE_SIZE,
    y: obj.gridY * TILE_SIZE,
    width: obj.gridW * TILE_SIZE,
    height: obj.gridH * TILE_SIZE
  }
}

/**
 * Tile coordinates of the interaction point (walkable tile in front of object: below, center).
 */
export function getInteractionTile(obj) {
  return {
    tx: obj.gridX + Math.floor(obj.gridW / 2),
    ty: obj.gridY + obj.gridH
  }
}

/**
 * Pixel position (tile center, local to map) where the avatar stands when interacting.
 */
export function getInteractionPoint(obj) {
  const { tx, ty } = getInteractionTile(obj)
  return {
    x: tx * TILE_SIZE + TILE_SIZE / 2,
    y: ty * TILE_SIZE + TILE_SIZE / 2
  }
}
