# PHASE 5 — Activity Feed

**Depends on:** [PHASE_4_RUNS.md](./PHASE_4_RUNS.md)

## Goal

Challenge-scoped activity feed with pagination and historical filter.

## Scope

- Feed events from DB (`feed_events`)
- Event types per `feed-event.ts`
- Current vs historical challenge filter
- Cursor pagination

## Out of scope

- Realtime subscriptions (optional later)

## API routes

- `GET /api/feed`

## Tasks

- [x] DB triggers emit `feed_events` on run create/update/delete
- [x] `FeedEventDTO` mapper in `features/feed`
- [x] Feed page with infinite scroll or load more
- [x] Render cards: run, comment, reaction, milestone, badge, challenge completed
- [x] Challenge filter dropdown (current + past challenges)
- [x] Empty state for new challenge

## Acceptance criteria

- [x] New run appears in feed within one refresh / invalidation
- [x] Non-members receive 403 on feed API
- [x] Historical challenge shows frozen feed (no new events after end)
- [x] Event `event_type` values match `FEED_EVENT_TYPES` constant

## References

- `features/feed/types/feed-event.ts`
- [MASTER_SPEC.md](./MASTER_SPEC.md) §8, §17