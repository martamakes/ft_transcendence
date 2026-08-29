# Server-Authoritative Match Simulation

Pong Arena needs real-time multiplayer (`DUEL_1V1` and `ARENA_4P`) with
graceful reconnection and forfeit handling. We chose a fully
**server-authoritative simulation**: the server owns all physics, scoring,
elimination, and match-closing decisions; clients only send paddle-direction
*intent* and render server snapshots via visual interpolation — no local
prediction or client-side reconciliation. This keeps the netcode simple
enough for a 4-5 person team to build and defend during oral evaluation,
removes an entire class of cheating (a client can never assert state — no
`SET_PADDLE_POSITION`, `PLAYER_ELIMINATED`, or `MATCH_FINISHED` messages
exist), and lets the reconnection policy (freeze the paddle, keep
simulating, forfeit on timeout) work without reconciling two divergent
sources of truth.

## Considered options

- **Client-authoritative with server reconciliation** (each client simulates
  locally for zero perceived input latency, server corrects divergence):
  rejected — significantly more complex to implement and explain in
  evaluation, and a much larger cheating surface, for no real benefit at
  this project's scale.
- **Peer-to-peer / lockstep between browsers**: rejected — no natural single
  source of truth for `MatchResult`, tournament progression, or spectators.

## Consequences

- Perceived input latency is not hidden by prediction — on high-RTT
  connections, paddle response feels less immediate. Accepted as reasonable
  for this project's scale.
- Explicitly out of scope for v1: client-side prediction, reconciliation,
  rollback netcode, deterministic lockstep, P2P physics, frame-by-frame
  replay, sophisticated lag compensation. A non-authoritative *visual*
  prediction for the local paddle may be added later as a deliberate,
  documented evolution if latency proves unacceptable — the server would
  still have final say.
- Spectators consume the same read-only snapshot stream as players; no
  separate simulation path is needed for spectator mode.
- `MatchResult` is always derived from server-side authoritative events —
  never from a client report.
