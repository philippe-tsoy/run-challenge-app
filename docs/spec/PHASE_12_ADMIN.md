# PHASE 12 — Admin

**Depends on:** Phases 3–9

## Goal

Admin panel for challenge lifecycle, user management, run lifecycle (not content edits), invites, force milestones.

## Scope

- Multiple admins via `user_roles`
- Challenge create/edit/close early
- Run delete / restore / invalidate (no distance/notes edit)
- User management (remove from challenge, deactivate)
- Invite code CRUD
- Force milestones

## API routes

- Admin section in [API_CONTRACTS.md](./API_CONTRACTS.md)
- `POST /api/runs/:id/invalidate`, `POST /api/runs/:id/restore`
- `POST /api/milestones/force`
- `POST /api/admin/invites`

## Tasks

- [ ] Admin layout gated by role check
- [ ] Challenge management UI
- [ ] User list + role assignment
- [ ] Run moderation table (invalidate / delete / restore)
- [ ] Invite code generator
- [ ] Force milestone tool
- [ ] All admin actions write to `audit_log`

## Acceptance criteria

- [ ] Non-admin receives 403 on admin routes
- [ ] Admin cannot PATCH run distance (API rejects)
- [ ] Invalidate removes run from leaderboard but preserves row
- [ ] Close challenge early triggers completion pipeline
- [ ] Audit log entry for each destructive admin action

## References

- [MASTER_SPEC.md](./MASTER_SPEC.md) §16