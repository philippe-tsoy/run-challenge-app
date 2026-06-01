# Run Challenge PWA — Master Spec Package

Cursor-oriented specification for implementation. When this package conflicts with older stub docs, **`docs/spec/` wins**.

## Entry point

Start here: **[MASTER_SPEC.md](./MASTER_SPEC.md)**

## Package index

| Document | Purpose |
|----------|---------|
| [MASTER_SPEC.md](./MASTER_SPEC.md) | Product overview, rules, philosophy |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, data flow, folder structure |
| [DATA_MODEL.md](./DATA_MODEL.md) | Tables, RLS, schema alignment |
| [API_CONTRACTS.md](./API_CONTRACTS.md) | REST API contracts |
| [CURSOR_RULES.md](./CURSOR_RULES.md) | Agent implementation constraints |
| [CONSISTENCY.md](./CONSISTENCY.md) | Audit log: resolved conflicts & open gaps |

## Implementation phases

| Phase | File |
|-------|------|
| 0 | [PHASE_0_SETUP.md](./PHASE_0_SETUP.md) |
| 1 | [PHASE_1_SUPABASE.md](./PHASE_1_SUPABASE.md) — **detailed Supabase runbook** |
| 2 | [PHASE_2_AUTH.md](./PHASE_2_AUTH.md) |
| 3 | [PHASE_3_CHALLENGES.md](./PHASE_3_CHALLENGES.md) |
| 4 | [PHASE_4_RUNS.md](./PHASE_4_RUNS.md) |
| 5 | [PHASE_5_FEED.md](./PHASE_5_FEED.md) |
| 6 | [PHASE_6_SOCIAL.md](./PHASE_6_SOCIAL.md) |
| 7 | [PHASE_7_MILESTONES.md](./PHASE_7_MILESTONES.md) |
| 8 | [PHASE_8_JOURNEY_SYSTEM.md](./PHASE_8_JOURNEY_SYSTEM.md) |
| 9 | [PHASE_9_BADGES.md](./PHASE_9_BADGES.md) |
| 10 | [PHASE_10_STRAVA.md](./PHASE_10_STRAVA.md) |
| 11 | [PHASE_11_PWA.md](./PHASE_11_PWA.md) |
| 12 | [PHASE_12_ADMIN.md](./PHASE_12_ADMIN.md) |
| 13 | [PHASE_13_DEPLOYMENT.md](./PHASE_13_DEPLOYMENT.md) |

## Related source of truth (code)

- `database/schema.sql` — production schema
- `docs/business-rules.md` — detailed rules reference (spec package wins on conflict)
- `lib/constants/journey-nodes.ts` — LOTR journey seed
- `lib/constants/badges.ts` — badge definitions
- `features/feed/types/feed-event.ts` — feed event contract
- `features/challenges/lib/ranking-types.ts` — leaderboard mode ids
- `api/openapi.yaml` — OpenAPI stub (grow to match `API_CONTRACTS.md`)

## MVP vs Phase 2

| MVP | Phase 2 |
|-----|---------|
| Manual runs, offline queue | Strava OAuth + import |
| Journey + milestones + badges | Auto Strava sync |
| Feed, social, leaderboards | — |
| In-app notifications | Push / email (never) |
| PWA install + offline shell | — |
