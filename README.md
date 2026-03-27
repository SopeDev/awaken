# Awaken

A 2D top-down consciousness RPG where an AI avatar responds to needs, player “signals”, and an entropy pressure system.

## Documentation style

Project docs are written in two layers:
- **Player-Friendly View** first (plain-language gameplay meaning)
- **Developer Notes** second (technical implementation details)

If you are updating docs, keep that structure.

## Documentation (start here)

- Project entry point: [`specs/README.md`](specs/README.md)
- Main design document: [`specs/awaken.md`](specs/awaken.md)

### System specs

- Avatar decision loop: [`specs/AvatarSystem.md`](specs/AvatarSystem.md)
- Needs: [`specs/NeedsSystem.md`](specs/NeedsSystem.md)
- Awareness meter: [`specs/AwarenessSystem.md`](specs/AwarenessSystem.md)
- Player abilities/signals: [`specs/PlayerAbilitySystem.md`](specs/PlayerAbilitySystem.md)
- Cosmic Blueprint: [`specs/CosmicBlueprintSystem.md`](specs/CosmicBlueprintSystem.md)

## Development

### Local dev

```bash
npm install
npm run dev
```

Server endpoints are under `server/` (notably `/api/decision`) and the runtime decision loop lives in `src/systems/character/characterEngine.js`.

