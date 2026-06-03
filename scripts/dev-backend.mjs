import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hasLocalSupabase = existsSync(join(root, "supabase", "config.toml"));

if (hasLocalSupabase) {
  console.log("Starting local Supabase stack...\n");
  spawn("npx", ["supabase", "start"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
} else {
  console.log(`
Run App - Backend
-----------------
Remote Supabase is configured via .env.local.

- API routes are served by the UI dev server:
  Terminal profile "Run App - UI" -> http://localhost:3000/api

- Optional local Supabase:
  npx supabase init
  npx supabase link --project-ref <ref>
  Then reopen this terminal profile.

Use this terminal for migrations, SQL, and Supabase CLI commands.
`);
}
