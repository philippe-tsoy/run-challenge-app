# PHASE 1 — Supabase Setup (detailed runbook)

**Depends on:** [PHASE_0_SETUP.md](./PHASE_0_SETUP.md) (app can be in parallel; env vars needed before Phase 2)  
**Blocks:** Phase 2 (Auth) and all data features

**Time estimate:** 45–90 minutes first time

---

## Overview

You will:

1. Create a Supabase cloud project
2. Configure Auth and Storage
3. Run SQL from `database/` in a fixed order
4. Create your admin account and invite codes
5. Wire `.env.local` for Next.js

**Do not** enable Supabase automatic / AI-generated RLS — use `database/rls-policies.sql` only.

---

## Part A — Create the Supabase project

### A1. New project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project**
3. Choose organization, name (e.g. `run-challenge`), database password (save in a password manager), region (closest to users)
4. Wait until the project status is **Healthy**

### A2. Save API keys

1. **Project Settings** → **API**
2. Copy and store securely:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server only; never commit or expose to the browser)

### A3. Auth — email + password

1. **Authentication** → **Providers**
2. Enable **Email**
3. Recommended for a private 8-user app:
   - **Confirm email:** ON (or OFF for faster local testing — ON for production)
   - **Secure email change:** ON
4. **Authentication** → **URL configuration**
   - **Site URL:** `http://localhost:3000` (change to production URL when deployed)
   - **Redirect URLs:** add `http://localhost:3000/**` and your future Vercel URL

Optional: disable public signups later via app logic (invite required); Supabase may still allow sign-up API until Phase 2 enforces invites.

### A4. RLS setting in dashboard

- **Do not** use “Generate policies” / automatic RLS on tables
- You will enable RLS via `rls-policies.sql`

---

## Part B — Run database SQL (order matters)

Use **SQL Editor** → **New query** for each file. Run **one file at a time**. If a statement fails, fix before continuing.

### Correct order

| Step | File | What it does |
|------|------|----------------|
| 1 | `database/schema.sql` | Tables, indexes, extensions (`pgcrypto`, `citext`) |
| 2 | `database/functions.sql` | Aggregates, leaderboards, journey helpers |
| 3 | `database/triggers.sql` | Triggers (runs → feed, milestones, badges) |
| 4 | `database/rls-policies.sql` | Enable RLS + policies + `is_admin()` / `is_challenge_member()` |
| 5 | `database/seed-data.sql` | Roles, LOTR theme, badges, June 2026 challenge, journey nodes |
| 6 | `database/storage-policies.sql` | Bucket `run-photos` + storage RLS |

**Why this order:** triggers call functions; RLS policies call helper functions; seed inserts into tables that must already exist.

### B1. Run `schema.sql`

1. Open `database/schema.sql` in your repo
2. Copy entire file → paste in SQL Editor → **Run**
3. **Verify** (Table Editor): `profiles`, `challenges`, `runs`, `roles`, `invite_codes`, `journey_nodes`, etc. exist

**Check:**

```sql
select column_name
from information_schema.columns
where table_name = 'runs'
  and column_name in ('is_valid', 'deleted_at');
```

Expected: `is_valid` exists, `deleted_at` does **not**.

### B2. Run `functions.sql`

1. Paste `database/functions.sql` → **Run**
2. **Verify:**

```sql
select challenge_total_distance(
  (select id from challenges limit 1)
);
```

Should return `0` (no runs yet) or run without error if no challenge yet (run after seed).

### B3. Run `triggers.sql`

1. Paste `database/triggers.sql` → **Run**
2. Errors often mean a function or table is missing — re-check B1/B2

### B4. Run `rls-policies.sql`

1. Paste `database/rls-policies.sql` → **Run**
2. **Verify:** Table Editor → `runs` → RLS **enabled** (shield icon)

Admin check uses `user_roles` + `roles.code = 'admin'` via `is_admin()`.

### B5. Run `seed-data.sql`

1. Paste `database/seed-data.sql` → **Run**
2. **Verify:**

```sql
-- One active challenge
select id, name, start_date, end_date, target_km, is_active
from challenges
where is_active = true;

-- Seven journey nodes
select name, km_marker, sort_order
from journey_nodes
where challenge_id = (select id from challenges where is_active = true)
order by sort_order;

-- Roles
select code from roles;

-- Badge catalog (partial)
select code from badges order by code limit 10;
```

Expected seed outcome:

- Challenge: **June 2026 Fellowship Challenge** (`2026-06-01` → `2026-06-30`, `target_km = 500`, `is_active = true`)
- 7 nodes: Hobbiton (0) … Rivendell (500)
- Roles: `admin`, `member`, `moderator`
- Badges: `FIRST_RUN`, `TEN_KM`, … `WEEKLY_WARRIOR`

**Note:** `seed-data.sql` does **not** create invite codes or users — you do that in Part D.

---

## Part C — Storage bucket `run-photos`

### C1. Create bucket

1. **Storage** → **New bucket**
2. Name: `run-photos` (exact name — spec and docs assume this)
3. **Public bucket:** OFF (private; access via policies)
4. Create

### C2. Storage policies (SQL Editor)

Paste and run (adjust if Supabase UI uses different policy names):

```sql
-- Authenticated users can read objects in run-photos
create policy "run_photos_select"
on storage.objects for select
to authenticated
using ( bucket_id = 'run-photos' );

-- Authenticated users can upload to run-photos
create policy "run_photos_insert"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'run-photos' );

-- Users can update/delete their own uploads (folder strategy: challenge_id/run_id/...)
create policy "run_photos_update"
on storage.objects for update
to authenticated
using ( bucket_id = 'run-photos' and owner = auth.uid() );

create policy "run_photos_delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'run-photos' and owner = auth.uid() );
```

Tighten upload paths in Phase 4 (e.g. only members of `challenge_id`). For Phase 1, authenticated upload/read is enough to test.

### C3. Quick storage test (after you have a user in Part D)

In the app or Storage UI, upload a test file to `run-photos/test.webp` while logged in as that user.

---

## Part D — Admin user + invite codes

There is no seed user. You need one **admin** who can manage challenges and one or more **invite codes** for ~8 testers.

### D1. Create auth user (Supabase Dashboard)

1. **Authentication** → **Users** → **Add user** → **Create new user**
2. Email: your admin email
3. Password: strong password
4. **Auto Confirm User:** ON (so you can log in immediately)
5. Create → copy the user **UUID** (e.g. from user detail URL or table)

### D2. Create `profiles` row

Profiles are **not** auto-created by SQL yet (Phase 2 API will do this on signup). For manual admin:

```sql
insert into profiles (
  id,
  username,
  email,
  display_name
)
values (
  '<AUTH_USER_UUID>',
  'yourusername',   -- lowercase, unique, no spaces
  'admin@example.com',
  'Admin'
);
```

Use the same email as the auth user. `username` must be unique.

### D3. Grant admin role

```sql
insert into user_roles (user_id, role_id)
select
  '<AUTH_USER_UUID>'::uuid,
  id
from roles
where code = 'admin';
```

**Verify:**

```sql
select r.code
from user_roles ur
join roles r on r.id = ur.role_id
where ur.user_id = '<AUTH_USER_UUID>';
```

Should return `admin`.

### D4. Join admin to active challenge

```sql
insert into challenge_members (challenge_id, user_id)
select
  c.id,
  '<AUTH_USER_UUID>'::uuid
from challenges c
where c.is_active = true
on conflict do nothing;
```

### D5. Create invite codes for testers

Generate a code per friend or one shared code with a use limit.

**Single shared code (8 uses):**

```sql
insert into invite_codes (
  code,
  description,
  is_active,
  max_uses,
  current_uses,
  created_by
)
values (
  'FELLOWSHIP2026',
  'June 2026 challenge invites',
  true,
  8,
  0,
  '<AUTH_USER_UUID>'::uuid
);
```

**One code per person:**

```sql
insert into invite_codes (code, description, is_active, max_uses, created_by)
values
  ('INVITE-ALICE', 'Alice', true, 1, '<AUTH_USER_UUID>'::uuid),
  ('INVITE-BOB',   'Bob',   true, 1, '<AUTH_USER_UUID>'::uuid);
```

Share codes privately (Signal/WhatsApp). Do not commit codes to git.

**Verify:**

```sql
select code, is_active, max_uses, current_uses, expires_at
from invite_codes
where is_active = true;
```

---

## Part E — Environment variables (Next.js)

### E1. Local env file

In project root (same folder as `package.json`):

```bash
# copy example
cp .env.example .env.local
```

Fill `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

### E2. Security

| Variable | Client-safe? |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (RLS protects data) |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** — API routes / server only |

Add `.env.local` to `.gitignore` (Next.js template usually does this).

### E3. Restart dev server

After changing env:

```bash
npm run dev
```

---

## Part F — Verification checklist

Run these in SQL Editor and/or after Phase 2 auth exists.

### F1. Schema

- [ ] `runs.is_valid` exists
- [ ] No `runs.deleted_at`
- [ ] Only one row with `challenges.is_active = true`

### F2. RLS (anonymous)

In SQL Editor, you are normally `postgres` (bypasses RLS). To test anon behavior, use the **anon** key from a small script or wait until Phase 2.

Intended behavior:

- Unauthenticated client **cannot** read `runs` or `feed_events`
- Authenticated **member** **can** read challenge runs
- Authenticated **non-member** **cannot** read another challenge’s data

### F3. Functions

```sql
select * from leaderboard_distance(
  (select id from challenges where is_active = true limit 1)
);
```

Empty result is OK before any runs.

### F4. Triggers (after Phase 4, or manual test)

Insert a test run as admin member — expect `feed_events` row and milestone evaluation. Defer full test until runs API exists.

### F5. Storage

- [ ] Bucket `run-photos` exists
- [ ] Authenticated upload works

### F6. App connection (Phase 0 + 2)

- [ ] `NEXT_PUBLIC_*` vars load in Next.js
- [ ] Login with admin email/password (once Phase 2 is built)

---

## Part G — Optional: Supabase CLI migrations

For repeatability later:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
# Move SQL into supabase/migrations/ with timestamps
npx supabase db push
```

For now, manual SQL Editor is fine for a single environment.

---

## Part H — Production (preview for Phase 13)

When deploying:

1. Second Supabase project **or** same project with stricter Auth URLs
2. Run the same SQL files on production
3. New invite codes for production users
4. Vercel env vars: same three keys, production Site URL in Supabase Auth

---

## Troubleshooting

| Problem | Likely cause |
|---------|----------------|
| `relation does not exist` | Wrong SQL order — run `schema.sql` first |
| `function X does not exist` | Run `functions.sql` before `triggers.sql` |
| `permission denied` on table | RLS on without policies — run `rls-policies.sql` |
| `profiles` FK fails on insert | UUID must match `auth.users.id` exactly |
| `duplicate key` on challenge | Seed already ran — safe to skip or delete test data |
| `is_admin()` always false | Missing `user_roles` row for `admin` |
| Storage upload 403 | Bucket name mismatch or missing storage policies |
| Invite insert fails on `created_by` | Use valid admin `profiles.id` |

---

## Phase 1 completion criteria

- [ ] All tables from [DATA_MODEL.md](./DATA_MODEL.md) exist
- [ ] SQL files 1–5 applied without errors
- [ ] Bucket `run-photos` + policies
- [ ] Admin user: auth + profile + `user_roles` + `challenge_members`
- [ ] At least one active `invite_codes` row
- [ ] `.env.local` filled; `.env.example` committed without secrets
- [ ] Documented invite codes shared with testers securely

**Next:** [PHASE_2_AUTH.md](./PHASE_2_AUTH.md) — signup with invite validation, login, session, auto-join challenge.

---

## References

- [DATA_MODEL.md](./DATA_MODEL.md)
- [MASTER_SPEC.md](./MASTER_SPEC.md) §5, §16, §21
- `database/*.sql`
- `.env.example`
