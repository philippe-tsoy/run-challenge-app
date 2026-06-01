# PHASE 11 — PWA & Offline

**Depends on:** [PHASE_0_SETUP.md](./PHASE_0_SETUP.md), [PHASE_4_RUNS.md](./PHASE_4_RUNS.md)

## Goal

Installable PWA with offline dashboard and offline run queue.

## Scope

- `next-pwa` service worker
- App shell + dashboard caching
- IndexedDB offline run queue
- Sync on reconnect with `Idempotency-Key` + `sync_operations`
- Add-to-home-screen prompt (once per user, localStorage flag)

## Out of scope

- Full offline feed write
- Background sync API (optional enhancement)

## Tasks

- [x] Configure `next-pwa` in `next.config.js`
- [x] `manifest.json` — name, icons, theme_color, display standalone
- [x] Cache strategy: network-first API, stale-while-revalidate for dashboard static assets
- [x] `lib/offline/queue.ts` — enqueue run payloads
- [x] Offline indicator in UI
- [x] On `online` event: flush queue to `POST /api/runs`
- [x] Pending runs shown with distinct styling in run list
- [x] A2HS prompt component after 2nd visit

## Acceptance criteria

- [x] Lighthouse PWA installable = pass
- [x] Dashboard loads from cache when offline (read-only)
- [x] Run created offline syncs once when online (no duplicate via `sync_operations`)
- [x] Service worker updates without breaking auth session

## References

- [MASTER_SPEC.md](./MASTER_SPEC.md) §15, §23