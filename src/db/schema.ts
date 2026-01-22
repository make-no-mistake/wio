import { sql } from "bun";
import { seed } from "./seeds";

export async function initDatabase() {
  await applySchema();
  await seed();
}

async function applySchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS site_assets (
    site_id TEXT NOT NULL,
    filename TEXT NOT NULL
    )`;
}
