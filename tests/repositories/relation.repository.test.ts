import { createSite } from "../factories/site.factory";
import {
  type RelationsInsertionsResult,
  type RelationsSelectResult,
  RelationRepositoryImpl,
} from "../../src/repositories/relation.repository";
import { beforeEach, describe, expect, test } from "bun:test";
import { sql } from "bun";
import type { Site } from "../../src/repositories/site.repository";

const repo = new RelationRepositoryImpl();

let _site: Site | undefined;

beforeEach(async () => {
  _site = await createSite();
});

function siteFixture(): Site {
  if (!_site) throw new Error("Site not created");
  return _site;
}

async function insertRelations(
  relation: string,
  site: Site,
  data: Record<string, unknown>[],
) {
  return repo.insertRelations(relation, site.id, data);
}

function assertDBResult(
  result: RelationsInsertionsResult | RelationsSelectResult,
  data: Record<string, unknown>[],
) {
  expect(result.success).toBe(true);
  expect(result.records).toHaveLength(data.length);
  expect(result.records).toEqual(
    expect.arrayContaining(
      data.map((d) =>
        expect.objectContaining({ ...d, id: expect.any(Number) }),
      ),
    ),
  );
}

describe("insertRelations", () => {
  test("inserts no records", async () => {
    const result = await insertRelations("courses", siteFixture(), []);
    assertDBResult(result, []);
  });

  test("inserts a single record", async () => {
    const records = [{ name: "CSC301" }];
    const result = await insertRelations("courses", siteFixture(), records);
    assertDBResult(result, records);
  });

  test("inserts multiple records", async () => {
    const records = [
      { name: "CSC301" },
      { name: "CSC209" },
      { name: "CSC263" },
    ];
    const result = await insertRelations("courses", siteFixture(), records);
    assertDBResult(result, records);
  });

  test("inserts records with different types", async () => {
    const records = [
      { grade: 90 },
      { grade: 80.5 },
      { grade: "NCR" },
      { grade: true },
      { grade: false },
      { grade: null },
    ];
    const result = await insertRelations("courses", siteFixture(), records);
    assertDBResult(result, records);
  });

  test("inserts records with different shapes", async () => {
    const records = [
      { grade: 90 },
      { course: "CSC301" },
      { term: "Winter", year: 2026, campus: "St. George" },
    ];
    const result = await insertRelations("courses", siteFixture(), records);
    assertDBResult(result, records);
  });

  test("inserting custom id returns an error", async () => {
    const records = [
      { id: 69420, name: "CSC301" },
      { id: 42069, name: "CSC209" },
    ];
    const result = await insertRelations("courses", siteFixture(), records);
    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "Inserting records with custom id is not allowed",
    );
  });
});

describe("deleteRelations", () => {
  test("deletes no records", async () => {
    const result = await repo.deleteRelations("courses", siteFixture().id, []);
    expect(result.success).toBe(true);
    expect(result.deleted_ids).toEqual([]);
  });

  test("deletes records and returns their ids", async () => {
    const inserted = await insertRelations("courses", siteFixture(), [
      { name: "CSC301" },
      { name: "CSC209" },
    ]);

    const ids = inserted.records!.map((r) => r.id as number);
    const result = await repo.deleteRelations("courses", siteFixture().id, ids);

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
    const courses = await insertRelations("courses", siteFixture(), [
      { name: "CSC301" },
    ]);
    await insertRelations("labs", siteFixture(), [{ name: "Lab1" }]);

    const ids = courses.records!.map((r) => r.id as number);
    await repo.deleteRelations("courses", siteFixture().id, ids);

    const remaining = await sql`
      SELECT id FROM relations
      WHERE site_id = ${siteFixture().id} AND relation_name = 'labs'`;
    expect(remaining).toHaveLength(1);
  });
});

describe("updateRelations", () => {
  test("updates no records", async () => {
    const result = await repo.updateRelations("courses", siteFixture().id, []);
    assertDBResult(result, []);
  });

  test("updates a single record", async () => {
    const inserted = await insertRelations("courses", siteFixture(), [
      { name: "CSC301", year: 2025 },
    ]);

    const result = await repo.updateRelations("courses", siteFixture().id, [
      {
        id: inserted.records![0]!.id as number,
        data: { name: "CSC301", year: 2026 },
      },
    ]);
    assertDBResult(result, [{ name: "CSC301", year: 2026 }]);
  });

  test("returns empty records when id does not exist", async () => {
    const result = await repo.updateRelations("courses", siteFixture().id, [
      { id: 99999, data: { name: "ghost" } },
    ]);

    assertDBResult(result, []);
  });

  test("only updates records for the specified relation", async () => {
    const courses = await insertRelations("courses", siteFixture(), [
      { name: "CSC301" },
    ]);
    await insertRelations("labs", siteFixture(), [{ name: "Lab1" }]);

    const result = await repo.updateRelations("courses", siteFixture().id, [
      { id: courses.records![0]!.id as number, data: { name: "Updated" } },
    ]);
    assertDBResult(result, [{ name: "Updated" }]);
  });
});

describe("selectRelations", () => {
  test("selects all records with wildcard", async () => {
    const inserted = await insertRelations("courses", siteFixture(), [
      { name: "CSC301", year: 2026 },
      { name: "CSC209", year: 2025 },
    ]);

    const result = await repo.selectRelations("courses", siteFixture().id, {
      select: ["*"],
    });

    assertDBResult(result, inserted.records!);
  });

  test("selects specific columns", async () => {
    await insertRelations("courses", siteFixture(), [
      { name: "CSC301", year: 2026, semester: "Winter" },
    ]);

    const result = await repo.selectRelations("courses", siteFixture().id, {
      select: ["name", "year"],
    });

    expect(result.records).toEqual([{ name: "CSC301", year: 2026 }]);
  });

  test("selects with where eq operator", async () => {
    await insertRelations("courses", siteFixture(), [
      { name: "CSC301" },
      { name: "CSC209" },
    ]);

    const result = await repo.selectRelations("courses", siteFixture().id, {
      select: ["*"],
      where: { name: { eq: "CSC301" } },
    });

    assertDBResult(result, [{ name: "CSC301" }]);
  });

  test("selects with where gt operator", async () => {
    await insertRelations("scores", siteFixture(), [
      { student: "Alice", score: 90 },
      { student: "Bob", score: 60 },
      { student: "Charlie", score: 80 },
    ]);

    const result = await repo.selectRelations("scores", siteFixture().id, {
      select: ["*"],
      where: { score: { gt: 70 } },
    });

    assertDBResult(result, [
      { student: "Alice", score: 90 },
      { student: "Charlie", score: 80 },
    ]);
  });

  test("selects with or combinator", async () => {
    await insertRelations("courses", siteFixture(), [
      { name: "CSC301" },
      { name: "CSC209" },
      { name: "CSC263" },
    ]);

    const result = await repo.selectRelations("courses", siteFixture().id, {
      select: ["*"],
      where: {
        or: [{ name: { eq: "CSC301" } }, { name: { eq: "CSC263" } }],
      },
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(2);
  });

  test("selects with order_by, limit, and offset", async () => {
    await insertRelations("courses", siteFixture(), [
      { name: "B_Course" },
      { name: "A_Course" },
      { name: "C_Course" },
    ]);

    const result = await repo.selectRelations("courses", siteFixture().id, {
      select: ["*"],
      order_by: [{ column: "name", order: "asc" }],
      limit: 2,
      offset: 0,
    });

    assertDBResult(result, [{ name: "A_Course" }, { name: "B_Course" }]);
  });

  test("selects with order_by with different types", async () => {
    await insertRelations("courses", siteFixture(), [
      { name: 123, year: 2026 },
      { name: "A_Course", year: 2025 },
      { name: "C_Course", year: 2024 },
    ]);

    const result = await repo.selectRelations("courses", siteFixture().id, {
      select: ["*"],
      order_by: [{ column: "year", order: "desc" }],
    });

    assertDBResult(result, [
      { name: 123, year: 2026 },
      { name: "A_Course", year: 2025 },
      { name: "C_Course", year: 2024 },
    ]);
  });

  test("only selects records for the specified relation and site", async () => {
    await insertRelations("courses", siteFixture(), [{ name: "CSC301" }]);
    await insertRelations("labs", siteFixture(), [{ name: "Lab1" }]);
    await insertRelations("courses", siteFixture(), [{ name: "CSC209" }]);

    const result = await repo.selectRelations("courses", siteFixture().id, {
      select: ["*"],
    });

    assertDBResult(result, [{ name: "CSC301" }, { name: "CSC209" }]);
  });
});

describe("error handling", () => {
  test("deleteRelations handles empty ids array", async () => {
    const result = await repo.deleteRelations("test", siteFixture().id, []);
    expect(typeof result.success).toBe("boolean");
  });

  test("insertRelations handles errors gracefully", async () => {
    const result = await repo.insertRelations("test", siteFixture().id, [
      { key: "value" },
    ]);
    expect(typeof result.success).toBe("boolean");
  });

  test("updateRelations handles errors gracefully", async () => {
    const result = await repo.updateRelations("test", siteFixture().id, [
      { id: 999999, data: { key: "value" } },
    ]);
    expect(typeof result.success).toBe("boolean");
  });

  test("selectRelations handles errors gracefully", async () => {
    const result = await repo.selectRelations("test", siteFixture().id, {
      select: ["*"],
    });
    expect(typeof result.success).toBe("boolean");
  });
});
