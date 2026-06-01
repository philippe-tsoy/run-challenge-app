# PHASE 4 — Runs

**Depends on:** [PHASE_3_CHALLENGES.md](./PHASE_3_CHALLENGES.md)

## Goal

Manual run logging with validation, edit, hard delete, photos, optimistic UI.

## Scope

- Create / list / get / patch / delete runs
- Pace validation 2–20 min/km with admin override flag
- `is_valid` support
- Photo upload (max 3, thumbnail + original)
- Idempotency header for future offline sync

## Out of scope

- Strava import
- Admin invalidate UI (Phase 12) — API stub OK

## API routes

See [API_CONTRACTS.md](./API_CONTRACTS.md) — Runs, Run photos

## Tasks

- [x] `lib/validators/run.ts` — distance, duration, pace (2.0–20.0 min/km per MASTER_SPEC §7)
- [x] `POST /api/runs` accepts `adminOverride: true` for admins only
- [x] `POST /api/runs` with membership check
- [x] Quick-add run modal (distance + duration minimum)
- [x] Run list on profile / challenge
- [x] Edit run screen (owner only)
- [x] Hard delete with confirm
- [x] Photo picker + compress client-side before upload
- [x] Optimistic create + rollback
- [x] Invalidate query keys: `runs`, `journey`, `leaderboard`, `feed`

## Acceptance criteria

- [x] Pace 1 min/km rejected without admin override
- [x] User cannot PATCH another user's run (403)
- [x] Deleted run removed from DB and absent from list
- [x] `is_valid=false` run excluded from team distance RPC
- [x] Max 4th photo rejected

## References

- [MASTER_SPEC.md](./MASTER_SPEC.md) §7
- [DATA_MODEL.md](./DATA_MODEL.md) — runs