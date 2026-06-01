# PHASE 0 — Project Setup

**Depends on:** none  
**Blocks:** all phases

## Goal

Bootstrap Next.js PWA project with tooling, folder structure, and environment scaffolding.

## Scope

- Next.js App Router + TypeScript
- Tailwind + shadcn/ui init
- TanStack Query provider
- Zustand (empty store scaffold)
- ESLint + Prettier aligned with `.cursor/rules`
- Env example file

## Out of scope

- Supabase connection (Phase 1)
- Feature screens

## Tasks

- [ ] `npx create-next-app@latest` with App Router, TS, Tailwind
- [ ] Install: `@supabase/supabase-js`, `@tanstack/react-query`, `zustand`, `zod`, `react-hook-form`
- [ ] Install dev: `next-pwa` (configure in Phase 11)
- [ ] Init shadcn/ui (`components/ui`)
- [ ] Create folder structure per [ARCHITECTURE.md](./ARCHITECTURE.md)
- [ ] Add `lib/supabase/client.ts`, `server.ts` stubs
- [ ] Add root layout with QueryClientProvider
- [ ] Add `.env.example` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Add path alias `@/*` in `tsconfig.json`

## Acceptance criteria

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` succeeds
- [ ] Folder structure matches spec
- [ ] No feature business logic in repo yet

## References

- [MASTER_SPEC.md](./MASTER_SPEC.md) §2, §24