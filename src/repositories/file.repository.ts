import { sql } from "bun";

export interface SiteFile {
  id: number;
  site_id: number;
  s3_path: string;
  file_name: string;
  created_at: Date;
}

export async function clearSiteFiles(siteId: number): Promise<void> {
  await sql`
    DELETE FROM site_files
    WHERE site_id = ${siteId};
  `;
}

export async function insertSiteFile(
  siteId: number,
  s3Path: string,
  fileName: string,
): Promise<SiteFile | null> {
  const result = await sql<SiteFile[]>`
    INSERT INTO site_files (site_id, s3_path, file_name)
    VALUES (${siteId}, ${s3Path}, ${fileName})
    RETURNING id, site_id, s3_path, file_name, created_at;
  `;

  return result[0] ?? null;
}

export async function getSiteFiles(siteId: number): Promise<SiteFile[]> {
  return await sql<SiteFile[]>`
    SELECT *
    FROM site_files
    WHERE site_id = ${siteId};
  `;
}

export async function getSiteFileByName(
  siteId: number,
  fileName: string,
): Promise<SiteFile | null> {
  const result = await sql<SiteFile[]>`
    SELECT *
    FROM site_files
    WHERE site_id = ${siteId} AND file_name = ${fileName};
  `;

  return result[0] ?? null;
}
