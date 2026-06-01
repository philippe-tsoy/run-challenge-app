# DATA_MODEL — Run Challenge PWA

**Parent:** [MASTER_SPEC.md](./MASTER_SPEC.md)  
**Implementation:** `database/schema.sql`, `database/rls-policies.sql`, `database/triggers.sql`, `database/functions.sql`

---

## 1. Naming Map (spec ↔ database)

| MASTER_SPEC term | Actual table / column |
|------------------|----------------------|
| `users` | `auth.users` + `profiles` |
| `users.username` | `profiles.username` (citext, unique) |
| `users.email` | `profiles.email` |
| `milestones` (override messages) | `journey_nodes` + optional `challenge.config` JSON |
| `milestones` (triggered record) | `challenge_milestones` |
| `badges` (catalog) | `badges` |
| `badges` (unlocked) | `user_badges` |
| `reactions.type` | `reactions.reaction_type` |
| `comments.text` | `comments.body` |

---

## 2. Schema Alignment

| Spec requirement | Status | Notes |
|------------------|--------|-------|
| `runs.is_valid` | In `schema.sql` | Default `true`; false excludes from aggregates |
| Hard delete (user) | In `schema.sql` | No `deleted_at`; use invalidate for admin moderation |
| Admin roles | `user_roles` + `roles` | Global admin only — no `challenge_members.role` |
| Extended journey markers | `challenges.config` | JSON `extended_nodes[]` after Rivendell |
| Leaderboard RPCs | Partial in `functions.sql` | `leaderboard_distance`, `leaderboard_runs`, `leaderboard_average_pace` exist; add `best_pace`, `streak`, `longest_streak`, `social_score` per Phase 9 |
| `notification_types` | Seed only | Reference table in `seed-data.sql`, not in core `schema.sql` — optional lookup table |

**Source of truth for new work:** this document + MASTER_SPEC.

---

## 3. Entity Relationship Overview

```text
auth.users 1──1 profiles
profiles n──m challenges  (via challenge_members)
challenges 1──n journey_nodes
challenges 1──n runs ──n run_photos
runs 1──n comments
runs 1──n reactions
profiles n──m badges (via user_badges)
challenges 1──n feed_events
profiles 1──n notifications
challenges 1──n challenge_milestones
challenges 1──n challenge_rankings (frozen)
```

---

## 4. Core Tables

### 4.1 `profiles` (spec: users)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | FK → `auth.users` |
| `username` | citext unique | Global unique |
| `email` | citext unique | Mirrors auth email |
| `display_name` | text | Optional |
| `avatar_url` | text | Optional |
| `created_at` | timestamptz | |

### 4.2 `invite_codes`

| Column | Notes |
|--------|-------|
| `code` | Unique invite string |
| `is_active` | Admin can disable |
| `max_uses` / `current_uses` | Optional cap |
| `expires_at` | Optional |

### 4.3 `roles` / `user_roles`

Global platform roles (not per-challenge).

| Code | Purpose |
|------|---------|
| `admin` | Full admin capabilities |
| `member` | Default |

### 4.4 `challenges`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | |
| `name` | text | |
| `start_date` | date | |
| `end_date` | date | Must be > start_date |
| `target_km` | numeric | Default 500 |
| `is_active` | boolean | Partial unique index: one active |
| `theme_id` | uuid FK | Optional |
| `config` | jsonb | Extended journey, feature flags |

**Challenge states (derived):**

```text
Draft     → not started, is_active false
Active    → is_active true, date in range
Completed → end_date passed, frozen
Archived  → admin archived, read-only
```

### 4.5 `challenge_members`

| Column | Notes |
|--------|-------|
| `challenge_id` + `user_id` | Composite PK |
| `joined_at` | Auto on signup or challenge create |

### 4.6 `runs`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | |
| `user_id` | uuid FK profiles | Owner |
| `challenge_id` | uuid FK | |
| `distance_km` | numeric | > 0 |
| `duration_min` | integer | > 0 |
| `notes` | text | Optional |
| `source` | text | `manual` \| `strava` |
| `is_valid` | boolean | Default true; false = excluded from stats |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Pace constraint (app layer + check optional):**

```text
pace_min_per_km = duration_min / distance_km
MUST be between 2.0 and 20.0 unless admin_override flag on request
```

**Invalid vs deleted:**

- `is_valid = false` → run hidden from leaderboards/feed/stats; row retained
- Hard delete → row removed; audit entry recommended

### 4.7 `run_photos`

| Column | Notes |
|--------|-------|
| `original_url` | Storage path |
| `thumbnail_url` | Compressed variant |
| Max 3 per run | Enforced in API |

### 4.8 `comments`

| Column | Notes |
|--------|-------|
| `body` | Required text |
| No `updated_at` | Edits not supported |

### 4.9 `reactions`

| Column | Notes |
|--------|-------|
| `reaction_type` | `like`, `fire`, `water`, `ice` |
| Unique (`run_id`, `user_id`) | One per user per run |

### 4.10 `journey_nodes`

Per-challenge configurable nodes.

| Column | Notes |
|--------|-------|
| `km_marker` | numeric |
| `sort_order` | int, unique per challenge |
| `name`, `description` | |
| `map_x`, `map_y` | Map position |
| `image_url` | |

Seed from `lib/constants/journey-nodes.ts` on challenge create.

### 4.11 `challenge_milestones`

Records which nodes have fired for a challenge.

| Column | Notes |
|--------|-------|
| `journey_node_id` | FK |
| `triggered_at` | |
| Unique (challenge_id, journey_node_id) | Idempotent |

### 4.12 `badges` / `user_badges`

- `badges.code` matches `lib/constants/badges.ts` `id`
- `user_badges` = global unlock timestamps

### 4.13 `feed_events`

| Column | Notes |
|--------|-------|
| `event_type` | Matches `feed-event.ts` |
| `entity_type`, `entity_id` | Polymorphic reference |
| `payload` | jsonb event detail |

### 4.14 `notifications`

| Column | Notes |
|--------|-------|
| `notification_type` | `run_comment`, `run_reaction`, `badge_unlocked`, `milestone_reached`, `challenge_completed` |
| `payload` | jsonb |
| `is_read` | boolean |

### 4.15 Historical / completion

| Table | Purpose |
|-------|---------|
| `challenge_rankings` | Frozen leaderboard rows |
| `challenge_awards` | End-of-challenge awards |
| `challenge_snapshots` | Team totals at completion |
| `user_streaks` | Streak tracking |
| `audit_log` | Admin actions |
| `sync_operations` | Offline idempotency |

### 4.16 Phase 2: `strava_accounts`

OAuth tokens per user. Never expose tokens to client.

---

## 5. RLS Policy Summary

| Operation | Rule |
|-----------|------|
| SELECT challenge data | Member of `challenge_members` |
| INSERT run | Own `user_id` + member of challenge |
| UPDATE run | Own `user_id` only |
| DELETE run | Own `user_id` OR admin |
| INSERT comment/reaction | Challenge member |
| SELECT feed | Challenge member |
| Notifications | `user_id = auth.uid()` |
| Admin tables | Admin role policy or service role in API |

Full policies: `database/rls-policies.sql`

---

## 6. Triggers & RPC (responsibilities)

| Trigger / RPC | Responsibility |
|---------------|----------------|
| `on_run_insert` | Feed event, milestone check, badge eval |
| `on_run_update` | Recompute stats, feed `run_updated` |
| `on_run_delete` | Feed `run_deleted`, ranking refresh |
| `leaderboard_distance`, `leaderboard_runs`, `leaderboard_average_pace` | Implemented in `functions.sql` |
| `leaderboard_best_pace`, `leaderboard_streak`, … | Add per `ranking-types.ts` ids |
| Team progress | Sum valid runs or dedicated RPC; node resolution in app from `journey_nodes` |
| Challenge completion | Snapshot → `challenge_snapshots`, rankings → `challenge_rankings`, awards → `challenge_awards` |

Implement in `database/triggers.sql` and `database/functions.sql`.

---

## 7. Storage

| Bucket | Path pattern |
|--------|----------------|
| `run-photos` | `{challenge_id}/{run_id}/{uuid}.webp` |

RLS: authenticated upload; members read.

---

## 8. Indexes (critical)

- `runs(challenge_id, created_at desc)`
- `feed_events(challenge_id, created_at desc)`
- `challenge_members(user_id)`
- `profiles(username)` unique
- `challenges(is_active) where is_active` unique partial

---

## 9. Seed Data

`database/seed-data.sql` should include:

- LOTR `challenge_themes`
- June 2026 challenge (admin-configured dates)
- Default `journey_nodes` from constants
- Badge catalog rows
- Default admin user (manual step documented in Phase 1)
