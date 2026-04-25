import { sql } from "bun";
import type { SelectPayload } from "@/sdk/db/payload";
import { buildSelectQuery } from "@/helpers/select-query-builder";

export declare interface RelationRecord {
  id: number;
  site_id: number;
  relation_name: string;
  data: Record<string, unknown>;
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
  records?: Record<string, unknown>[];
};

export declare type RelationsUpdateResult = {
  success: boolean;
  error?: string;
  records?: Record<string, unknown>[];
};

export declare type RelationsSelectResult = {
  success: boolean;
  error?: string;
  records?: Record<string, unknown>[];
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

  /**
   * Update one or more records in the relations table.
   * @param relation The name of the relation to update records in.
   * @param siteId The ID of the site to update records in.
   * @param updates The updates to apply, each with an id and new data.
   * @returns A promise that resolves to an object with a success boolean and an optional error string.
   */
  updateRelations(
    relation: string,
    siteId: number,
    updates: { id: number; data: Record<string, unknown> }[],
  ): Promise<RelationsUpdateResult>;

  /**
   * Select records from the relations table using a SelectPayload.
   * @param relation The name of the relation to select records from.
   * @param siteId The ID of the site to select records from.
   * @param payload The SelectPayload describing the query (select, where, order_by, limit, offset).
   * @returns A promise that resolves to an object with a success boolean and matching records.
   */
  selectRelations(
    relation: string,
    siteId: number,
    payload: SelectPayload,
  ): Promise<RelationsSelectResult>;
}

export class RelationRepositoryImpl implements RelationRepository {
  async deleteRelations(
    relation: string,
    siteId: number,
    ids: number[],
  ): Promise<RelationsDeletionsResult> {
    if (ids.length === 0) {
      return { success: true, deleted_ids: [] };
    }

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
    if (records.length === 0) {
      return { success: true, records: [] };
    }

    const rows = records.map((record) => ({
      site_id: siteId,
      relation_name: relation,
      data: record,
    }));

    for (const row of rows) {
      if (row.data.id) {
        return {
          success: false,
          error: "Inserting records with custom id is not allowed",
        };
      }
    }

    let inserted: RelationRecord[] = [];

    try {
      inserted = await sql<RelationRecord[]>`
      INSERT INTO relations ${sql(rows)}
      RETURNING id, site_id, relation_name, data`;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    const insertedRecords = inserted.map((record) => ({
      id: record.id,
      ...record.data,
    }));

    return { success: true, records: insertedRecords };
  }

  async updateRelations(
    relation: string,
    siteId: number,
    updates: { id: number; data: Record<string, unknown> }[],
  ): Promise<RelationsUpdateResult> {
    if (updates.length === 0) {
      return { success: true, records: [] };
    }

    try {
      const updated: RelationRecord[] = [];

      await sql.begin(async (tx) => {
        for (const update of updates) {
          const result = await tx<RelationRecord[]>`
            UPDATE relations
            SET data = ${update.data}::jsonb
            WHERE id = ${update.id}
            AND site_id = ${siteId}
            AND relation_name = ${relation}
            RETURNING id, site_id, relation_name, data`;
          if (result[0]) updated.push(result[0]);
        }
      });

      const updatedRecords = updated.map((record) => ({
        id: record.id,
        ...record.data,
      }));

      return { success: true, records: updatedRecords };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async selectRelations(
    relation: string,
    siteId: number,
    payload: SelectPayload,
  ): Promise<RelationsSelectResult> {
    try {
      const query = buildSelectQuery(relation, siteId, payload);
      const rows = await sql.unsafe(query);

      const isWildcard =
        payload.select.length === 1 && payload.select[0] === "*";

      const records = rows.map((row: RelationRecord) => {
        if (isWildcard) {
          row.data.id = row.id;
          return row.data;
        } else {
          return row;
        }
      });

      return { success: true, records };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
