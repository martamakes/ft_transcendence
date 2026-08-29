# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This repository currently contains only the project subject
(`trasncendence-subject.pdf`) — **no code has been written yet**. There is no
package manager, build system, framework choice, or folder structure in
place. Before writing any code, the team's technical choices (frontend
framework, backend framework, database, containerization) must be decided
and documented in `README.md` per the requirements below. Once an initial
project scaffold exists, this file should be updated with real build/lint/
test/run commands and the actual architecture.

## What this project is

`ft_transcendence` is the final 42 Common Core project: a **group project
(4-5 people)** to build a real-world web application from scratch. There is
no fixed subject — the team chooses what to build (e.g. multiplayer Pong,
a social platform, a game with tournaments, etc.) and which optional
**modules** to implement, then documents and justifies those choices.

The full requirements live in `trasncendence-subject.pdf` in this folder —
consult it directly for anything not summarized here, especially exact
wording needed for the README and evaluation.

## Chosen project: Multiplayer Pong Arena

The team is building a **real-time multiplayer Pong platform**, targeting
**19 total points** (14 mandatory + the maximum +5 bonus — bonus is capped
at 5 regardless of how many extra modules are built beyond that, so nothing
past 19 should be attempted). All modules below share the same base game,
so implementation order matters: the base game, remote play, and user
management are prerequisites for almost everything else.

| Category | Module | Type | Pts |
|---|---|---|---|
| Web | Frontend + backend framework | Major | 2 |
| Web | ORM for the database | Minor | 1 |
| Web | Notification system (create/update/delete actions) | Minor | 1 |
| User Management | Standard user mgmt (profile, avatar, friends, online status) | Major | 2 |
| User Management | Remote auth via OAuth2 (42 login) | Minor | 1 |
| User Management | Game stats & match history | Minor | 1 |
| Gaming & UX | Web-based game — real-time Pong | Major | 2 |
| Gaming & UX | Remote players (2 separate machines) | Major | 2 |
| Gaming & UX | Multiplayer 3+ (4-paddle arena variant) | Major | 2 |
| Gaming & UX | Tournament system | Minor | 1 |
| Gaming & UX | Game customization (power-ups, maps) | Minor | 1 |
| Gaming & UX | Spectator mode | Minor | 1 |
| Artificial Intelligence | AI Opponent | Major | 2 |
| **Total** | | | **19 = 14 mandatory + 5 bonus (max)** |

**Dependency chain satisfied**: Multiplayer 3+, Tournament, Game
customization, Spectator mode, AI Opponent, and Game Stats all require a
working game first — the base Pong game covers that for all of them. Not
claiming SSR or ICP, so there's no conflict there.

**Design note — Multiplayer 3+**: classic Pong is 2-paddle, so "3+ players"
is implemented as a 4-player arena variant: a square court where each
player defends one side instead of a left/right paddle, rather than
building a second unrelated game.

**Scope note — AI Opponent**: limited to `DUEL_1V1` for v1. Do not claim
`ARENA_4P` compatibility in the README unless it's actually implemented and
tested — the subject only requires the AI to "play your game competently,"
not to cover every mode.

Domain vocabulary, the Match model, and architecture decisions (server-
authoritative simulation, reconnection/forfeit policy, AI integration) are
tracked in [`CONTEXT.md`](./CONTEXT.md) and [`docs/adr/`](./docs/adr/) —
consult those before naming new entities or making netcode decisions.

**Suggested build order** (base game + remote play + user management are
blocking prerequisites for the rest; once the game core and auth are
stable, tournament/customization/spectator/AI/stats can be built in
parallel since they touch mostly separate code paths):

1. Framework scaffold (frontend + backend) + DB schema + ORM
2. Auth (email/password + OAuth2) + user management (profile, avatar,
   friends, online status)
3. Core Pong game loop + WebSocket real-time sync
4. Remote players (two separate machines, reconnection handling)
5. In parallel: 4-player arena mode, tournament system, game
   customization, spectator mode, AI opponent, match history/stats,
   notification system

**Suggested stack** (satisfies the Web "framework for both frontend and
backend" major module):

- Frontend: React (or Vue) + Tailwind CSS
- Backend: Fastify or NestJS (Node) — pairs well with WebSockets for
  real-time gameplay, remote play, and spectator mode
- Database: PostgreSQL + Prisma or TypeORM (covers the Minor ORM module)
- Auth: email/password (hashed + salted) + OAuth2 via the 42 API
- Containerized with Docker Compose, single `docker compose up`

## Mandatory constraints (apply regardless of what gets built)

These are hard requirements — missing any of them causes project rejection:

- **Full stack web app**: frontend + backend + database, all required.
- **Containerized deployment**: Docker/Podman (or equivalent), must start
  with a **single command**.
- **Git workflow**: commits from all team members, clear messages, visible
  work distribution.
- **Browser support**: must work on the latest stable Google Chrome with
  **zero JS console warnings/errors**.
- **Privacy Policy & Terms of Service pages**: must be real (not
  placeholder), accessible from the app (e.g. footer links).
- **Multi-user support**: concurrent logged-in users, concurrent actions
  handled correctly, real-time updates propagate to connected clients, no
  race conditions/data corruption.
- **Secrets**: stored in a local `.env` (gitignored), with an `.env.example`
  committed.
- **Database**: clear schema with well-defined relations.
- **Auth**: at minimum email + password with hashed/salted passwords;
  stronger auth (OAuth, 2FA) is opt-in via modules.
- **Validation**: all forms/inputs validated on both frontend and backend.
- **HTTPS** required for any connection reaching the backend from outside
  the container network (browser, external API, scripts). Intra-backend
  connections (app ↔ DB, etc.) don't need encryption.
- **CSS**: must use a real framework/styling solution (Tailwind, Bootstrap,
  Material-UI, Styled Components, etc.) — not ad hoc raw CSS only.
- A "**framework**" for module-scoring purposes means a full
  structured/opinionated stack (React, Vue, Angular, Svelte, Next.js,
  Express, NestJS, Django, Flask, Rails, ...) — utility libraries (jQuery,
  Lodash, Axios) don't count.

## Module / scoring system

The project needs **14 points** total to pass. Categories: Web,
Accessibility & Internationalization, User Management, Artificial
Intelligence, Cybersecurity, Gaming and user experience, Devops, Data and
Analytics, Blockchain, Modules of choice. Major module = 2 points, minor
module = 1 point; mix from any category. Full module list with exact
requirements is in the PDF (Chapter IV).

**Important module dependencies** — plan implementation order around these:

- A functional first **game** must exist before: AI Opponent, Tournament
  system, Game customization, Spectator mode, Multiplayer 3+, "Add another
  game", Game Statistics.
- Basic **chat** (from the "User interaction" web module) must exist before
  Advanced chat features.
- **SSR is incompatible with the ICP blockchain backend module** — don't
  pick both.
- During evaluation, only fully functional claimed modules count; a
  non-functional or incomplete claimed module scores **0**, not partial
  credit — don't over-claim.
- Bonus points (max +5) are only counted if the mandatory 14 points are
  already met, and require modules beyond the 14 to also be fully
  functional, spec-compliant, and justified in the README.

## Team roles (required, must be documented in README)

Every team must assign, and be able to explain during evaluation: **Product
Owner**, **Project Manager/Scrum Master**, **Technical Lead/Architect**, and
**Developers** (all members). With 4 people, roles combine; with 5, they can
be more specialized. All members must be able to explain the whole project
and their individual contribution, not just their own piece.

## README.md requirements

`README.md` is itself graded and must exist at repo root. Required content
(see PDF Chapter VI for exact wording, especially the mandated first line):

- First line, italicized, exact format: `This project has been created as
  part of the 42 curriculum by <login1>, <login2>, <login3>[...]`.
- **Description** (project goal, overview, name, key features)
- **Instructions** (prerequisites, versions, `.env` setup, step-by-step run
  instructions)
- **Resources** (references used + how/where AI was used, task by task)
- **Team Information** (role + responsibilities per member)
- **Project Management** (how work was organized, tools, communication
  channels)
- **Technical Stack** (frontend/backend/db choices + justification)
- **Database Schema** (structure, tables/relations, key fields)
- **Features List** (per feature: what it does, who built it)
- **Modules** (full list of claimed modules, point calculation, per-module
  justification and who implemented it — justification is mandatory and
  scrutinized for "Modules of choice")
- **Individual Contributions** (detailed per-member breakdown, challenges
  faced)
- Written in English.

## AI usage policy for this project

Per the subject's own "AI Instructions" chapter: AI may be used to reduce
repetitive/tedious work, but every team member must be able to fully
explain and justify any AI-assisted code during peer evaluation — code that
was pasted in without being understood is treated as project failure, not
just a deduction. When acting as Claude Code on this repo, prefer leaving
the team able to explain the "why," and avoid generating large unexplained
blocks that a student couldn't defend in an oral evaluation.

## Evaluation notes

- Evaluators can request a small live modification to verify real
  understanding (a function tweak, a display change, a data structure
  adjustment) — expected to be feasible within minutes in the team's normal
  dev setup.
- Only claimed modules that are demonstrably fully functional at evaluation
  time count toward the score.
