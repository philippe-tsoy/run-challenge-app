# Remaining work

Last updated after Phase 12 admin panel (in progress).

## Completed phases

| Phase | Status |
|-------|--------|
| 2 Auth & invites | Done |
| 3 Challenges | Done |
| 4 Runs | Done |
| 5 Feed | Done |
| 6 Social | Done |
| 7 Milestones | Done (apply `database/patches/phase7-milestones.sql` if not yet) |
| 8 Journey map | Done |
| 9 Badges & leaderboards | Done (apply `database/patches/phase9-badges-leaderboards.sql` if not yet) |
| 10 Strava | **Core done** — see deferred below |
| 11 PWA & offline | Done |
| 12 Admin panel | **Core done** — rankings/awards pipeline on close still DB-only |

## Strava — deferred (skip for now)

- [ ] Optional feed event on bulk import
- [ ] Background / scheduled auto-sync
- [ ] Strava env + callback URL documented in `PHASE_13_DEPLOYMENT.md`
- [ ] E2E test with real Strava app credentials

Core paths already exist: connect, import, settings UI, token refresh.

## Phase 11 — PWA & offline

Done (service worker disabled in `npm run dev`; test PWA with `npm run build && npm start`).

## Phase 12 — Admin panel

Done in app: `/app/admin` hub, invites, users, runs, audit log; close challenge early; restore runs.

- [ ] Full challenge completion pipeline (rankings / awards / snapshots) on close — not in API yet

## Phase 13 — Deployment (next)

Step-by-step: **`docs/deployment.md`**

- [ ] Vercel project + env vars
- [ ] Supabase Site URL + redirect URLs
- [ ] Production invite codes (not in git)
- [ ] Post-deploy smoke test

## Optional polish (not blocking MVP)

- [x] Journey map images (`public/journey/*.jpg`)
- [ ] Recharts sparkline on leaderboard page
- [ ] OpenAPI / `api/openapi.yaml` completion
- [ ] Lighthouse PWA audit pass (after Phase 11 icons)

## Database patches to apply (Supabase SQL Editor)

1. `database/patches/phase7-milestones.sql`
2. `database/patches/phase9-badges-leaderboards.sql`

Fresh installs: use full `database/functions.sql` + `database/triggers.sql` instead.
