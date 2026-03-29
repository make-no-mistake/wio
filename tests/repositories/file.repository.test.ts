import { describe, expect, test } from "bun:test";
import {
  insertSiteFile,
  getSiteFiles,
  clearSiteFiles,
  getSiteFileByName,
} from "../../src/repositories/file.repository";
import { createSite } from "../factories/site.factory";

function uniqueName(label: string) {
  return `file-repo-${label}-${Date.now()}`;
}

describe("file.repository", () => {
  test("insertSiteFile creates a file record", async () => {
    const site = await createSite({ name: uniqueName("insert") });

    const file = await insertSiteFile(site.id, "s3/test.html", "test.html");
    expect(file).not.toBeNull();
    expect(file!.site_id).toBe(site.id);
    expect(file!.s3_path).toBe("s3/test.html");
    expect(file!.file_name).toBe("test.html");
    expect(typeof file!.id).toBe("number");
  });

  test("getSiteFiles returns inserted files", async () => {
    const site = await createSite({ name: uniqueName("get") });

    await insertSiteFile(site.id, "s3/a.html", "a.html");
    await insertSiteFile(site.id, "s3/b.css", "b.css");

    const files = await getSiteFiles(site.id);
    expect(files.length).toBe(2);

    const names = files.map((f) => f.file_name);
    expect(names).toContain("a.html");
    expect(names).toContain("b.css");
  });

  test("getSiteFiles returns empty array for site with no files", async () => {
    const site = await createSite({ name: uniqueName("empty") });
    const files = await getSiteFiles(site.id);
    expect(files).toEqual([]);
  });

  test("clearSiteFiles removes all files for a site", async () => {
    const site = await createSite({ name: uniqueName("clear") });

    await insertSiteFile(site.id, "s3/x.html", "x.html");
    await insertSiteFile(site.id, "s3/y.js", "y.js");

    let files = await getSiteFiles(site.id);
    expect(files.length).toBe(2);

    await clearSiteFiles(site.id);

    files = await getSiteFiles(site.id);
    expect(files.length).toBe(0);
  });

  test("clearSiteFiles does not affect other sites", async () => {
    const site1 = await createSite({ name: uniqueName("iso1") });
    const site2 = await createSite({ name: uniqueName("iso2") });

    await insertSiteFile(site1.id, "s3/site1.html", "site1.html");
    await insertSiteFile(site2.id, "s3/site2.html", "site2.html");

    await clearSiteFiles(site1.id);

    const files1 = await getSiteFiles(site1.id);
    const files2 = await getSiteFiles(site2.id);
    expect(files1.length).toBe(0);
    expect(files2.length).toBe(1);
  });

  test("getSiteFileByName returns the correct file", async () => {
    const site = await createSite({ name: uniqueName("byname") });
    await insertSiteFile(site.id, "s3/index.html", "index.html");
    await insertSiteFile(site.id, "s3/style.css", "style.css");

    const file = await getSiteFileByName(site.id, "style.css");
    expect(file).not.toBeNull();
    expect(file!.file_name).toBe("style.css");
    expect(file!.s3_path).toBe("s3/style.css");
  });

  test("getSiteFileByName returns null for non-existent file", async () => {
    const site = await createSite({ name: uniqueName("nofile") });

    const file = await getSiteFileByName(site.id, "nope.txt");
    expect(file).toBeNull();
  });
});
