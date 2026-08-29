# Account Linking Requires Proof of Possession, Not Email Match

`User` is a single product identity that can have multiple `AuthIdentity`
records (`LOCAL_PASSWORD`, `FORTY_TWO` OAuth), keyed by the OAuth
provider's stable identifier (`provider` + `providerSubject` — equivalent
to OpenID Connect's `iss` + `sub`), never by email. We deliberately do
**not** auto-link a new OAuth login to an existing local account just
because the returned email matches. Linking an identity to an existing
`User` requires either being already authenticated as that `User`, or
explicitly logging into the existing account to confirm the link.

## Considered options

- **Auto-link by email match** (rejected): more convenient, but a
  provider's email claim can be absent, unverified, or attacker-influenced
  — auto-linking on it opens an account-takeover path where reaching an
  OAuth provider that reports someone else's email grants access to their
  local account. Email is a mutable, provider-dependent claim, not a
  stable identifier — OIDC itself specifies `iss`+`sub` as the identifier
  a federated account should be built on, not `email`.

## Consequences

- Slightly more friction the first time a user wants to link a second
  auth method (one extra login step to prove ownership of the existing
  account) — accepted as the right trade-off over silent account merging.
- `User.id` is the only identifier `MatchParticipant`, `Friendship`, and
  `User Game Stats` ever reference — never an `AuthIdentity` or a login
  method, so this decision is invisible to the rest of the domain model.
- If a future teammate is tempted to "simplify" login by auto-linking on
  email match, that would reopen this exact account-takeover path — this
  ADR exists so that temptation gets caught in review instead.
