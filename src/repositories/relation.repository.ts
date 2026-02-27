import { sql } from "bun";

export declare interface RelationRecord {
  id: number;
  site_id: number;
  relation_name: string;
  data: Record<string, unknown>;
  created_at: Date;
}

export declare type RecordInsertPayload = Record<string, unknown>;

export declare type RelationsDeletionsResult = {
  success: boolean;
  error?: string;
  deleted_ids?: number[];
};

export declare type RelationsInsertionsResult = {
  success: boolean;
  error?: string;
  records?: RelationRecord[];
};

export declare interface RelationRepository {
  /**
   * Delete one or more records from the relations table.
   * @param relation The name of the relation to delete records from.
   * @param siteId The ID of the site to delete records from.
   * @param ids The IDs of the records to delete from the relation.
   * @returns A promise that resolves to an object with a success boolean and an optional error string.
   */
  deleteRelations(
    relation: string,
    siteId: number,
    ids: number[],
  ): Promise<RelationsDeletionsResult>;

  /**
   * Insert one or more records into the relations table.
   * If any insert fails, the entire batch is rolled back.
   * @param relation The name of the relation to insert records into.
   * @param siteId The ID of the site to insert records into.
   * @param records The records to insert into the relation.
   * @returns A promise that resolves to an object with a success boolean and an optional error string.
   */
  insertRelations(
    relation: string,
    siteId: number,
    records: RecordInsertPayload[],
  ): Promise<RelationsInsertionsResult>;
}

export class RelationRepositoryImpl implements RelationRepository {
  async deleteRelations(
    relation: string,
    siteId: number,
    ids: number[],
  ): Promise<RelationsDeletionsResult> {
    try {
      const deleted = await sql<{ id: number }[]>`
      DELETE FROM relations
      WHERE relation_name = ${relation}
      AND site_id = ${siteId}
      AND id IN ${sql(ids)}
      RETURNING id`;

      return { success: true, deleted_ids: deleted.map((r) => r.id) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async insertRelations(
    relation: string,
    siteId: number,
    records: RecordInsertPayload[],
  ): Promise<RelationsInsertionsResult> {
    const rows = records.map((record) => ({
      site_id: siteId,
      relation_name: relation,
      data: record,
    }));

    let inserted: RelationRecord[] = [];

    try {
      inserted = await sql<RelationRecord[]>`
      INSERT INTO relations ${sql(rows)}
      RETURNING id, site_id, relation_name, data, created_at`;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    return { success: true, records: inserted };
  }
}
