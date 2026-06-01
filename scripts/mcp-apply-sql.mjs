/**
 * Outputs SQL files stripped of block comments for MCP migration size.
 * Run: node scripts/mcp-apply-sql.mjs functions
 */
import fs from "fs";
import path from "path";

const file = process.argv[2];
const map = {
  functions: "database/functions.sql",
  triggers: "database/triggers.sql",
  rls: "database/rls-policies.sql",
  seed: "database/seed-data.sql",
  storage: "database/storage-policies.sql",
};

const rel = map[file];
if (!rel) {
  console.error("Usage: node scripts/mcp-apply-sql.mjs <functions|triggers|rls|seed|storage>");
  process.exit(1);
}

let sql = fs.readFileSync(path.join(process.cwd(), rel), "utf8");
sql = sql.replace(/^--.*$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
process.stdout.write(sql);
