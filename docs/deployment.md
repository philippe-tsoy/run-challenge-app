# Deploy Run Challenge PWA (Vercel + Supabase)

Production build verified with `npm run build`. PWA service worker is generated at build time (`public/sw.js`).

## 1. Supabase (production project)

Use your existing Supabase project or create a new one.

### Database

Ensure schema + RLS are applied (fresh install order in `docs/spec/PHASE_1_SUPABASE.md`).

Patches if you built incrementally:

1. `database/patches/phase7-milestones.sql`
2. `database/patches/phase9-badges-leaderboards.sql` (or `phase9-leaderboards-only.sql` if functions already exist)
3. `database/patches/journey-node-image-urls.sql` (optional, for `/journey/*.jpg` in DB)

### Auth redirect URLs

**Authentication → URL configuration**

| Setting | Value |
|---------|--------|
| Site URL | `https://YOUR-VERCEL-DOMAIN.vercel.app` |
| Redirect URLs | Add all of these (replace domain): |

```
https://YOUR-VERCEL-DOMAIN.vercel.app/**
https://YOUR-VERCEL-DOMAIN.vercel.app/auth/callback
http://localhost:3000/**
http://localhost:3000/auth/callback
```

Keep localhost entries if you still develop locally against the same Supabase project.

### Storage

Confirm `run-photos` bucket exists and policies match `database/rls-policies.sql` / Phase 1 setup.

### Admin + invites

- Grant yourself `admin` in `user_roles` (see `docs/spec/PHASE_1_SUPABASE.md` Part D).
- Create a production invite code (Admin → Invites or SQL). Do not commit codes to git.

---

## 2. Vercel MCP in Cursor (optional but useful)

Lets the agent inspect deployments, logs, and docs from chat after you deploy.

### Setup (one time)

**Option 1 — automatic (easiest)**

From the project root:

```bash
npx add-mcp https://mcp.vercel.com
```

Follow prompts, or add `-y` to accept defaults for detected agents.

**Option 2 — manual**

This repo includes `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "vercel": {
      "url": "https://mcp.vercel.com"
    }
  }
}
```

Or put the same block in your **global** file:

- Windows: `%USERPROFILE%\.cursor\mcp.json`
- macOS/Linux: `~/.cursor/mcp.json`

**Then:**

1. Fully quit and reopen Cursor (not just reload window).
2. Open **Cursor Settings → Tools & MCP** (or Features → MCP).
3. Find **vercel** — status may show **Needs login**. Click it and sign in with your Vercel account (OAuth).
4. When the dot is green, ask in chat: “List my Vercel projects” or “Show latest deployment logs for run-app”.

Official docs: https://vercel.com/docs/agent-resources/vercel-mcp

Only use `https://mcp.vercel.com` (not third-party “vercel-mcp” npm servers unless you trust them).

---

## 3. Vercel deploy

### Option A — Dashboard (recommended)

1. Push the repo to GitHub/GitLab/Bitbucket.
2. [vercel.com/new](https://vercel.com/new) → Import repository.
3. Framework preset: **Next.js** (auto-detected).
4. **Environment variables** (Production + Preview):

| Name | Notes |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — never expose to client |
| `NEXT_PUBLIC_SITE_URL` | `https://YOUR-VERCEL-DOMAIN.vercel.app` (no trailing slash) |

Optional (Strava):

| Name | Notes |
|------|--------|
| `STRAVA_CLIENT_ID` | Strava API app |
| `STRAVA_CLIENT_SECRET` | Server only |

5. Deploy. First build runs `next build` and generates the PWA service worker.

### Option B — CLI

From the project root (after `npx vercel login`):

```bash
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
npx vercel env add NEXT_PUBLIC_SITE_URL
npx vercel --prod
```

---

## 4. After first deploy

1. Update Supabase **Site URL** and **Redirect URLs** to the real Vercel URL if you used a placeholder.
2. Redeploy if you changed `NEXT_PUBLIC_SITE_URL` (or set it before first prod deploy).
3. Strava (optional): set callback URL in Strava app to  
   `https://YOUR-VERCEL-DOMAIN.vercel.app/api/strava/callback`

### Smoke test

- [ ] `https://YOUR-DOMAIN` loads
- [ ] Signup with invite code
- [ ] Login / forgot password email links work
- [ ] Journey map + images (`/journey/*.jpg`)
- [ ] Log a run → feed + journey update
- [ ] Leaderboard entry
- [ ] PWA: open in mobile browser → Add to Home Screen
- [ ] `npm run build && npm start` locally if PWA issues (SW off in dev)

---

## 5. Custom domain (optional)

Vercel → Project → Settings → Domains. Then:

- Set `NEXT_PUBLIC_SITE_URL` to `https://your.domain.com`
- Add the same domain to Supabase redirect URLs
- Redeploy

---

## 6. Rollback

Vercel → Deployments → select previous deployment → **Promote to Production**.

Database changes are not rolled back automatically; keep SQL patches in version control.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Auth redirect loop | `NEXT_PUBLIC_SITE_URL` must match Vercel URL; Supabase redirect URLs must include `/auth/callback` |
| 500 on API routes | Check Vercel logs; confirm `SUPABASE_SERVICE_ROLE_KEY` is set |
| Images 404 on journey | Files must live in `public/journey/*.jpg`; run `journey-node-image-urls.sql` optional |
| PWA not installing | Use production URL (HTTPS); SW only on `next build`, not `next dev` |
| Leaderboard RPC error | Apply `phase9-leaderboards-only.sql` |
