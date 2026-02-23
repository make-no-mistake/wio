import { sql } from "bun";
import { createUser } from "./user.factory";

let siteCounter = 1;

interface SiteOverrides {
  name?: string;
  owner_id?: number;
}

export async function createSite(overrides: SiteOverrides = {}) {
  const owner_id = overrides.owner_id ?? (await createUser()).id;
  const name = overrides.name ?? `test-site-${siteCounter++}`;

  const result = await sql`
    INSERT INTO sites (name, owner_id)
    VALUES (${name}, ${owner_id})
    RETURNING id, name, owner_id`;

  return result[0];
}
