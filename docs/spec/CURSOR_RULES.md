# CURSOR_RULES — Implementation Constraints

**Parent:** [MASTER_SPEC.md](./MASTER_SPEC.md)

Agents and developers must follow these rules when implementing Run Challenge PWA.

---

## 1. Spec hierarchy

1. `docs/spec/MASTER_SPEC.md`
2. `docs/spec/DATA_MODEL.md` + `database/*.sql`
3. `docs/spec/API_CONTRACTS.md`
4. Phase docs (`PHASE_*.md`)
5. `lib/constants/*.ts` and `features/**/types/*`
6. Legacy `docs/business-rules.md` — spec package wins (see banner in that file)
7. `docs/spec/CONSISTENCY.md` — known gaps and canonical cross-refs

---

## 2. Modularity

- Organize by **feature**, not technology layer
- **No cross-feature imports** except through `/lib`
- Shared UI → `/components`
- Shared types/validators → `/lib`

```text
// ALLOWED
import { createRun } from '@/lib/api/runs'

// FORBIDDEN
import { FeedCard } from '@/features/feed/components/FeedCard'
// inside features/runs — use composition at app layer instead
```

---

## 3. Data access

- Browser: `@/lib/supabase/client` only
- Server Components / API routes: `@/lib/supabase/server`
- **Never** call Supabase from components for mutations — use API routes
- Aggregations: Supabase RPC or SQL functions, not client-side reduce over all runs

---

## 4. Mutations

All writes go through:

- `app/api/**` route handlers, or
- Supabase RPC called from API routes

**Never** insert runs directly from a Client Component.

---

## 5. State

| Data | Store |
|------|-------|
| Runs, feed, journey, leaderboards | TanStack Query |
| Modal open, map highlight | Zustand |
| Offline queue | IndexedDB |

Do not put server entities in Zustand.

---

## 6. Business logic

- No milestone/badge/journey rules in JSX
- Validate with Zod in API routes
- Pace/distance rules in shared `lib/validators/run.ts`

---

## 7. UI / UX

- Mobile-first; touch targets ≥ 44px
- Optimistic updates on run create with rollback on error
- Journey map is default `/` route after login
- Use shadcn/ui primitives; match existing `.cursor/rules/ui.mdc`

---

## 8. Security

- Enforce challenge membership on every challenge-scoped route
- Check admin via `user_roles`, not client claims
- Never commit `.env.local`
- Service role only in server-side API code

---

## 9. Testing expectations per phase

Each `PHASE_*.md` lists acceptance criteria. Do not mark phase complete until criteria pass.

---

## 10. File references before coding

Before implementing a phase, read:

- Relevant `PHASE_*.md`
- `database/schema.sql` section for touched tables
- Constants file if exists (`journey-nodes.ts`, `badges.ts`, `feed-event.ts`)
