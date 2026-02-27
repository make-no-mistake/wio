import { createSite } from "../factories/site.factory";
import { RelationRepositoryImpl } from "../../src/repositories/relation.repository";
import { describe, expect, test } from "bun:test";
import { sql } from "bun";

const repo = new RelationRepositoryImpl();

describe("insertRelations", () => {
  test("inserts a single record", async () => {
    const site = await createSite();
    const result = await repo.insertRelations("courses", site.id, [
      { name: "CSC301" },
    ]);

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(1);
    expect(result.records![0]?.site_id).toBe(site.id);
  });

  test("inserts multiple records", async () => {
    const site = await createSite();
    const result = await repo.insertRelations("courses", site.id, [
      { name: "CSC209" },
      { name: "CSC263" },
    ]);

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(2);
  });

  test("stores data as JSONB and returns it", async () => {
    const site = await createSite();
    const data = { name: "CSC301", semester: "Winter", year: 2026 };
    const result = await repo.insertRelations("courses", site.id, [data]);

    expect(result.records![0]?.data).toEqual(data);
  });

  test("sets relation_name on inserted records", async () => {
    const site = await createSite();
    const result = await repo.insertRelations("labs", site.id, [
      { name: "Lab1" },
    ]);

    expect(result.records![0]?.relation_name).toBe("labs");
  });
});

describe("deleteRelations", () => {
  test("deletes records and returns their ids", async () => {
    const site = await createSite();
    const inserted = await repo.insertRelations("courses", site.id, [
      { name: "CSC301" },
      { name: "CSC209" },
    ]);

    const ids = inserted.records!.map((r) => r.id);
    const result = await repo.deleteRelations("courses", site.id, ids);

    expect(result.success).toBe(true);
    expect(result.deleted_ids).toEqual(expect.arrayContaining(ids));
  });

  test("returns empty deleted_ids when no records match", async () => {
    const site = await createSite();
    const result = await repo.deleteRelations("courses", site.id, [99999]);

    expect(result.success).toBe(true);
    expect(result.deleted_ids).toEqual([]);
  });

  test("only deletes records for the specified relation", async () => {
    const site = await createSite();
    const courses = await repo.insertRelations("courses", site.id, [
      { name: "CSC301" },
    ]);
    await repo.insertRelations("labs", site.id, [{ name: "Lab1" }]);

    const ids = courses.records!.map((r) => r.id);
    await repo.deleteRelations("courses", site.id, ids);

    const remaining = await sql`
      SELECT id FROM relations
      WHERE site_id = ${site.id} AND relation_name = 'labs'`;
    expect(remaining).toHaveLength(1);
  });
});
