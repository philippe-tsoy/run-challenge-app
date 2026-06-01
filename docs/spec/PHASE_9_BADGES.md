# PHASE 9 — Badges & Leaderboards

**Depends on:** [PHASE_4_RUNS.md](./PHASE_4_RUNS.md), [PHASE_6_SOCIAL.md](./PHASE_6_SOCIAL.md) (for Social MVP)

## Goal

Global badge unlocking and multi-mode leaderboards with RPC-backed rankings.

## Scope

### Badges (global)

- First Run, 10k, 50k, Marathon, 3-day streak, 7-day streak, Social MVP
- Auto-evaluate on run insert + social events
- Badge unlock modal + feed event + notification

### Leaderboards

- Team total distance display
- Individual modes: distance, avg pace, best pace, total runs, streaks
- Tie-break: earlier achievement wins
- Recharts sparkline on leaderboard page (optional)

## API routes

- `GET /api/badges`, `GET /api/badges/catalog`
- `GET /api/leaderboards`

## Tasks

- [x] Seed `badges` table from `lib/constants/badges.ts`
- [x] `evaluate_user_badges(user_id)` SQL or API hook
- [x] Streak update in `user_streaks` on run create
- [x] Badge gallery on profile
- [x] Leaderboard page with mode tabs
- [x] `leaderboard_*` SQL functions per mode id in `features/challenges/lib/ranking-types.ts` (3 exist; add remaining)
- [x] Invalidate `leaderboard` + `badges` on run mutations
- [x] Social MVP badge when social score threshold met

## Acceptance criteria

- [x] First run unlocks `FIRST_RUN` badge once
- [x] Badges persist across challenges (global `user_badges`)
- [x] Leaderboard distance ranking correct after delete/invalidate
- [x] Tied users ranked by who hit value first
- [x] Team total matches sum of valid runs

## References

- `lib/constants/badges.ts`
- `features/challenges/lib/ranking-types.ts`
- [MASTER_SPEC.md](./MASTER_SPEC.md) §9, §12