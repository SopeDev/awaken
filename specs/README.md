# Spec Index

This folder contains the game’s living documentation. `specs/README.md` is the canonical entry point.

## Master design doc

- `awaken.md` — overall design bible (with links into the system specs below)

## System specs

- `AvatarSystem.md` — AI avatar decision loop and `/api/decision` prompt contract
- `NeedsSystem.md` — needs model, tick rules, action effects, habituation, and prompt conversion
- `AwarenessSystem.md` — baseline + dynamic awareness computation and UI thresholds
- `PlayerAbilitySystem.md` — directional pull, intuition pulse, synchronicity, cooldowns, and `*` salience contract
- `CosmicBlueprintSystem.md` — trait origin and how placements feed traits (feeds LLM context)

## Notes

If a spec ever feels out of date, treat the corresponding `src/systems/**` code as the source of truth and update the spec to match the current implementation.

