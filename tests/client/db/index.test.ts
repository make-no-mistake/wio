import { describe, expect, test } from "bun:test";
import { useRelation } from "../../../src/client/db";

describe("delete", () => {
  test("delete", () => {
    const clause = useRelation("test").delete(0);
    expect(clause.payload()).toEqual({ ids: [0] });
  });

  test("delete multiple", () => {
    const clause = useRelation("test").delete([0, 1, 2]);
    expect(clause.payload()).toEqual({ ids: [0, 1, 2] });
  });
});

describe("insert", () => {
  test("insert single", () => {
    const clause = useRelation("test").insert({ name: "Alice" });
    expect(clause.payload()).toEqual({ data: [{ name: "Alice" }] });
  });

  test("insert multiple", () => {
    const clause = useRelation("test").insert([
      { name: "Alice" },
      { name: "Bob" },
    ]);
    expect(clause.payload()).toEqual({
      data: [{ name: "Alice" }, { name: "Bob" }],
    });
  });
});

describe("update", () => {
  test("update single", () => {
    const clause = useRelation("test").update(1, { name: "Updated" });
    expect(clause.payload()).toEqual({ id: [1], data: [{ name: "Updated" }] });
  });

  test("update multiple", () => {
    const clause = useRelation("test").update(
      [1, 2],
      [{ name: "A" }, { name: "B" }],
    );
    expect(clause.payload()).toEqual({
      id: [1, 2],
      data: [{ name: "A" }, { name: "B" }],
    });
  });
});

describe("select", () => {
  test("select columns", () => {
    const clause = useRelation("test").select(["id", "name"]);
    expect(clause.payload()).toEqual({ select: ["id", "name"] });
  });

  test("select with where", () => {
    const clause = useRelation("test")
      .select("*")
      .where({ id: { eq: 1 } });
    expect(clause.payload()).toEqual({
      select: ["*"],
      where: { id: { eq: 1 } },
    });
  });

  test("select with order, limit, offset", () => {
    const clause = useRelation("test")
      .select("*")
      .orderBy("name", "desc")
      .limit(10)
      .offset(5);
    expect(clause.payload()).toEqual({
      select: ["*"],
      order_by: [{ column: "name", order: "desc" }],
      limit: 10,
      offset: 5,
    });
  });
});
