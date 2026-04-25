import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import type { FastifyInstance } from "fastify";
import { coerceRecord, coerceValue } from "@/sdk/db/request";
import wio from "@/sdk";
import {
  createTestApp,
  setupSiteAndMockSdkFetch,
  assertRecordsInDb,
} from "../helpers";
import { sql } from "bun";

describe("SDK DB End-to-End Test", () => {
  let fastify: FastifyInstance;
  let siteName: string;
  let rel: ReturnType<typeof wio.useRelation>;

  beforeAll(async () => {
    fastify = await createTestApp();
    siteName = "testing-site";
    await setupSiteAndMockSdkFetch(fastify, siteName);
  });

  afterAll(async () => {
    await fastify.close();
  });

  beforeEach(async () => {
    rel = wio.useRelation("test");
    await clearRelation(siteName, "test");
  });

  test("insert returns the record and the id in a single object", async () => {
    const inserted = await rel.insert({ hello: "world" }).execute();
    expect(inserted).toEqual(
      expect.objectContaining({ hello: "world", id: expect.any(Number) }),
    );
  });

  test("insert multiple returns the record and the id in a single object", async () => {
    const inserted = await rel
      .insert([{ hello: "world" }, { foo: "bar" }])
      .execute();

    expect(inserted).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ hello: "world", id: expect.any(Number) }),
        expect.objectContaining({ foo: "bar", id: expect.any(Number) }),
      ]),
    );
  });

  test("can insert a single record", async () => {
    const payload = { hello: "world" };

    await rel.insert(payload).execute();
    const result = await rel.select("*").execute();

    await assertRecordsInDb(siteName, "test", payload);
    expect(result).toEqual([{ ...payload, id: expect.any(Number) }]);
  });

  test("can insert multiple records", async () => {
    const payload = [{ hello: "world" }, { hello: "world" }];

    await rel.insert(payload).execute();
    const result = await rel.select("*").execute();

    await assertRecordsInDb(siteName, "test", payload);

    expect(result).toEqual(
      expect.arrayContaining([
        { hello: "world", id: expect.any(Number) },
        { hello: "world", id: expect.any(Number) },
      ]),
    );
  });

  async function clearRelation(siteName: string, relationName: string) {
    await sql`
      DELETE FROM relations
      WHERE site_id = (SELECT id FROM sites WHERE name = ${siteName})
        AND relation_name = ${relationName}
    `;
  }

  test("can retrieve records in ascending order", async () => {
    const payload = [
      { order_val: 2, name: "B" },
      { order_val: 10, name: "A" },
      { order_val: 3, name: "C" },
    ];

    await rel.insert(payload).execute();

    const resultAsc = await rel
      .select("*")
      .orderBy("order_val", "asc")
      .execute();
    expect(resultAsc.map((r) => r.name)).toEqual(["B", "C", "A"]);
  });

  test("can retrieve records in descending order", async () => {
    const payload = [
      { order_val: 2, name: "B" },
      { order_val: 10, name: "A" },
      { order_val: 3, name: "C" },
    ];

    await rel.insert(payload).execute();

    const resultDesc = await rel
      .select("*")
      .orderBy("order_val", "desc")
      .execute();
    expect(resultDesc.map((r) => r.name)).toEqual(["A", "C", "B"]);
  });

  test("can retrieve records in ascending order by id", async () => {
    const payload = [
      { order_val: 2, name: "B" },
      { order_val: 10, name: "A" },
      { order_val: 3, name: "C" },
    ];

    await rel.insert(payload).execute();

    const resultIdAsc = await rel.select("*").orderBy("id", "asc").execute();
    expect(resultIdAsc.map((r) => r.name)).toEqual(["B", "A", "C"]);
  });

  test("can retrieve records in descending order by id", async () => {
    const payload = [
      { order_val: 2, name: "B" },
      { order_val: 10, name: "A" },
      { order_val: 3, name: "C" },
    ];

    await rel.insert(payload).execute();

    const resultIdDesc = await rel.select("*").orderBy("id", "desc").execute();
    expect(resultIdDesc.map((r) => r.name)).toEqual(["C", "A", "B"]);
  });

  test("can select specific single column", async () => {
    const payload = [
      { order_val: 10, name: "A", extra: "bar" },
      { order_val: 2, name: "B", extra: "foo" },
    ];

    await rel.insert(payload).execute();

    const resultName = await rel
      .select("name")
      .orderBy("order_val", "asc")
      .execute();

    expect(resultName).toEqual([{ name: "B" }, { name: "A" }]);
  });

  test("can select multiple specific individual columns", async () => {
    const payload = [
      { order_val: 10, name: "A", extra: "bar" },
      { order_val: 2, name: "B", extra: "foo" },
    ];

    await rel.insert(payload).execute();

    const resultMultiple = await rel
      .select(["name", "extra"])
      .orderBy("order_val", "asc")
      .execute();

    expect(resultMultiple).toEqual([
      { name: "B", extra: "foo" },
      { name: "A", extra: "bar" },
    ]);
  });

  test("can select multiple specific individual columns when some columns are missing", async () => {
    const payload = [
      { order_val: 10, name: "A", extra: "bar" },
      { order_val: 2, name: "B" },
    ];

    await rel.insert(payload).execute();

    const resultMultiple = await rel
      .select(["name", "extra"])
      .orderBy("order_val", "asc")
      .execute();

    expect(resultMultiple).toEqual([
      { name: "B", extra: null },
      { name: "A", extra: "bar" },
    ]);
  });

  test("can explicitly select id along with other columns", async () => {
    const payload = [
      { order_val: 2, name: "B", extra: "foo" },
      { order_val: 10, name: "A", extra: "bar" },
    ];

    await rel.insert(payload).execute();

    const resultMultipleWithId = await rel
      .select(["id", "name"])
      .orderBy("order_val", "desc")
      .execute();

    expect(resultMultipleWithId).toEqual([
      { name: "A", id: expect.any(Number) },
      { name: "B", id: expect.any(Number) },
    ]);
  });

  test("can delete a specific record", async () => {
    const payload = [
      { tag: "keep", name: "A" },
      { tag: "remove", name: "B" },
      { tag: "keep", name: "C" },
    ];

    await rel.insert(payload).execute();

    // Find the ID first
    const items = await rel.select(["id", "name"]).execute();
    const itemToDelete = items.find((i) => i.name === "B");
    expect(itemToDelete).toBeDefined();

    const deleteResult = (await rel
      .delete(itemToDelete!.id as number)
      .execute()) as { success: boolean; deleted_ids: number[] };
    expect(deleteResult.success).toBe(true);
    expect(deleteResult.deleted_ids?.length).toBe(1);
    expect(typeof deleteResult.deleted_ids?.[0]).toBe("number");

    // verify it was actually deleted
    const remaining = await rel.select("name").orderBy("name", "asc").execute();
    expect(remaining).toEqual([{ name: "A" }, { name: "C" }]);
  });

  test("can delete multiple records", async () => {
    const payload = [
      { tag: "remove", name: "A" },
      { tag: "keep", name: "B" },
      { tag: "remove", name: "C" },
    ];

    await rel.insert(payload).execute();

    // Find the IDs first
    const items = await rel.select(["id", "name"]).execute();
    const itemsToDelete = items
      .filter((i) => i.name === "A" || i.name === "C")
      .map((i) => i.id as number);
    expect(itemsToDelete.length).toBe(2);

    const deleteResult = (await rel.delete(itemsToDelete).execute()) as {
      success: boolean;
      deleted_ids: number[];
    };

    expect(deleteResult.success).toBe(true);
    // expect two ids deleted
    expect(deleteResult.deleted_ids?.length).toBe(2);

    // verify it was actually deleted
    const remaining = await rel.select("name").execute();
    expect(remaining).toEqual([{ name: "B" }]);
  });

  test("can update a single record", async () => {
    const payload = { hello: "world", count: 1 };
    const inserted = (await rel.insert(payload).execute()) as { id: number };

    const updateResult = await rel.update(inserted.id, { count: 2 }).execute();
    expect(updateResult).toEqual({ id: inserted.id, count: 2 });

    const result = await rel.select(["id", "hello", "count"]).execute();
    expect(result).toEqual([{ id: inserted.id, hello: null, count: 2 }]);
  });

  test("can update multiple records", async () => {
    const payload = [
      { hello: "world1", count: 1 },
      { hello: "world2", count: 1 },
    ];
    const inserted = (await rel.insert(payload).execute()) as unknown as {
      id: number;
    }[];

    const updateResult = await rel
      .update([inserted[0]!.id, inserted[1]!.id], [{ count: 2 }, { count: 3 }])
      .execute();

    expect(updateResult).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: inserted[0]!.id, count: 2 }),
        expect.objectContaining({ id: inserted[1]!.id, count: 3 }),
      ]),
    );

    const result = await rel.select(["id", "hello", "count"]).execute();
    expect(result).toEqual(
      expect.arrayContaining([
        { id: inserted[0]!.id, hello: null, count: 2 },
        { id: inserted[1]!.id, hello: null, count: 3 },
      ]),
    );
  });
});

describe("coerceRecord", () => {
  test("coerces numeric string values in a flat object", () => {
    const input = { name: "Alice", age: "30", score: "99.5" };
    const result = coerceRecord(input);
    expect(result).toEqual({ name: "Alice", age: 30, score: 99.5 });
  });

  test("coerces numeric strings in an array of objects", () => {
    const input = [
      { id: "1", value: "100" },
      { id: "2", value: "200" },
    ];
    const result = coerceRecord(input);
    expect(result).toEqual([
      { id: 1, value: 100 },
      { id: 2, value: 200 },
    ]);
  });

  test("preserves non-numeric strings", () => {
    const input = { greeting: "hello", empty: "" };
    const result = coerceRecord(input);
    expect(result).toEqual({ greeting: "hello", empty: "" });
  });

  test("preserves strings with leading zeros", () => {
    const input = { zip: "0123", code: "007" };
    const result = coerceRecord(input);
    expect(result).toEqual({ zip: "0123", code: "007" });
  });

  test("does not coerce the literal string 'NaN'", () => {
    const input = { broken: "NaN" };
    const result = coerceRecord(input);
    expect(result).toEqual({ broken: "NaN" });
  });

  test("passes through null and primitives unchanged", () => {
    expect(coerceRecord(null)).toBe(null);
    expect(coerceRecord(42)).toBe(42);
    expect(coerceRecord("hello")).toBe("hello");
  });

  test("handles an empty object", () => {
    expect(coerceRecord({})).toEqual({});
  });

  test("handles an empty array", () => {
    expect(coerceRecord([])).toEqual([]);
  });
});

describe("coerceValue", () => {
  test("converts a numeric string to a number", () => {
    expect(coerceValue("42")).toBe(42);
    expect(coerceValue("3.14")).toBe(3.14);
    expect(coerceValue("-7")).toBe(-7);
    expect(coerceValue("0")).toBe(0);
  });

  test("preserves non-numeric strings", () => {
    expect(coerceValue("hello")).toBe("hello");
    expect(coerceValue("")).toBe("");
    expect(coerceValue("NaN")).toBe("NaN");
  });

  test("preserves strings with leading zeros", () => {
    expect(coerceValue("0123")).toBe("0123");
    expect(coerceValue("007")).toBe("007");
  });

  test("passes through non-string values unchanged", () => {
    expect(coerceValue(42)).toBe(42);
    expect(coerceValue(null)).toBe(null);
    expect(coerceValue(undefined)).toBe(undefined);
    expect(coerceValue(true)).toBe(true);
  });
});
