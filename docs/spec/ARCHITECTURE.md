# ARCHITECTURE — Run Challenge PWA

**Parent:** [MASTER_SPEC.md](./MASTER_SPEC.md)

---

## 1. Architecture Goals

| Goal | Implementation |
|------|----------------|
| Simplicity | BaaS + thin API layer |
| Mobile performance | PWA, optimistic UI, minimal payloads |
| Offline | IndexedDB queue + cached dashboard |
| Extensibility | Feature modules, JSONB challenge config |
| Small team now, many challenges later | Normalized schema + historical snapshots |

---

## 2. High-Level Diagram

```text
┌──────────────────────────────────────┐
│           Next.js PWA                │
│  App Router · RSC + Client           │
│  TanStack Query · Zustand (UI only)  │
└─────────────────┬────────────────────┘
                  │ HTTPS
                  ▼
┌──────────────────────────────────────┐
│        Next.js API Routes            │
│  Auth session · Zod validation       │
│  Orchestration · Admin guards        │
└─────────────────┬────────────────────┘
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Postgres │ │   Auth   │ │ Storage  │
│   RLS    │ │          │ │  photos  │
│ RPC/trig │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘
      Supabase
```

---

## 3. Technology Stack

### Frontend

- Next.js 14+ App Router
- TypeScript (strict)
- Tailwind CSS + shadcn/ui
- TanStack Query v5
- Zustand (modal state, wizard steps, map UI — not server data)
- React Hook Form + Zod (forms)
- Recharts (leaderboard sparklines, team progress)

### Backend

- Supabase PostgreSQL
- Supabase Auth (email/password)
- Supabase Storage bucket: `run-photos`

### PWA

- `next-pwa`
- Service worker: app shell + dashboard stale-while-revalidate
- IndexedDB: offline run queue (`lib/offline` — implement in Phase 11)

### Hosting

| Component | Host |
|-----------|------|
| Frontend | Vercel |
| Database / Auth / Storage | Supabase Cloud |

---

## 4. Architectural Principles

### 4.1 No business logic in components

```tsx
// FORBIDDEN
if (teamKm >= node.kmMarker) unlockMilestone();

// ALLOWED
const { data } = useQuery({ queryKey: ['journey', challengeId] });
```

### 4.2 Database is source of truth

- Do not store redundant aggregates on `profiles` (e.g. `total_km`)
- Compute via SQL views / RPC (`database/functions.sql`)

### 4.3 Server validation is authoritative

- Client validation = UX only
- API routes + DB constraints = security

### 4.4 Feature-oriented structure

```text
features/
  auth/
  challenges/
  runs/
  feed/
  social/        # comments + reactions UI
  journey/
  leaderboards/
  badges/
  notifications/
  admin/
```

### 4.5 Cross-feature imports

- Features may import from `/lib` only
- Features must **not** import from other features directly
- Shared types: `/lib/types` or colocated in `/lib`

---

## 5. Repository Structure (target)

```text
run-app/
├── app/                    # routes, layouts, api/
│   └── api/                # Route handlers
├── components/             # shared UI (shadcn wrappers)
├── features/               # domain modules
├── hooks/                  # generic hooks only
├── lib/
│   ├── supabase/           # client, server, middleware
│   ├── validators/
│   └── offline/
├── styles/
├── database/
│   ├── schema.sql
│   ├── rls-policies.sql
│   ├── triggers.sql
│   └── functions.sql
├── docs/
│   └── spec/               # this package
└── api/
    └── openapi.yaml        # optional; canonical REST spec: docs/spec/API_CONTRACTS.md
```

---

## 6. Data Flow (detailed)

### 6.1 Online run create

```text
POST /api/runs
  → validate session + challenge membership
  → validate distance, duration, pace
  → insert runs row
  → upload photos (parallel or presigned)
  → DB trigger:
       - feed_events (run_created)
       - evaluate journey milestones
       - refresh ranking cache / RPC
       - badge evaluation function
       - notifications for followers (optional MVP: commenters only)
  → return run DTO
  → client invalidates ['runs', 'feed', 'journey', 'leaderboard']
```

### 6.2 Offline run create

```text
User submits run offline
  → write to IndexedDB queue (client_operation_id)
  → optimistic UI shows pending run
On reconnect:
  → POST /api/runs with Idempotency-Key: client_operation_id
  → sync_operations table prevents duplicate insert
  → reconcile UI
```

### 6.3 Challenge completion (cron or scheduled Edge Function)

```text
end_date passed
  → mark challenge completed (is_active = false)
  → RPC: snapshot rankings → challenge_rankings
  → RPC: generate awards
  → feed_events (challenge_completed)
  → unlock extended journey flag in challenge.config
```

---

## 7. State Management

| State type | Tool |
|------------|------|
| Server entities | TanStack Query |
| Auth session | Supabase client + middleware |
| Form wizards | React Hook Form |
| Map animation, modals | Zustand (local) |
| Offline queue | IndexedDB + small Zustand slice |

**Never** store runs, feed, or leaderboard in Zustand.

---

## 8. Security Model

- All browser DB access through Supabase anon key + RLS
- Admin mutations through API routes using service role **or** `user_roles` check
- Never expose service role key to client
- Session refresh via Supabase middleware in `middleware.ts`

---

## 9. Performance Targets

| Metric | Target |
|--------|--------|
| Run log submit (online) | < 300ms perceived (optimistic) |
| Dashboard LCP | < 2.5s on 4G |
| Feed page size | 20 items paginated |
| Journey map | Static assets WebP, lazy below fold |

---

## 10. Observability (MVP)

- Vercel analytics (optional)
- Supabase logs for RPC errors
- `audit_log` table for admin actions

---

## 11. Related Documents

- [DATA_MODEL.md](./DATA_MODEL.md)
- [API_CONTRACTS.md](./API_CONTRACTS.md)
- [CURSOR_RULES.md](./CURSOR_RULES.md)
