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

describe("updateRelations", () => {
  test("updates a single record", async () => {
    const site = await createSite();
    const inserted = await repo.insertRelations("courses", site.id, [
      { name: "CSC301", year: 2025 },
    ]);

    const result = await repo.updateRelations("courses", site.id, [
      { id: inserted.records![0]!.id, data: { name: "CSC301", year: 2026 } },
    ]);

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(1);
    expect(result.records![0]?.data).toEqual({ name: "CSC301", year: 2026 });
  });

  test("updates multiple records", async () => {
    const site = await createSite();
    const inserted = await repo.insertRelations("courses", site.id, [
      { name: "CSC209" },
      { name: "CSC263" },
    ]);

    const result = await repo.updateRelations("courses", site.id, [
      { id: inserted.records![0]!.id, data: { name: "CSC209", updated: true } },
      { id: inserted.records![1]!.id, data: { name: "CSC263", updated: true } },
    ]);

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(2);
  });

  test("returns empty records when id does not exist", async () => {
    const site = await createSite();
    const result = await repo.updateRelations("courses", site.id, [
      { id: 99999, data: { name: "ghost" } },
    ]);

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(0);
  });

  test("only updates records for the specified relation", async () => {
    const site = await createSite();
    const courses = await repo.insertRelations("courses", site.id, [
      { name: "CSC301" },
    ]);
    const labs = await repo.insertRelations("labs", site.id, [
      { name: "Lab1" },
    ]);

    await repo.updateRelations("courses", site.id, [
      { id: courses.records![0]!.id, data: { name: "Updated" } },
    ]);

    const labResult = await sql`
      SELECT data FROM relations
      WHERE id = ${labs.records![0]!.id}`;
    expect(labResult[0]?.data).toEqual({ name: "Lab1" });
  });
});

describe("selectRelations", () => {
  test("selects all records with wildcard", async () => {
    const site = await createSite();
    await repo.insertRelations("courses", site.id, [
      { name: "CSC301", year: 2026 },
      { name: "CSC209", year: 2025 },
    ]);

    const result = await repo.selectRelations("courses", site.id, {
      select: ["*"],
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(2);
  });

  test("selects specific columns", async () => {
    const site = await createSite();
    await repo.insertRelations("courses", site.id, [
      { name: "CSC301", year: 2026, semester: "Winter" },
    ]);

    const result = await repo.selectRelations("courses", site.id, {
      select: ["name", "year"],
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(1);
    expect(result.records![0]).toHaveProperty("name", "CSC301");
    expect(result.records![0]).toHaveProperty("year", "2026");
  });

  test("selects with where eq operator", async () => {
    const site = await createSite();
    await repo.insertRelations("courses", site.id, [
      { name: "CSC301" },
      { name: "CSC209" },
    ]);

    const result = await repo.selectRelations("courses", site.id, {
      select: ["*"],
      where: { name: { eq: "CSC301" } },
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(1);
    expect(result.records![0]).toMatchObject({ name: "CSC301" });
  });

  test("selects with where gt operator", async () => {
    const site = await createSite();
    await repo.insertRelations("scores", site.id, [
      { student: "Alice", score: 90 },
      { student: "Bob", score: 60 },
      { student: "Charlie", score: 80 },
    ]);

    const result = await repo.selectRelations("scores", site.id, {
      select: ["*"],
      where: { score: { gt: 70 } },
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(2);
  });

  test("selects with or combinator", async () => {
    const site = await createSite();
    await repo.insertRelations("courses", site.id, [
      { name: "CSC301" },
      { name: "CSC209" },
      { name: "CSC263" },
    ]);

    const result = await repo.selectRelations("courses", site.id, {
      select: ["*"],
      where: {
        or: [{ name: { eq: "CSC301" } }, { name: { eq: "CSC263" } }],
      },
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(2);
  });

  test("selects with order_by, limit, and offset", async () => {
    const site = await createSite();
    await repo.insertRelations("courses", site.id, [
      { name: "B_Course" },
      { name: "A_Course" },
      { name: "C_Course" },
    ]);

    const result = await repo.selectRelations("courses", site.id, {
      select: ["*"],
      order_by: [{ column: "name", order: "asc" }],
      limit: 2,
      offset: 0,
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(2);
    expect(result.records![0]).toMatchObject({ name: "A_Course" });
    expect(result.records![1]).toMatchObject({ name: "B_Course" });
  });

  test("only selects records for the specified relation and site", async () => {
    const site1 = await createSite();
    const site2 = await createSite();
    await repo.insertRelations("courses", site1.id, [{ name: "CSC301" }]);
    await repo.insertRelations("labs", site1.id, [{ name: "Lab1" }]);
    await repo.insertRelations("courses", site2.id, [{ name: "CSC209" }]);

    const result = await repo.selectRelations("courses", site1.id, {
      select: ["*"],
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(1);
    expect(result.records![0]).toMatchObject({ name: "CSC301" });
  });
});
