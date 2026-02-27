import { sql } from "bun";
import { seed } from "./seeds";

export async function initDatabase() {
  await applySchema();
  await seed();
}

export async function clearDatabase() {
  await sql`DROP TABLE IF EXISTS relations`;
  await sql`DROP TABLE IF EXISTS site_files`;
  await sql`DROP TABLE IF EXISTS sites`;
  await sql`DROP TABLE IF EXISTS users`;
}

async function applySchema() {
  await createUsers();
  await createSites();
  await createRelations();
  await createSiteFiles();
}

/* ===================== USERS ===================== */
async function createUsers() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      tag TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

/* ===================== SITES ===================== */
async function createSites() {
  await sql`
    CREATE TABLE IF NOT EXISTS sites (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name VARCHAR(32) NOT NULL UNIQUE,
      owner_id INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
}

/* ===================== SITE FILES (1:1) ===================== */
async function createSiteFiles() {
  await sql`
    CREATE TABLE IF NOT EXISTS site_files (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      site_id INTEGER NOT NULL,
      s3_path TEXT NOT NULL UNIQUE,
      file_name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
    );
  `;
}

/* ===================== RELATIONS (GENERIC DATA) ===================== */
async function createRelations() {
  await sql`
    CREATE TABLE IF NOT EXISTS relations (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      site_id INTEGER NOT NULL,
      relation_name TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
    );
  `;
}
