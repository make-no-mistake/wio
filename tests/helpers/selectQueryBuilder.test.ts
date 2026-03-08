import { describe, expect, test } from "bun:test";
import {
  buildBaseQuery,
  buildWhereClause,
  buildSelectQuery,
} from "../../src/helpers/selectQueryBuilder";

describe("buildBaseQuery", () => {
  test("selects a single JSON column", () => {
    const result = buildBaseQuery(["name"], "channels", 1);
    expect(result).toBe(
      "SELECT data->>'name' AS name FROM relations WHERE relation_name = 'channels' AND site_id = 1",
    );
  });

  test("selects multiple JSON columns", () => {
    const result = buildBaseQuery(["name", "description"], "channels", 1);
    expect(result).toBe(
      "SELECT data->>'name' AS name, data->>'description' AS description FROM relations WHERE relation_name = 'channels' AND site_id = 1",
    );
  });
});

describe("buildWhereClause", () => {
  test("builds equality conditions for simple key-value pairs", () => {
    const result = buildWhereClause({ name: "general", id: 1 });
    expect(result).toBe("data->>'name' = 'general' AND data->>'id' = 1");
  });

  test("builds OR combinator", () => {
    const result = buildWhereClause({
      or: [{ name: "general" }, { id: 1 }],
    });
    expect(result).toBe("(data->>'name' = 'general' OR data->>'id' = 1)");
  });

  test("builds AND combinator", () => {
    const result = buildWhereClause({
      and: [{ name: "general" }, { id: 1 }],
    });
    expect(result).toBe("(data->>'name' = 'general' AND data->>'id' = 1)");
  });

  test("builds NOT combinator", () => {
    const result = buildWhereClause({ not: { name: "general" } });
    expect(result).toBe("NOT (data->>'name' = 'general')");
  });

  test("builds OR with operator conditions and boolean values", () => {
    const result = buildWhereClause({
      or: [{ id: { gt: 15 } }, { id: { lte: 10 } }, { accessed: true }],
    });
    expect(result).toBe(
      "(((data->>'id')::numeric > 15) OR ((data->>'id')::numeric <= 10) OR data->>'accessed' = true)",
    );
  });
});

describe("buildSelectQuery", () => {
  test("builds a full query with where, order_by, limit, and offset", () => {
    const result = buildSelectQuery("channels", 2, {
      select: ["name"],
      limit: 10,
      offset: 12,
      order_by: [
        { column: "name", order: "desc" },
        { column: "description", order: "asc" },
      ],
      where: { name: "general" },
    });
    expect(result).toBe(
      "SELECT data->>'name' AS \"name\", id  FROM relations WHERE relation_name = 'channels' AND site_id = 2 AND data->>'name' = 'general' ORDER BY data->>'name' DESC, data->>'description' ASC LIMIT 10 OFFSET 12;",
    );
  });

  test("builds a wildcard select query", () => {
    const result = buildSelectQuery("channels", 1, {
      select: ["*"],
    });
    expect(result).toBe(
      "SELECT data, id FROM relations WHERE relation_name = 'channels' AND site_id = 1;",
    );
  });

  test("builds a query with only limit", () => {
    const result = buildSelectQuery("users", 3, {
      select: ["email", "name"],
      limit: 5,
    });
    expect(result).toBe(
      "SELECT data->>'email' AS \"email\", data->>'name' AS \"name\", id  FROM relations WHERE relation_name = 'users' AND site_id = 3 LIMIT 5;",
    );
  });

  test("builds a query with only offset", () => {
    const result = buildSelectQuery("users", 1, {
      select: ["email"],
      offset: 20,
    });
    expect(result).toBe(
      "SELECT data->>'email' AS \"email\", id  FROM relations WHERE relation_name = 'users' AND site_id = 1 OFFSET 20;",
    );
  });
});
