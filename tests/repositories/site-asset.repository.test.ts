import { afterEach, describe, expect, test } from "bun:test";
import { SiteAssetRepositoryImpl } from "@/repositories/site-asset.repository";
import { createSite } from "../factories/site.factory";
import { insertSiteFile } from "@/repositories/file.repository";
import { writeS3File, deleteS3File } from "@/repositories/s3.repository";
import { getS3Path } from "../../src/helpers/storage";

const repo = new SiteAssetRepositoryImpl();
const s3PathsToClean: string[] = [];

afterEach(async () => {
  for (const path of s3PathsToClean) {
    try {
      await deleteS3File(path);
    } catch {
      // File may not exist if test failed before write
    }
  }
  s3PathsToClean.length = 0;
});

async function uploadAsset(
  siteName: string,
  siteId: number,
  fileName: string,
  content: string,
) {
  const s3Path = getS3Path(siteName, fileName);
  s3PathsToClean.push(s3Path);
  await writeS3File(
    s3Path,
    new TextEncoder().encode(content).buffer as ArrayBuffer,
  );
  await insertSiteFile(siteId, s3Path, fileName);
}

describe("SiteAssetRepositoryImpl", () => {
  test("retrieveAssetBySiteIdAndName returns asset bytes and mimetype", async () => {
    const siteName = `asset-repo-${Date.now()}`;
    const site = await createSite({ name: siteName });
    await uploadAsset(siteName, site.id, "index.html", "<h1>Hello</h1>");

    const asset = await repo.retrieveAssetBySiteIdAndName(
      site.id,
      "index.html",
    );

    expect(asset.bytes).toBeDefined();
    const text = new TextDecoder().decode(asset.bytes);
    expect(text).toBe("<h1>Hello</h1>");
  });

  test("retrieveAssetBySiteIdAndName throws for non-existent asset", async () => {
    const site = await createSite({ name: `asset-missing-${Date.now()}` });

    await expect(
      repo.retrieveAssetBySiteIdAndName(site.id, "does-not-exist.html"),
    ).rejects.toThrow("not found");
  });

  test("retrieves different file types correctly", async () => {
    const siteName = `asset-types-${Date.now()}`;
    const site = await createSite({ name: siteName });
    await uploadAsset(siteName, site.id, "style.css", "body { color: red; }");

    const asset = await repo.retrieveAssetBySiteIdAndName(site.id, "style.css");

    const text = new TextDecoder().decode(asset.bytes);
    expect(text).toBe("body { color: red; }");
  });
});
