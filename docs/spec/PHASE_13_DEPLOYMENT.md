# PHASE 13 — Deployment

**Depends on:** MVP phases 0–9, 11–12 (Phase 10 Strava optional)

## Goal

Production deployment on Vercel + Supabase with env configuration and PWA verification.

## Scope

- Vercel production deploy
- Supabase production project (or promote staging)
- Environment variables
- Domain (optional)
- Smoke test checklist
- Challenge completion cron / scheduled job

## Tasks

- [ ] Create Vercel project linked to repo
- [ ] Set env vars: Supabase URL, anon key, service role (server only)
- [ ] Configure Supabase redirect URLs for auth
- [ ] Run production migrations
- [ ] Deploy `main` branch
- [ ] Verify PWA install on iOS Safari + Android Chrome
- [ ] Schedule `complete_challenge` job (Supabase cron or Vercel cron) for `end_date`
- [ ] Seed production invite codes (not in git)
- [ ] Document rollback procedure in `docs/deployment.md`

## Acceptance criteria

- [ ] Production URL loads journey map for authenticated member
- [ ] Run create works end-to-end with photo
- [ ] RLS blocks cross-challenge access
- [ ] HTTPS + valid manifest
- [ ] No secrets in client bundle (service role absent)
- [ ] June challenge dates correct in production DB

## Post-deploy smoke test

- [ ] Signup with invite
- [ ] Log run 5 km
- [ ] See feed + journey update
- [ ] Reaction + comment + notification
- [ ] Leaderboard shows entry
- [ ] Offline run queues and syncs

## References

- [MASTER_SPEC.md](./MASTER_SPEC.md)