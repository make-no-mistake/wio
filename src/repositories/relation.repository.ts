import { sql } from "bun";

export interface RelationRecord {
  id: number;
  site_id: number;
  table_name: string;
  data: Record<string, unknown>;
  created_at: Date;
}

/**
 * Look up a site's numeric ID from its name.
 * Returns the id or null if not found.
 */
export async function findSiteIdByName(name: string): Promise<number | null> {
  const result = await sql<{ id: number }[]>`
    SELECT id FROM sites WHERE name = ${name}`;

  return result[0]?.id ?? null;
}

/**
 * Insert one or more records into the relations table.
 * If any insert fails, the entire batch is rolled back.
 */
export async function insertRelationRecords(
  siteId: number,
  tableName: string,
  records: Record<string, unknown>[],
): Promise<RelationRecord[]> {
  const rows = records.map((record) => ({
    site_id: siteId,
    table_name: tableName,
    data: record,
  }));

  return await sql.begin(async (tx) => {
    const inserted = await tx<RelationRecord[]>`
      INSERT INTO relations ${tx(rows)}
      RETURNING id, site_id, table_name, data, created_at`;
    return inserted;
  });
}
