import { ACTIONS, AVAILABLE_ACTION_IDS } from '../../data/actions.js'
import { getObjectPixelBounds } from '../../data/roomData.js'
import { pixelToTile } from '../../data/roomGrid.js'

/**
 * @param {typeof import('../../data/roomData.js').ROOM_OBJECTS[0]} obj
 * @param {number} mapX
 * @param {number} mapY
 */
export function getObjectWorldCenter(obj, mapX, mapY) {
  const b = getObjectPixelBounds(obj)
  return {
    x: mapX + b.x + b.width / 2,
    y: mapY + b.y + b.height / 2
  }
}

/** Screen-up = negative Y. Returns 'north' | 'south' | 'east' | 'west' | null (avatar on top of object). */
export function cardinalTowardObject(avatarX, avatarY, objCx, objCy) {
  const dx = objCx - avatarX
  const dy = objCy - avatarY
  if (dx === 0 && dy === 0) return null
  if (Math.abs(dy) >= Math.abs(dx)) {
    return dy < 0 ? 'north' : 'south'
  }
  return dx < 0 ? 'west' : 'east'
}

const CARDINAL_TO_KEYS = {
  north: 'w',
  south: 's',
  west: 'a',
  east: 'd'
}

const KEY_TO_CARDINAL = { w: 'north', s: 'south', a: 'west', d: 'east' }

export function directionKeyToCardinal(key) {
  const k = String(key || '').toLowerCase()
  return KEY_TO_CARDINAL[k] || null
}

/** Plain compass wording — avoids naming fixtures (window, bed) that could prime the LLM. */
export function cardinalDirectionLabel(cardinal) {
  if (cardinal === 'north') return 'the north'
  if (cardinal === 'south') return 'the south'
  if (cardinal === 'east') return 'the east'
  if (cardinal === 'west') return 'the west'
  return 'that direction'
}

/**
 * Action ids whose target object lies in the given cardinal sector from the avatar.
 * @param {string} cardinal north|south|east|west
 * @param {number} avatarX
 * @param {number} avatarY
 * @param {number} mapX
 * @param {number} mapY
 * @param {Array<{ id: string, gridX: number, gridY: number, gridW: number, gridH: number }>} roomObjects
 */
export function getActionIdsInCardinalSector(cardinal, avatarX, avatarY, mapX, mapY, roomObjects) {
  const set = new Set()
  for (const obj of roomObjects) {
    const c = getObjectWorldCenter(obj, mapX, mapY)
    const dir = cardinalTowardObject(avatarX, avatarY, c.x, c.y)
    if (dir === cardinal) {
      for (const actionId of AVAILABLE_ACTION_IDS) {
        const meta = ACTIONS[actionId]
        if (meta && meta.objectTypeId === obj.id) set.add(actionId)
      }
    }
  }
  return [...set]
}

/**
 * Object types whose footprint touches the 3×3 tile block around the avatar
 * (Chebyshev grid distance ≤ 1 from the avatar’s tile).
 *
 * @param {number} avatarWorldX
 * @param {number} avatarWorldY
 * @param {number} mapX
 * @param {number} mapY
 * @param {Array<{ id: string, gridX: number, gridY: number, gridW: number, gridH: number }>} roomObjects
 * @returns {string[]} object type ids
 */
export function getAdjacentObjectTypeIds(avatarWorldX, avatarWorldY, mapX, mapY, roomObjects) {
  const { tx: atx, ty: aty } = pixelToTile(avatarWorldX - mapX, avatarWorldY - mapY)
  const seen = new Set()
  const out = []
  for (const obj of roomObjects) {
    let touches = false
    for (let ox = obj.gridX; ox < obj.gridX + obj.gridW && !touches; ox++) {
      for (let oy = obj.gridY; oy < obj.gridY + obj.gridH && !touches; oy++) {
        const dCheb = Math.max(Math.abs(ox - atx), Math.abs(oy - aty))
        if (dCheb <= 1) touches = true
      }
    }
    if (touches && !seen.has(obj.id)) {
      seen.add(obj.id)
      out.push(obj.id)
    }
  }
  return out
}

/**
 * @param {string[]} objectTypeIds
 * @returns {string[]} action ids
 */
export function actionIdsForObjectTypes(objectTypeIds) {
  const types = new Set(objectTypeIds)
  return AVAILABLE_ACTION_IDS.filter((id) => {
    const meta = ACTIONS[id]
    return meta && types.has(meta.objectTypeId)
  })
}
