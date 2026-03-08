import { createSite } from "../factories/site.factory";
import { RelationRepositoryImpl } from "../../src/repositories/relation.repository";
import { describe, expect, test } from "bun:test";

const repo = new RelationRepositoryImpl();

describe("relation repository integration", () => {
  // ── full CRUD lifecycle ──────────────────────────────────────────────

  test("insert → select → update → select → delete → verify gone", async () => {
    const site = await createSite();

    // 1. Insert
    const inserted = await repo.insertRelations("products", site.id, [
      { name: "Widget", price: 25 },
      { name: "Gadget", price: 50 },
    ]);
    expect(inserted.success).toBe(true);
    expect(inserted.records).toHaveLength(2);
    const ids = inserted.records!.map((r) => r.id);

    // 2. Select — both records exist
    const afterInsert = await repo.selectRelations("products", site.id, {
      select: ["*"],
    });
    expect(afterInsert.success).toBe(true);
    expect(afterInsert.records).toHaveLength(2);

    // 3. Update the first record
    const updated = await repo.updateRelations("products", site.id, [
      { id: ids[0]!, data: { name: "Widget Pro", price: 35 } },
    ]);
    expect(updated.success).toBe(true);
    expect(updated.records![0]?.data).toEqual({
      name: "Widget Pro",
      price: 35,
    });

    // 4. Select — confirm the update persisted
    const afterUpdate = await repo.selectRelations("products", site.id, {
      select: ["name"],
      where: { name: { eq: "Widget Pro" } },
    });
    expect(afterUpdate.success).toBe(true);
    expect(afterUpdate.records).toHaveLength(1);
    expect(afterUpdate.records![0]).toHaveProperty("name", "Widget Pro");

    // 5. Delete both records
    const deleted = await repo.deleteRelations("products", site.id, ids);
    expect(deleted.success).toBe(true);
    expect(deleted.deleted_ids).toEqual(expect.arrayContaining(ids));

    // 6. Select — nothing should remain
    const afterDelete = await repo.selectRelations("products", site.id, {
      select: ["*"],
    });
    expect(afterDelete.success).toBe(true);
    expect(afterDelete.records).toHaveLength(0);
  });

  // ── selectRelations: where operators ─────────────────────────────────

  test("selects with neq operator", async () => {
    const site = await createSite();
    await repo.insertRelations("colors", site.id, [
      { name: "red" },
      { name: "blue" },
      { name: "green" },
    ]);

    const result = await repo.selectRelations("colors", site.id, {
      select: ["name"],
      where: { name: { neq: "red" } },
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(2);
    const names = result.records!.map((r) => r.name);
    expect(names).not.toContain("red");
  });

  test("selects with lt operator", async () => {
    const site = await createSite();
    await repo.insertRelations("scores", site.id, [
      { student: "Alice", score: 40 },
      { student: "Bob", score: 70 },
      { student: "Charlie", score: 90 },
    ]);

    const result = await repo.selectRelations("scores", site.id, {
      select: ["*"],
      where: { score: { lt: 80 } },
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(2);
  });

  test("selects with gte operator", async () => {
    const site = await createSite();
    await repo.insertRelations("scores", site.id, [
      { student: "Alice", score: 70 },
      { student: "Bob", score: 80 },
      { student: "Charlie", score: 90 },
    ]);

    const result = await repo.selectRelations("scores", site.id, {
      select: ["*"],
      where: { score: { gte: 80 } },
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(2);
  });

  test("selects with lte operator", async () => {
    const site = await createSite();
    await repo.insertRelations("scores", site.id, [
      { student: "Alice", score: 70 },
      { student: "Bob", score: 80 },
      { student: "Charlie", score: 90 },
    ]);

    const result = await repo.selectRelations("scores", site.id, {
      select: ["*"],
      where: { score: { lte: 80 } },
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(2);
  });

  test("selects with like operator", async () => {
    const site = await createSite();
    await repo.insertRelations("courses", site.id, [
      { name: "CSC301" },
      { name: "CSC209" },
      { name: "MAT237" },
    ]);

    const result = await repo.selectRelations("courses", site.id, {
      select: ["name"],
      where: { name: { like: "CSC%" } },
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(2);
    for (const rec of result.records!) {
      expect((rec.name as string).startsWith("CSC")).toBe(true);
    }
  });

  test("selects with combined gt and lte operators on same column", async () => {
    const site = await createSite();
    await repo.insertRelations("scores", site.id, [
      { student: "Alice", score: 50 },
      { student: "Bob", score: 75 },
      { student: "Charlie", score: 90 },
    ]);

    const result = await repo.selectRelations("scores", site.id, {
      select: ["*"],
      where: { score: { gt: 60, lte: 90 } },
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(2);
  });

  // ── selectRelations: logical combinators ─────────────────────────────

  test("selects with and combinator", async () => {
    const site = await createSite();
    await repo.insertRelations("students", site.id, [
      { name: "Alice", grade: "A" },
      { name: "Bob", grade: "B" },
      { name: "Alice", grade: "B" },
    ]);

    const result = await repo.selectRelations("students", site.id, {
      select: ["*"],
      where: {
        and: [{ name: { eq: "Alice" } }, { grade: { eq: "A" } }],
      },
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(1);
    expect(result.records![0]).toEqual({ name: "Alice", grade: "A" });
  });

  test("selects with not combinator", async () => {
    const site = await createSite();
    await repo.insertRelations("colors", site.id, [
      { name: "red" },
      { name: "blue" },
      { name: "green" },
    ]);

    const result = await repo.selectRelations("colors", site.id, {
      select: ["name"],
      where: { not: { name: { eq: "red" } } },
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(2);
    const names = result.records!.map((r) => r.name);
    expect(names).toContain("blue");
    expect(names).toContain("green");
  });

  test("selects with nested or inside and", async () => {
    const site = await createSite();
    await repo.insertRelations("items", site.id, [
      { name: "A", category: "x", price: 10 },
      { name: "B", category: "y", price: 20 },
      { name: "C", category: "x", price: 30 },
      { name: "D", category: "y", price: 40 },
    ]);

    // category = 'x' AND (price = 10 OR price = 30)
    const result = await repo.selectRelations("items", site.id, {
      select: ["*"],
      where: {
        and: [
          { category: { eq: "x" } },
          { or: [{ price: { eq: 10 } }, { price: { eq: 30 } }] },
        ],
      },
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(2);
  });

  // ── selectRelations: order_by ────────────────────────────────────────

  test("selects with descending order", async () => {
    const site = await createSite();
    await repo.insertRelations("items", site.id, [
      { name: "Alpha" },
      { name: "Charlie" },
      { name: "Bravo" },
    ]);

    const result = await repo.selectRelations("items", site.id, {
      select: ["name"],
      order_by: [{ column: "name", order: "desc" }],
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(3);
    expect(result.records![0]).toHaveProperty("name", "Charlie");
    expect(result.records![1]).toHaveProperty("name", "Bravo");
    expect(result.records![2]).toHaveProperty("name", "Alpha");
  });

  test("selects with multiple order_by columns", async () => {
    const site = await createSite();
    await repo.insertRelations("items", site.id, [
      { category: "B", name: "Zeta" },
      { category: "A", name: "Beta" },
      { category: "A", name: "Alpha" },
      { category: "B", name: "Gamma" },
    ]);

    const result = await repo.selectRelations("items", site.id, {
      select: ["category", "name"],
      order_by: [
        { column: "category", order: "asc" },
        { column: "name", order: "asc" },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(4);
    expect(result.records![0]).toHaveProperty("name", "Alpha");
    expect(result.records![1]).toHaveProperty("name", "Beta");
    expect(result.records![2]).toHaveProperty("name", "Gamma");
    expect(result.records![3]).toHaveProperty("name", "Zeta");
  });

  // ── selectRelations: offset without limit ────────────────────────────

  test("selects with offset skipping initial records", async () => {
    const site = await createSite();
    await repo.insertRelations("items", site.id, [
      { name: "A" },
      { name: "B" },
      { name: "C" },
    ]);

    const result = await repo.selectRelations("items", site.id, {
      select: ["name"],
      order_by: [{ column: "name", order: "asc" }],
      offset: 2,
    });

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(1);
    expect(result.records![0]).toHaveProperty("name", "C");
  });

  // ── cross-method isolation ───────────────────────────────────────────

  test("operations on one relation do not affect another", async () => {
    const site = await createSite();

    await repo.insertRelations("courses", site.id, [{ name: "CSC301" }]);
    const labs = await repo.insertRelations("labs", site.id, [
      { name: "Lab1" },
      { name: "Lab2" },
    ]);

    // Delete all labs
    const labIds = labs.records!.map((r) => r.id);
    await repo.deleteRelations("labs", site.id, labIds);

    // Courses should be untouched
    const courses = await repo.selectRelations("courses", site.id, {
      select: ["*"],
    });
    expect(courses.success).toBe(true);
    expect(courses.records).toHaveLength(1);
    expect(courses.records![0]).toEqual({ name: "CSC301" });

    // Labs should be empty
    const remainingLabs = await repo.selectRelations("labs", site.id, {
      select: ["*"],
    });
    expect(remainingLabs.records).toHaveLength(0);
  });

  test("operations on one site do not affect another", async () => {
    const site1 = await createSite();
    const site2 = await createSite();

    await repo.insertRelations("courses", site1.id, [{ name: "CSC301" }]);
    const site2Inserted = await repo.insertRelations("courses", site2.id, [
      { name: "CSC209" },
    ]);

    // Update site2 record
    await repo.updateRelations("courses", site2.id, [
      { id: site2Inserted.records![0]!.id, data: { name: "CSC209-updated" } },
    ]);

    // site1 should be untouched
    const site1Courses = await repo.selectRelations("courses", site1.id, {
      select: ["*"],
    });
    expect(site1Courses.records).toHaveLength(1);
    expect(site1Courses.records![0]).toEqual({ name: "CSC301" });

    // site2 should reflect the update
    const site2Courses = await repo.selectRelations("courses", site2.id, {
      select: ["*"],
    });
    expect(site2Courses.records).toHaveLength(1);
    expect(site2Courses.records![0]).toEqual({ name: "CSC209-updated" });
  });

  // ── update does not affect non-matching records in same relation ────

  test("update only changes targeted record, not others in same relation", async () => {
    const site = await createSite();
    const inserted = await repo.insertRelations("courses", site.id, [
      { name: "CSC301", year: 2025 },
      { name: "CSC209", year: 2025 },
    ]);

    await repo.updateRelations("courses", site.id, [
      { id: inserted.records![0]!.id, data: { name: "CSC301", year: 2026 } },
    ]);

    // The un-updated record should be unchanged
    const result = await repo.selectRelations("courses", site.id, {
      select: ["*"],
      where: { name: { eq: "CSC209" } },
    });
    expect(result.records).toHaveLength(1);
    expect(result.records![0]).toEqual({ name: "CSC209", year: 2025 });
  });

  // ── inserting records with complex / nested JSONB data ───────────────

  test("handles complex nested JSONB data", async () => {
    const site = await createSite();
    const complexData = {
      name: "Project Alpha",
      tags: ["urgent", "review"],
      metadata: { version: 2, author: { first: "Jane", last: "Doe" } },
    };
    const inserted = await repo.insertRelations("projects", site.id, [
      complexData,
    ]);

    expect(inserted.success).toBe(true);
    expect(inserted.records![0]?.data).toEqual(complexData);

    // Select it back with wildcard
    const selected = await repo.selectRelations("projects", site.id, {
      select: ["*"],
    });
    expect(selected.records).toHaveLength(1);
    expect(selected.records![0]).toEqual(complexData);
  });
});
