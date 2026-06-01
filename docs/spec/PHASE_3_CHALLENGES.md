# PHASE 3 — Challenges

**Depends on:** [PHASE_2_AUTH.md](./PHASE_2_AUTH.md)

## Goal

Challenge CRUD (admin), current challenge resolution, historical list, journey node seeding on create.

## Scope

- One active challenge invariant
- Member-only challenge detail
- Auto-enroll users on new challenge (admin policy)
- Seed `journey_nodes` from `LOTR_THEME` constant

## API routes

- `GET /api/challenges/current`
- `GET /api/challenges`
- `GET /api/challenges/:id`
- `POST /api/challenges` (admin)
- `PATCH /api/challenges/:id` (admin)

## Tasks

- [x] Challenge service in `lib/` or `features/challenges`
- [x] Admin UI: create challenge form
- [x] Deactivate previous active on new active challenge
- [x] Copy journey nodes from `lib/constants/journey-nodes.ts`
- [x] Challenge switcher for historical view (read-only)

## Acceptance criteria

- [x] Cannot create second active challenge without deactivating first
- [x] `GET /api/challenges/current` returns June challenge for members
- [x] Historical challenges visible after completion
- [x] Journey nodes exist per challenge (7 default nodes)

## References

- [MASTER_SPEC.md](./MASTER_SPEC.md) §6, §18
- `lib/constants/journey-nodes.ts`