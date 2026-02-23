import { createSite } from "../factories/site.factory";
import {
  findSiteIdByName,
  insertRelationRecords,
} from "../../src/repositories/relation.repository";
import { describe, expect, test } from "bun:test";

describe("findSiteIdByName", () => {
  test("returns the site id for an existing site", async () => {
    const site = await createSite();
    const found = await findSiteIdByName(site.name);

    expect(found).toBe(site.id);
  });

  test("returns null for a non-existent site", async () => {
    const found = await findSiteIdByName("no-such-site");

    expect(found).toBeNull();
  });
});

describe("insertRelationRecords", () => {
  test("inserts a single record", async () => {
    const site = await createSite();
    const records = await insertRelationRecords(site.id, "courses", [
      { name: "CSC301" },
    ]);

    expect(records).toHaveLength(1);
    expect(records[0]?.site_id).toBe(site.id);
    expect(records[0]?.table_name).toBe("courses");
  });

  test("inserts multiple records in a transaction", async () => {
    const site = await createSite();
    const records = await insertRelationRecords(site.id, "courses", [
      { name: "CSC209" },
    ]);
    const records2 = await insertRelationRecords(site.id, "labs", [
      { name: "CSC263" },
    ]);

    expect(records).toHaveLength(1);
    expect(records2).toHaveLength(1);
  });
});
