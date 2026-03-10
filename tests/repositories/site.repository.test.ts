import { createSite } from "../factories/site.factory";
import { getAllSites } from "../../src/repositories/site.repository";
import { describe, expect, test } from "bun:test";

describe("getAllSites", () => {
  test("returns an array", async () => {
    const result = await getAllSites();
    expect(Array.isArray(result)).toBe(true);
  });

  test("contains created sites", async () => {
    await createSite({ name: "market-alpha" });
    await createSite({ name: "market-beta" });

    const result = await getAllSites();
    const names = result.map((s) => s.name);

    expect(names).toContain("market-alpha");
    expect(names).toContain("market-beta");
  });

  test("returns sites ordered by created_at descending", async () => {
    await createSite({ name: "market-first" });
    await createSite({ name: "market-second" });

    const result = await getAllSites();
    const idx1 = result.findIndex((s) => s.name === "market-second");
    const idx2 = result.findIndex((s) => s.name === "market-first");

    expect(idx1).toBeLessThan(idx2);
  });

  test("each site has the expected shape", async () => {
    await createSite({ name: "market-shape" });

    const result = await getAllSites();
    const site = result.find((s) => s.name === "market-shape");

    expect(site).toBeDefined();
    expect(typeof site!.id).toBe("number");
    expect(typeof site!.name).toBe("string");
    expect(typeof site!.owner_id).toBe("number");
    expect(site!.created_at).toBeInstanceOf(Date);
  });
});
