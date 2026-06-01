# PHASE 6 — Social & Notifications

**Depends on:** [PHASE_5_FEED.md](./PHASE_5_FEED.md)

## Goal

Comments, reactions, and in-app notification center.

## Scope

- Comments: create, delete (author + admin)
- Reactions: upsert one per user, emoji types
- Notifications for comments, reactions, milestones, badges
- Feed events for social actions

## API routes

- Comments + Reactions per [API_CONTRACTS.md](./API_CONTRACTS.md)
- `GET /api/notifications`, `POST /api/notifications/read`

## Tasks

- [x] Comment composer on run detail / feed card
- [x] Reaction picker on run cards
- [x] `PUT /api/runs/:id/reactions` upsert
- [x] Notification bell + unread badge
- [x] Notification list page
- [x] Mark read (single + all)
- [x] Create notification rows on comment/reaction (recipient = run owner)
- [x] Feed events: `comment_created`, `reaction_created`

## Acceptance criteria

- [x] User can change reaction type on same run
- [x] Only one reaction per user per run in DB
- [x] Run owner sees notification when commented
- [x] No push notification code paths
- [x] Comments cannot be edited after post

## References

- [MASTER_SPEC.md](./MASTER_SPEC.md) §8, §13