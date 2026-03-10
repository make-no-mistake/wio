import { sql } from "bun";

export interface Site {
  id: number;
  name: string;
  owner_id: number;
  created_at: Date;
}

export async function findSiteByName(name: string): Promise<Site | null> {
  const result = await sql<Site[]>`
    SELECT *
    FROM sites
    WHERE name = ${name};`;

  return result[0] ?? null;
}

export async function findSitesByOwner(ownerId: number): Promise<Site[]> {
  const result = await sql<Site[]>`
    SELECT *
    FROM sites
    WHERE owner_id = ${ownerId}
    ORDER BY created_at DESC;`;

  return result;
}

export async function createSite(
  name: string,
  ownerId: number,
): Promise<Site | null> {
  const result = await sql<Site[]>`
    INSERT INTO sites (name, owner_id)
    VALUES (${name}, ${ownerId})
    RETURNING id, name, owner_id, created_at;
  `;

  return result[0] ?? null;
}

export async function getAllSites(): Promise<Site[]> {
  return await sql<Site[]>`
    SELECT id, name, owner_id, created_at
    FROM sites
    ORDER BY created_at DESC;
  `;
}
