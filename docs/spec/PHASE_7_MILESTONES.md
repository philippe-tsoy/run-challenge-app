# PHASE 7 — Milestones

**Depends on:** [PHASE_3_CHALLENGES.md](./PHASE_3_CHALLENGES.md), [PHASE_4_RUNS.md](./PHASE_4_RUNS.md)  
**Parallel with:** [PHASE_8_JOURNEY_SYSTEM.md](./PHASE_8_JOURNEY_SYSTEM.md) (UI can follow backend evaluation)

## Goal

Journey-node milestone detection, celebration UI, feed + notifications.

## Scope

- Trigger when team distance crosses `km_marker`
- Multiple nodes in one run → all fire
- Idempotent `challenge_milestones` records
- Confetti + modal with admin-editable messages
- Admin force milestone

## Out of scope

- Percentage-based milestones (explicitly forbidden)

## API routes

- `GET /api/milestones`
- `POST /api/milestones/force` (admin)

## Tasks

- [x] SQL function: `evaluate_team_milestones(challenge_id)` after run insert/update
- [x] Insert `challenge_milestones` + `feed_events` (`milestone_reached`)
- [x] Notification to all members (or team subset per product choice: all members)
- [x] Milestone modal component with confetti (`canvas-confetti` or CSS)
- [x] Pull celebration copy from `journey_nodes` / theme config
- [x] Admin force milestone button

## Acceptance criteria

- [x] Crossing 30 km triggers Buckland once only
- [x] Jump from 25→95 km triggers Buckland + Old Forest in one evaluation
- [x] Milestone modal shows on dashboard after run sync
- [x] Forced milestone creates feed event without duplicate DB row

## References

- [MASTER_SPEC.md](./MASTER_SPEC.md) §11
- `lib/constants/journey-nodes.ts` — celebration blocks