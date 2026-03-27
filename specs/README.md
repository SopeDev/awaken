# Spec Index

This folder contains the living documentation for Awaken.

## How to read these docs

Each system file is organized in two layers:

1. **Player-Friendly View**: plain-language explanation of what the player experiences
2. **Developer Notes**: exact implementation details and code references

If you only need gameplay intent, read the player-friendly sections.

## Master design doc

- `awaken.md` — overall game vision and high-level design

## System specs

- `AvatarSystem.md` — how the avatar decides what to do
- `NeedsSystem.md` — needs pressure, action effects, and perceived relief
- `AwarenessSystem.md` — how awareness rises and falls
- `PlayerAbilitySystem.md` — what player abilities do and how they influence choices
- `CosmicBlueprintSystem.md` — how natal-chart traits shape behavior

## Translation guide (player wording ↔ dev wording)

- `highlighted option` ↔ `salient action`
- `player influence landed` ↔ `decision_factors.player_signal_used === true`
- `stuck loop` ↔ `decision_factors.unconscious_loop === true`
- `decision request` ↔ `POST /api/decision`

## Source of truth rule

If any spec drifts from implementation, treat `src/systems/**` and `server/**` as source of truth and update the docs.

