# API_CONTRACTS — Run Challenge PWA

**Parent:** [MASTER_SPEC.md](./MASTER_SPEC.md)  
**OpenAPI (grow toward):** `api/openapi.yaml`

All routes live under `/app/api`. Auth: Supabase session cookie or `Authorization: Bearer` (server components use cookie).

**Standard error shape:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": {}
  }
}
```

| HTTP | Meaning |
|------|---------|
| 400 | Validation failed |
| 401 | Not authenticated |
| 403 | Forbidden (not member / not admin) |
| 404 | Not found |
| 409 | Conflict (duplicate sync op, duplicate reaction) |
| 422 | Business rule violation (pace out of range) |

---

## Auth

### `POST /api/auth/signup`

Create account with invite code.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "string",
  "username": "string",
  "inviteCode": "string"
}
```

**Response 201:** `{ "user": ProfileDTO }`

**Rules:** validate invite; username unique; auto-join active challenge.

---

### `POST /api/auth/login`

**Body:** `{ "email": "string", "password": "string" }`

**Response 200:** `{ "user": ProfileDTO }`

---

### `POST /api/auth/logout`

**Response 204**

---

### `GET /api/auth/session`

**Response 200:** `{ "user": ProfileDTO | null }`

---

## Invites

### `POST /api/invites/validate`

**Body:** `{ "code": "string" }`

**Response 200:** `{ "valid": true, "description"?: "string" }`

---

## Profile

### `GET /api/profile`

**Response 200:** `ProfileDTO`

### `PATCH /api/profile`

**Body:** `{ "displayName"?: "string", "avatarUrl"?: "string" }`

---

## Challenges

### `GET /api/challenges/current`

Active challenge for session user.

**Response 200:** `ChallengeDTO | null`

---

### `GET /api/challenges`

List challenges user belongs to (historical + active).

**Query:** `?status=active|completed|all`

**Response 200:** `{ "challenges": ChallengeDTO[] }`

---

### `GET /api/challenges/:id`

**Response 200:** `ChallengeDetailDTO` (includes team progress summary)

---

### `POST /api/challenges` (admin)

**Body:**

```json
{
  "name": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "targetKm": 500,
  "themeCode": "lotr"
}
```

**Response 201:** `ChallengeDTO`

**Side effects:** seed journey nodes; deactivate prior active; auto-enroll all users (configurable).

---

### `PATCH /api/challenges/:id` (admin)

Update dates, name, target, `is_active`, config.

---

### `POST /api/challenges/:id/close` (admin)

Early close → completion pipeline.

---

## Runs

### `POST /api/runs`

**Headers:** `Idempotency-Key: <client_operation_id>` (required for offline sync)

**Body:**

```json
{
  "challengeId": "uuid",
  "distanceKm": 5.2,
  "durationMin": 30,
  "notes": "optional",
  "source": "manual",
  "adminOverride": false,
  "ranAt": "ISO8601 optional"
}
```

**Response 201:** `RunDTO`

---

### `GET /api/runs`

**Query:** `challengeId` (required), `userId?`, `cursor?`, `limit?=20`

**Response 200:** `{ "runs": RunDTO[], "nextCursor": "string | null" }`

---

### `GET /api/runs/:id`

**Response 200:** `RunDetailDTO` (photos, reactions summary)

---

### `PATCH /api/runs/:id`

Owner only. Same body fields as create (partial).

**Response 200:** `RunDTO`

---

### `DELETE /api/runs/:id`

Owner or admin. Hard delete.

**Response 204**

---

### `POST /api/runs/:id/invalidate` (admin)

**Body:** `{ "reason": "string" }`

Sets `is_valid = false`. Does not delete.

---

### `POST /api/runs/:id/restore` (admin)

Restores `is_valid = true` or recovers from archive per implementation.

---

## Run photos

### `POST /api/runs/:id/photos`

**Body:** `multipart/form-data` or `{ "files": presigned metadata }`

Max 3 per run.

**Response 201:** `{ "photos": RunPhotoDTO[] }`

---

### `DELETE /api/runs/:id/photos/:photoId`

Owner only.

---

## Feed

### `GET /api/feed`

**Query:** `challengeId` (required), `cursor?`, `limit?=20`

**Response 200:** `{ "events": FeedEventDTO[], "nextCursor": "string | null" }`

Event types: see `features/feed/types/feed-event.ts`.

---

## Comments

### `POST /api/runs/:id/comments`

**Body:** `{ "body": "string" }`

**Response 201:** `CommentDTO`

---

### `DELETE /api/comments/:id`

Author or admin.

---

## Reactions

### `PUT /api/runs/:id/reactions`

Upsert single reaction.

**Body:** `{ "type": "like" | "fire" | "water" | "ice" }`

**Response 200:** `ReactionDTO`

---

### `DELETE /api/runs/:id/reactions`

Remove user's reaction.

---

## Journey

### `GET /api/journey`

**Query:** `challengeId`

**Response 200:**

```json
{
  "teamDistanceKm": 0,
  "targetKm": 500,
  "currentNode": JourneyNodeDTO,
  "nextNode": JourneyNodeDTO | null,
  "progressToNext": 0.42,
  "nodes": JourneyNodeDTO[],
  "extendedUnlocked": false
}
```

---

## Milestones

### `GET /api/milestones`

**Query:** `challengeId`

**Response 200:** `{ "milestones": MilestoneDTO[] }`

---

### `POST /api/milestones/force` (admin)

**Body:** `{ "challengeId": "uuid", "journeyNodeId": "uuid" }`

---

## Leaderboards

### `GET /api/leaderboards`

**Query:** `challengeId`, `mode` — must match `features/challenges/lib/ranking-types.ts` ids:

`distance` | `run_count` | `average_pace` | `best_pace` | `streak` | `longest_streak` | `social_score`

**Response 200:**

```json
{
  "mode": "distance",
  "entries": [
    { "rank": 1, "user": ProfileDTO, "value": 120.5, "achievedAt": "ISO8601" }
  ],
  "teamTotalKm": 450
}
```

---

## Badges

### `GET /api/badges`

Current user's badges (global).

**Response 200:** `{ "badges": UserBadgeDTO[] }`

---

### `GET /api/badges/catalog`

All badge definitions.

---

## Notifications

### `GET /api/notifications`

**Query:** `unreadOnly?=true`, `cursor?`

**Response 200:** `{ "notifications": NotificationDTO[], "unreadCount": 0 }`

---

### `POST /api/notifications/read`

**Body:** `{ "ids": ["uuid"] }` or `{ "all": true }`

---

## Admin

### `GET /api/admin/users` (admin)

### `DELETE /api/admin/users/:id` (admin)

### `POST /api/admin/invites` (admin)

Create invite codes.

---

## Strava (Phase 2)

### `GET /api/strava/connect`

Redirect URL for OAuth.

### `GET /api/strava/callback`

OAuth callback.

### `POST /api/strava/import`

**Body:** `{ "challengeId": "uuid", "since"?: "ISO8601" }`

**Response 200:** `{ "imported": 3, "skippedDuplicates": 1 }`

---

## DTO Conventions

| DTO | Key fields |
|-----|------------|
| `ProfileDTO` | `id`, `username`, `displayName`, `avatarUrl` |
| `ChallengeDTO` | `id`, `name`, `startDate`, `endDate`, `targetKm`, `isActive`, `teamDistanceKm` |
| `RunDTO` | `id`, `distanceKm`, `durationMin`, `paceMinPerKm`, `notes`, `source`, `isValid`, `createdAt`, `user` |
| `FeedEventDTO` | `id`, `eventType`, `payload`, `actor`, `createdAt` |

---

## React Query keys (convention)

```text
['challenge', 'current']
['challenge', challengeId]
['runs', challengeId]
['feed', challengeId]
['journey', challengeId]
['leaderboard', challengeId, mode]
['badges', 'me']
['notifications']
```

Mutations must invalidate all dependent keys listed in phase docs.
