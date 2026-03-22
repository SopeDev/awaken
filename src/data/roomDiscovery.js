/**
 * Tutorial room discovery chains: synchronicity unlocks + one-time LLM thought injection.
 * Extend with new `chains` entries and step arrays for future rooms.
 */

/** @typedef {{ id: string, objectTypeId: string, requiresActionId: string, discoveryThought: string, unlockActionIds: string[] }} RoomDiscoveryStep */

/** @typedef {{ id: string, initiallyLockedActionIds: string[], steps: RoomDiscoveryStep[] }} RoomDiscoveryChain */

/** @type {Record<string, RoomDiscoveryChain>} */
export const ROOM_DISCOVERY_CHAINS = {
  tutorial: {
    id: 'tutorial',
    initiallyLockedActionIds: ['look_out_window', 'go_outside'],
    steps: [
      {
        id: 'books_bird_passage',
        objectTypeId: 'books',
        requiresActionId: 'read_book',
        discoveryThought:
          'A passage about birds lands differently. I glance toward the window.',
        unlockActionIds: ['look_out_window']
      },
      {
        id: 'window_bird_sill',
        objectTypeId: 'window',
        requiresActionId: 'look_out_window',
        discoveryThought:
          'A bird lands on the sill. Something about it feels important.',
        unlockActionIds: ['go_outside']
      }
    ]
  }
}

const DEFAULT_CHAIN_ID = 'tutorial'

/**
 * @param {string} [chainId]
 * @returns {RoomDiscoveryChain|null}
 */
export function getRoomDiscoveryChain(chainId = DEFAULT_CHAIN_ID) {
  return ROOM_DISCOVERY_CHAINS[chainId] || null
}

/**
 * @param {Set<string>} consumedStepIds
 * @param {string} objectTypeId
 * @param {string} actionId
 * @param {string} [chainId]
 * @returns {RoomDiscoveryStep|null}
 */
export function findMatchingDiscoveryStep(consumedStepIds, objectTypeId, actionId, chainId = DEFAULT_CHAIN_ID) {
  const chain = getRoomDiscoveryChain(chainId)
  if (!chain) return null
  for (const step of chain.steps) {
    if (consumedStepIds.has(step.id)) continue
    if (step.objectTypeId === objectTypeId && step.requiresActionId === actionId) return step
  }
  return null
}

/**
 * @param {Set<string>} lockedActionIds — mutated in place
 * @param {string[]} unlockActionIds
 */
export function applyDiscoveryUnlocks(lockedActionIds, unlockActionIds) {
  for (const id of unlockActionIds) {
    lockedActionIds.delete(id)
  }
}
