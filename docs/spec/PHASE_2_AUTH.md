# PHASE 2 — Authentication & Invites

**Depends on:** [PHASE_1_SUPABASE.md](./PHASE_1_SUPABASE.md)

## Goal

Invite-only signup, login, session, profile, auto-join active challenge.

## Scope

- Signup with invite code validation
- Login / logout
- Session middleware
- Profile row creation trigger or API orchestration
- Username uniqueness enforcement

## Out of scope

- Username-only login (email + password only per spec)
- Strava OAuth

## API routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `POST /api/invites/validate`
- `GET /api/profile`, `PATCH /api/profile`

## Tasks

- [x] Signup page: email, password, username, invite code
- [x] Validate invite before `signUp`
- [x] Create `profiles` row on success
- [x] Auto-insert `challenge_members` for active challenge
- [x] Login page
- [x] `middleware.ts` protect `/app/*` routes except auth pages
- [x] Redirect authenticated users to journey home

## Acceptance criteria

- [x] Invalid invite blocks signup
- [x] Duplicate username returns 409
- [x] New user appears in active challenge members
- [x] Session persists across refresh
- [x] Logout clears session

## References

- [API_CONTRACTS.md](./API_CONTRACTS.md) — Auth
- [MASTER_SPEC.md](./MASTER_SPEC.md) §5