# MASTER_SPEC — Run Challenge PWA

**Version:** 1.0  
**Status:** Approved  
**Audience:** Product, Engineering, Cursor agents  

**Package index:** [README.md](./README.md)

---

## 1. Product Overview

A private, invite-only Progressive Web App (PWA) for a running challenge group (~8 users).

The app tracks cumulative running distance from:

**June 1 → June 30**

### Core objective

| Rule | Value |
|------|--------|
| Team goal | 500 km (soft target) |
| Distance cap | None — team may exceed 500 km |
| Challenge end | Always on `end_date` (June 30 for launch challenge) |
| Individual goals | None required |

### Core experience

- Mobile-first PWA
- Extremely fast run logging
- Gamified Lord of the Rings journey system
- Social feed (reactions, comments)
- Private invite-only access
- Offline-capable run creation
- Historical challenge archives forever

### What this is not

This is **not** a fitness tracker. It is a **story-driven running RPG** where:

- Kilometers = progress
- Runs = narrative events
- Journey = shared world map
- Social layer = fellowship dynamics

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth + Postgres + Storage) |
| Server state | TanStack Query |
| UI state | Zustand (ephemeral UI only) |
| Charts | Recharts |
| PWA | next-pwa |

---

## 3. Core Design Principles

1. **Minimal friction logging** — few taps to log a run
2. **Optimistic UI** — instant feedback; reconcile on server response
3. **Offline-first run creation** — queue locally; sync when online
4. **Strong gamification loop** — journey, milestones, badges after every run
5. **Data persists forever** — multi-challenge history supported
6. **No push notifications** — in-app notification center only
7. **Private by default** — invite codes required

---

## 4. System Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full detail.

### Frontend

- Next.js App Router
- Server + Client Components hybrid
- React Query for server state
- Zustand for ephemeral UI state only

### Backend

- Supabase Postgres (primary DB)
- Supabase Auth
- Supabase Storage (run photos)

### Business logic placement

All core logic lives in:

- Next.js API routes (validation, orchestration)
- Supabase RPC functions (aggregations)
- Database triggers (side effects)

**Forbidden:** business rules inside React components.

### Data flow

```text
User logs run (offline or online)
        ↓
Run stored in Supabase (or local queue → sync)
        ↓
Triggers / RPC:
  - leaderboard materialization
  - milestone evaluation
  - feed event creation
  - badge evaluation
  - notification creation
        ↓
UI: React Query invalidation
```

---

## 5. Authentication & Users

### Login

- Email + password (Supabase Auth)
- Username: unique globally (stored on profile)

### Invite system

- Valid invite code **required** on signup
- No public registration

### Profile creation (on signup)

1. Create Supabase auth user
2. Create profile row (`username`, `email`)
3. Auto-join active challenge (if one exists)

---

## 6. Challenge System

### Model

- Multiple historical challenges supported
- **Only one active challenge** at a time

### Fields

| Field | Notes |
|-------|--------|
| `id` | UUID |
| `name` | Display name |
| `start_date` | Inclusive |
| `end_date` | Inclusive; challenge freezes after |
| `target_km` | Default 500 |
| `is_active` | At most one `true` |

### Membership

- Auto-join active challenge on signup
- When admin creates a new active challenge, **all existing users** are auto-enrolled in `challenge_members`

---

## 7. Runs System

### Rules

| Actor | Capability |
|-------|------------|
| User | Create, edit **own** runs only |
| User | Hard delete **own** runs |
| Admin | Delete, restore, invalidate any run |
| Admin | **Cannot** edit run content (distance, notes, photos) |

### Run fields

- `distance_km`
- `duration_min`
- `notes`
- `created_at`
- `source`: `manual` | `strava`
- `is_valid`: boolean (admin can invalidate without deleting)

### Validation (sanity checks)

| Field | Rule |
|-------|------|
| `distance_km` | > 0 |
| `duration_min` | > 0 |
| Pace | Between 2:00 and 20:00 min/km (derived) |
| Override | Admin may bypass pace/distance sanity on create/update |

### Photos

- Max **3** photos per run
- Supabase Storage: original + compressed thumbnail
- Formats: jpg, jpeg, png, webp

### Deletion model

| Action | Who | Effect |
|--------|-----|--------|
| Hard delete | Owner | Row removed from `runs` |
| Hard delete | Admin | Row removed; write `audit_log` entry |
| Invalidate | Admin | `is_valid = false`; row kept; hidden from stats/feed |
| Restore validity | Admin | `is_valid = true` |

There is no user-facing soft delete. Admin **restore** after hard delete is not supported unless the row was archived to `audit_log` (future enhancement).

---

## 8. Social System

### Feed

Includes: new runs, comments, reactions, milestones, challenge events.

Supports:

- Current challenge view
- Historical challenge filter

Canonical event types: `features/feed/types/feed-event.ts`

### Comments

- No edit after post
- Delete: author + admin

### Reactions

One reaction per user per run (changeable):

| Type | Emoji |
|------|-------|
| `like` | 👍 |
| `fire` | 🔥 |
| `water` | 💧 |
| `ice` | 🧊 |

---

## 9. Leaderboards

### Team

- Total distance (primary team metric)

### Individual ranking modes

- Total distance
- Average pace
- Best pace
- Total runs
- Current streak
- Longest streak
- Social score (`social_score` — composite; see `features/challenges/lib/ranking-types.ts`)

Computed via Supabase RPC. See [API_CONTRACTS.md](./API_CONTRACTS.md).

Tie-break: earlier achievement wins.

---

## 10. Journey System (LOTR — core feature)

Team progression mapped to a configurable LOTR route.

### Default nodes (per challenge, stored in DB)

| Location | km_marker |
|----------|-----------|
| Hobbiton | 0 |
| Buckland | 30 |
| Old Forest | 90 |
| Bree | 150 |
| Weathertop | 225 |
| Ford of Bruinen | 310 |
| Rivendell | 500 |

Seed config: `lib/constants/journey-nodes.ts`

### Rules

- Fully configurable per challenge
- **Entire route visible always**
- Current node highlighted
- Progress between current and next node shown

### Post-500 km (during active challenge)

- Map shows **extended km markers** (550, 600, …) from `challenges.config.extended_nodes`
- Challenge still ends on `end_date`
- Rivendell (500 km) remains the narrative “quest complete” node

### Post-challenge end

- **Extended journey completion screen** unlocks (infinite progression UI)
- Historical archive remains read-only accessible

---

## 11. Milestone System

### Trigger logic

- Based on **journey nodes**, not percentages
- If multiple nodes crossed in one run → trigger **all** missed nodes
- Record in `challenge_milestones`

### Features

- Admin-editable celebration messages (per node or override table)
- Confetti animation
- Modal popup
- Feed event + in-app notification

---

## 12. Badges System

**Global** — persistent across challenges (stored per user).

MVP badges (IDs must match `lib/constants/badges.ts` → `badges.code`):

| Display name | Badge code | Trigger |
|--------------|------------|---------|
| First Steps | `FIRST_RUN` | First logged run |
| 10 KM Club | `TEN_KM` | 10 km cumulative |
| 25 KM Club | `TWENTY_FIVE_KM` | 25 km cumulative |
| 50 KM Club | `FIFTY_KM` | 50 km cumulative |
| Marathon Runner | `MARATHON_RUNNER` | 42.2 km cumulative |
| Consistency | `THREE_DAY_STREAK` | 3-day streak |
| Weekly Warrior | `WEEKLY_WARRIOR` | 7-day streak |
| Crowd Favorite | `CROWD_FAVORITE` | 25 reactions received (social MVP) |

Additional badges in constants (e.g. `HUNDRED_KM`, `CONVERSATION_STARTER`) may ship in MVP if evaluation logic exists; do not rename codes without a DB migration.

---

## 13. Notifications (in-app only)

| Event | Notification |
|-------|----------------|
| Reaction on your run | Yes |
| Comment on your run | Yes |
| Milestone reached | Yes (team) |
| Badge unlocked | Yes |
| Challenge completed | Yes |

Notification `notification_type` codes (match `database/seed-data.sql`): `run_comment`, `run_reaction`, `badge_unlocked`, `milestone_reached`, `challenge_completed`.

No push. No email.

---

## 14. Strava Integration (Phase 2)

- OAuth login with Strava
- Import runs (runs only — no walks/hikes)
- Manual sync + optional auto sync
- Duplicate detection: time overlap + distance similarity
- Imported runs editable by owner

See [PHASE_10_STRAVA.md](./PHASE_10_STRAVA.md)

---

## 15. Offline Mode (PWA)

Users can:

- View dashboard offline (cached)
- Create runs offline (IndexedDB queue)
- Sync when online (`sync_operations` dedup)

See [PHASE_11_PWA.md](./PHASE_11_PWA.md)

---

## 16. Admin System

Multiple admins supported (global `admin` role).

| Capability | Allowed |
|------------|---------|
| Create / edit challenges | Yes |
| Delete / restore / invalidate runs | Yes |
| Manage users | Yes |
| Force milestones | Yes |
| Close challenge early | Yes |
| Edit run distance/notes/photos | **No** |

---

## 17. Feed Visibility

- Challenge members only
- Filter: current vs historical `challenge_id`
- Social activity preserved in archive

---

## 18. Challenge Lifecycle

### Active phase

- Runs logged
- Journey progresses
- Feed active

### End phase (`current_date > end_date`)

- Challenge frozen for new runs (unless admin reopens)
- Final leaderboard locked → `challenge_rankings`
- Awards generated → `challenge_awards`
- Snapshot → `challenge_snapshots`

### Post-end

- Extended journey UI unlocks
- Historical archive read-only

---

## 19. Journey UX Priority

**Default landing screen:**

1. Journey map (primary)
2. Team progress + next node
3. Quick add run (FAB or prominent CTA)
4. Personal stats strip
5. Leaderboards preview

---

## 20. Database (summary)

See [DATA_MODEL.md](./DATA_MODEL.md) for full schema.

Core entities: profiles, challenges, challenge_members, runs, run_photos, comments, reactions, journey_nodes, challenge_milestones, badges, user_badges, feed_events, notifications, challenge_rankings, challenge_awards.

---

## 21. RLS Policy Rules

- Members read all data for challenges they belong to
- Users insert/update/delete **only their own** runs
- Admins bypass via service role in API routes + explicit RLS admin policies
- Details: `database/rls-policies.sql`

---

## 22. API Contracts (summary)

See [API_CONTRACTS.md](./API_CONTRACTS.md).

---

## 23. PWA Requirements

- Installable
- Service worker enabled
- Offline shell + dashboard cache
- Add-to-home-screen prompt (gentle, once)

---

## 24. Folder Structure (target)

```text
/app
/components
/features
/hooks
/lib
/styles
/api
/database
/docs
/docs/spec          ← this package
```

---

## 25. Cursor Implementation Rules

See [CURSOR_RULES.md](./CURSOR_RULES.md).

---

## 26. Phase Roadmap

| Phase | Focus |
|-------|--------|
| 0 | Next.js + tooling bootstrap |
| 1 | Supabase project + schema |
| 2 | Auth + invites |
| 3 | Challenges |
| 4 | Runs + photos |
| 5 | Feed |
| 6 | Social + notifications |
| 7 | Milestones |
| 8 | Journey map UI |
| 9 | Badges + leaderboards |
| 10 | Strava (deferred) |
| 11 | PWA + offline |
| 12 | Admin |
| 13 | Deployment |

**Recommended build order:** 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 11 → 12 → 13. Phase 10 (Strava) is optional before launch. Phase 12 (Admin) requires invalidate/delete APIs introduced in Phase 4 but UI lands in Phase 12.
