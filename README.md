# Run Challenge PWA

Private, invite-only running challenge app (June journey, feed, leaderboards, admin).

- **Production:** https://run-app-omega.vercel.app
- **Repository:** https://github.com/philippe-tsoy/run-challenge-app

## Local development

```bash
npm install
cp .env.example .env.local   # fill Supabase keys
npm run dev
```

### Cursor / VS Code terminals

Two custom terminal profiles start dev services when selected (**Terminal → New Terminal → dropdown**):

| Profile | Starts |
|---------|--------|
| **Run App · UI** | Next.js dev server (`http://localhost:3000`) — UI + `/api` routes |
| **Run App · Backend** | Local Supabase (`supabase start`) if configured; otherwise a backend shell with setup notes |

On folder open, Cursor may prompt to allow automatic tasks — accept to auto-start both terminals.

```bash
npm run dev:ui       # same as npm run dev
npm run dev:backend  # Supabase local stack or backend helper
```

See `docs/spec/README.md` for the full spec index and `docs/deployment.md` for Vercel + Supabase setup.
