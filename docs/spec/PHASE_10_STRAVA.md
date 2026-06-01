# PHASE 10 — Strava (Phase 2 — Deferred)

**Depends on:** [PHASE_4_RUNS.md](./PHASE_4_RUNS.md)

## Goal

OAuth connection and run import with duplicate detection. **Not required for MVP launch.**

## Scope

- Strava OAuth connect / callback
- Import running activities only (no walks/hikes)
- Manual sync button + optional background sync
- Duplicate detection: time overlap + distance similarity
- `source = strava` on imported rows
- Owner can edit imported runs

## API routes

- `GET /api/strava/connect`
- `GET /api/strava/callback`
- `POST /api/strava/import`

## Tasks

- [x] Strava app registration + env vars
- [x] `strava_accounts` token refresh logic
- [x] Import pipeline maps activity → `runs` row
- [x] Duplicate skip with user-visible summary
- [x] Settings page: connect / disconnect Strava
- [ ] Feed event on bulk import (optional)

## Acceptance criteria

- [x] Duplicate activity not inserted twice
- [x] Walk/hike activity types filtered out
- [x] Token refresh works without user re-auth for 30 days
- [x] Imported run editable by owner

## References

- [MASTER_SPEC.md](./MASTER_SPEC.md) §14
**MVP note:** Ship MVP without this phase. Do not block deployment.
