# PHASE 8 — Journey System (UI)

**Depends on:** [PHASE_3_CHALLENGES.md](./PHASE_3_CHALLENGES.md), [PHASE_4_RUNS.md](./PHASE_4_RUNS.md)

## Goal

Primary landing experience: LOTR journey map, team progress, next node, extended markers post-500.

## Scope

- Journey map page as default `/` route
- Full route visible; current node highlighted
- Progress bar between current and next node
- Team distance from RPC
- Extended nodes (550, 600, …) during active challenge after Rivendell
- Post-challenge: extended journey unlock flag in UI

## API routes

- `GET /api/journey`

## Tasks

- [x] `GET /api/journey` wraps team distance + node resolution
- [x] Map component using `map_x`, `map_y` from nodes
- [x] Node markers with WebP images from `/public/journey/`
- [x] Highlight current node + dashed path to next
- [x] Team progress header (X / 500 km)
- [x] Quick-add run FAB on map screen
- [x] Personal stats strip (user km, rank preview)
- [x] Leaderboard preview widget (top 3)
- [x] Extended journey markers from `challenge.config` after 500 km
- [x] Completion state at Rivendell (500 km) with “quest complete” copy

## Acceptance criteria

- [x] Map shows all nodes from Hobbiton to Rivendell on first load
- [x] At 15 km, current = Hobbiton, next = Buckland, progress ~50%
- [x] At 520 km, extended marker visible; end_date still governs challenge active state
- [x] Landing page matches spec §19 priority order
- [ ] Recharts mini chart optional for team km over time

## References

- [MASTER_SPEC.md](./MASTER_SPEC.md) §10, §19
- `lib/constants/journey-nodes.ts`