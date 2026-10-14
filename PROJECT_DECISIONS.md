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

## Process

- **Code beats specs.** When they disagree, the code is the source of truth and the spec gets
  updated (`specs/README.md`).
- **Specs have two layers:** Player-Friendly View first, then Developer Notes.
- **Git:** locally, the user handles all staging, commits, and pushes. In cloud sessions, agents
  commit and push only to their assigned branch. *(2026-10-14)*
