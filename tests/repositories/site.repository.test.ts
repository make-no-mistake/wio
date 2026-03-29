import { createSite } from "../factories/site.factory";
import { createUser } from "../factories/user.factory";
import {
  getAllSites,
  findSiteByName,
  findSitesByOwner,
  getSiteByName,
  createSite as repoCreateSite,
} from "../../src/repositories/site.repository";
import { describe, expect, test } from "bun:test";

const ts = String(Date.now()).slice(-6);
let nc = 0;
function uniqueName(label: string) {
  return `s-${label}-${ts}${++nc}`;
}

describe("getAllSites", () => {
  test("returns an array", async () => {
    const result = await getAllSites();
    expect(Array.isArray(result)).toBe(true);
  });

  test("contains created sites", async () => {
    const nameA = uniqueName("alpha");
    const nameB = uniqueName("beta");
    await createSite({ name: nameA });
    await createSite({ name: nameB });

    const result = await getAllSites();
    const names = result.map((s) => s.name);

    expect(names).toContain(nameA);
    expect(names).toContain(nameB);
  });

  test("returns sites ordered by created_at descending", async () => {
    const nameFirst = uniqueName("first");
    const nameSecond = uniqueName("second");
    await createSite({ name: nameFirst });
    await createSite({ name: nameSecond });

    const result = await getAllSites();
    const idx1 = result.findIndex((s) => s.name === nameSecond);
    const idx2 = result.findIndex((s) => s.name === nameFirst);

    expect(idx1).toBeLessThan(idx2);
  });

  test("each site has the expected shape", async () => {
    const name = uniqueName("shape");
    await createSite({ name });

    const result = await getAllSites();
    const site = result.find((s) => s.name === name);

    expect(site).toBeDefined();
    expect(typeof site!.id).toBe("number");
    expect(typeof site!.name).toBe("string");
    expect(typeof site!.owner_id).toBe("number");
    expect(site!.created_at).toBeInstanceOf(Date);
  });
});

describe("findSiteByName", () => {
  test("returns a site when it exists", async () => {
    const name = uniqueName("find");
    await createSite({ name });

    const result = await findSiteByName(name);
    expect(result).not.toBeNull();
    expect(result!.name).toBe(name);
  });

  test("returns null when site does not exist", async () => {
    const result = await findSiteByName("non-existent-site-xyz-999");
    expect(result).toBeNull();
  });
});

describe("findSitesByOwner", () => {
  test("returns sites belonging to a specific owner", async () => {
    const user = await createUser();
    await createSite({ name: uniqueName("owner-a"), owner_id: user.id });
    await createSite({ name: uniqueName("owner-b"), owner_id: user.id });

    const result = await findSitesByOwner(user.id);
    expect(result.length).toBeGreaterThanOrEqual(2);
    result.forEach((s) => expect(s.owner_id).toBe(user.id));
  });

  test("returns empty array for owner with no sites", async () => {
    const user = await createUser();
    const result = await findSitesByOwner(user.id);
    expect(result).toEqual([]);
  });

  test("returns sites ordered by created_at descending", async () => {
    const user = await createUser();
    const nameA = uniqueName("order-a");
    const nameB = uniqueName("order-b");
    await createSite({ name: nameA, owner_id: user.id });
    await createSite({ name: nameB, owner_id: user.id });

    const result = await findSitesByOwner(user.id);
    const idxB = result.findIndex((s) => s.name === nameB);
    const idxA = result.findIndex((s) => s.name === nameA);
    expect(idxB).toBeLessThan(idxA);
  });

  test("does not return sites from other owners", async () => {
    const user1 = await createUser();
    const user2 = await createUser();
    const name1 = uniqueName("iso1");
    const name2 = uniqueName("iso2");
    await createSite({ name: name1, owner_id: user1.id });
    await createSite({ name: name2, owner_id: user2.id });

    const result = await findSitesByOwner(user1.id);
    const names = result.map((s) => s.name);
    expect(names).toContain(name1);
    expect(names).not.toContain(name2);
  });
});

describe("getSiteByName", () => {
  test("returns site when it exists", async () => {
    const name = uniqueName("getbyname");
    await createSite({ name });

    const site = await getSiteByName(name);
    expect(site.name).toBe(name);
    expect(typeof site.id).toBe("number");
  });

  test("throws when site does not exist", async () => {
    await expect(
      getSiteByName("absolutely-nonexistent-site"),
    ).rejects.toThrow();
  });
});

describe("createSite (repository)", () => {
  test("creates a site and returns it", async () => {
    const user = await createUser();
    const name = uniqueName("repo-create");

    const site = await repoCreateSite(name, user.id);
    expect(site).not.toBeNull();
    expect(site!.name).toBe(name);
    expect(site!.owner_id).toBe(user.id);
    expect(typeof site!.id).toBe("number");
    expect(site!.created_at).toBeInstanceOf(Date);
  });
});
