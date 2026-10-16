# Project Decisions

Durable decisions only. Detailed mechanics live in `specs/`. Entries marked *(inferred)* were
reconstructed from the code and specs on 2026-10-14, not recorded at the time they were made.

## Stack

- **Phaser 3 + React 18 + Vite, plain JavaScript.** Phaser runs the world; React renders the HUD
  as an overlay. *(inferred)*
- **The LLM is called server-side only**, via `POST /api/decision`. The same handler is served by Vite
  middleware in dev and by a Vercel function (`api/decision.js`) in prod. *(inferred)*
- **OpenAI `gpt-4.1-mini`** makes avatar decisions. *(inferred)*
- **Desktop browser, keyboard input** (WASD / Space / E). *(2026-10-14)*

## Design invariants

- **The LLM never sees raw numbers or system vocabulary.** Needs and traits become prose on the
  server first (`specs/awaken.md` §6.1).
- **The avatar is unaware of the player.** Signals only make options more salient; the avatar always
  chooses.
- **Progression comes from unlocking thought, not keys.** Actions exist physically before they're
  "thinkable"; discoveries and insights unlock them (§20).
- **Stuck-loop detection is behavioral.** It's computed from recent actions and need outcomes rather
  than judged by the LLM. *(inferred)*
- **Awareness and consciousness level are separate values.** Awareness is the moment-to-moment meter;
  consciousness level selects the prompt framing and the stage of the game (§7.1).

## Reboot direction (2026-10-16)

The March build had deep systems, but players couldn't see what their actions did. The next step is a
small fresh prototype focused on one feeling: the avatar realizes something because the player
guided them there. Existing systems (Cosmic Blueprint, needs, entropy) are shelved, not deleted.

- **First goal: get the avatar to go outside.** The prototype is one room, about 10 minutes long, and
  ends with the door opening.
- **Prototype character: burnout.** Hand-authored, flat, running on autopilot. Later, characters come
  from archetype presets or a custom birth chart via the Cosmic Blueprint, and each one is stuck for
  a different reason.
- **Setting:** a cozy, Stardew-style pixel town set in the present day (phones, TV, wifi).
- **The player sees the layer of meaning; the avatar doesn't.** Meaningful objects glow for the player,
  so the goal is always readable.
- **Every signal gets a visible reaction**, including being ignored.
- **"Connection" replaces "awareness"**: it's the bandwidth between the player and the avatar.
- **Color as consciousness:** the room is washed out and the outside is fully saturated.

## Process

- **Code beats specs.** When they disagree, the code is the source of truth and the spec gets
  updated (`specs/README.md`).
- **Specs have two layers:** Player-Friendly View first, then Developer Notes.
- **Git:** locally, the user handles all staging, commits, and pushes. In cloud sessions, agents
  commit and push only to their assigned branch. *(2026-10-14)*
