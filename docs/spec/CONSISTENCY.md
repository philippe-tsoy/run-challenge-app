# Spec Consistency Audit

**Last reviewed:** 2026-05-31  
**Authority:** `docs/spec/` overrides legacy docs when conflicts exist.

## Resolved (fixed in repo)

| Issue | Resolution |
|-------|------------|
| Soft delete vs hard delete | `schema.sql` uses `is_valid`; removed `deleted_at`. `business-rules.md` updated. |
| `runs.is_valid` missing | Added to `schema.sql`; aggregate functions filter `is_valid = true`. |
| Leaderboard API mode names | `API_CONTRACTS.md` uses `ranking-types.ts` ids (`run_count`, not `runs`). |
| Badge names vs codes | `MASTER_SPEC.md` lists badge codes matching `lib/constants/badges.ts`. |
| Social MVP badge | Mapped to `CROWD_FAVORITE` (25 reactions). |
| Notification type strings | Documented: `run_comment`, `run_reaction`, etc. (seed-data). |
| Extended journey | Active challenge: extended markers post-500 km; completion screen after challenge end. |
| `business-rules.md` precedence | Banner points to `docs/spec/`. |
| Auto-enroll on new challenge | Stated explicitly in MASTER_SPEC (no “TBD”). |

## Open gaps (track in phases)

| Gap | Owner phase |
|-----|-------------|
| ~~`feature/` vs `features/`~~ | Resolved: `features/challenges/lib/ranking-types.ts` |
| Leaderboard SQL only implements 3 of 7 modes | Phase 9 |
| Pace validation 2–20 min/km not in DB constraint | Phase 4 API (`lib/validators/run.ts`) |
| `notification_types` table in seed but not core schema | Optional lookup; types are free-text in `notifications` |
| Admin restore after hard delete | Future; audit_log only for now |
| Extended nodes not in `journey-nodes.ts` | `challenges.config.extended_nodes` in Phase 3/8 |
## Canonical cross-reference map

| Concept | Spec | Code / SQL |
|---------|------|------------|
| Feed events | MASTER §8 | `features/feed/types/feed-event.ts` |
| Journey nodes | MASTER §10 | `lib/constants/journey-nodes.ts` → `journey_nodes` table |
| Badges | MASTER §12 | `lib/constants/badges.ts` → `badges.code` |
| Rankings | MASTER §9 | `features/challenges/lib/ranking-types.ts` |
| Team distance | DATA_MODEL | `challenge_total_distance()` in `functions.sql` |

## Review checklist (re-run before launch)

- [ ] All `from runs` queries filter `is_valid = true` (functions, triggers, RLS views)
- [ ] Invalidated run hidden from feed API
- [ ] Milestone evaluation uses team distance excluding invalid runs
- [ ] Badge evaluation ignores invalid runs
- [ ] Phase 0–13 acceptance criteria still pass
