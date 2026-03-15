import { sql } from "bun";
import assert from "node:assert";

export interface Site {
  id: number;
  name: string;
  owner_id: number;
  created_at: Date;
}

/**
 * Finds a site by name. You must use this function in a context that handles
 * throws implicitly, such as a route handler or use it in a try catch block.
 *
 * You most likely want to use this over `findSiteByName` in most route handler
 * contexts to avoid having to deal with the null case. However, if you want to
 * check if a site exists, use `findSiteByName`, which doesn't throw.
 *
 * @param name The name of the site to find.
 * @returns The site with the given name.
 * @throws Error if the site is not found.
 */
export async function getSiteByName(name: string): Promise<Site> {
  const site = await findSiteByName(name);
  assert(site, `Site with name ${name} not found`);

  return site;
}

export async function findSiteByName(name: string): Promise<Site | null> {
  const sites = await sql<Site[]>`
    SELECT *
    FROM sites
    WHERE name = ${name};`;

  return sites[0] ?? null;
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
