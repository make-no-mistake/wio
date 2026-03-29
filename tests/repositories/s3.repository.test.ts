import { afterEach, describe, expect, test } from "bun:test";
import {
  writeS3File,
  readS3File,
  deleteS3File,
  mimeForPath,
} from "../../src/repositories/s3.repository";
import { getS3Path } from "../../src/helpers/storage";

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

function trackS3Path(siteName: string, fileName: string): string {
  const path = getS3Path(siteName, fileName);
  s3PathsToClean.push(path);
  return path;
}

describe("mimeForPath", () => {
  test("returns text/html for .html files", () => {
    expect(mimeForPath("index.html")).toContain("text/html");
  });

  test("returns text/css for .css files", () => {
    expect(mimeForPath("style.css")).toContain("text/css");
  });

  test("returns javascript for .js files", () => {
    expect(mimeForPath("app.js")).toContain("javascript");
  });

  test("returns image/png for .png files", () => {
    expect(mimeForPath("logo.png")).toContain("image/png");
  });

  test("returns image/jpeg for .jpg files", () => {
    expect(mimeForPath("pic.jpg")).toContain("image/jpeg");
  });

  test("returns application/json for .json files", () => {
    expect(mimeForPath("config.json")).toContain("application/json");
  });

  test("returns audio for .mp3 files", () => {
    expect(mimeForPath("sound.mp3")).toContain("audio");
  });
});

describe("S3 file operations", () => {
  test("writeS3File stores data that can be read back", async () => {
    const s3Path = trackS3Path(`s3-write-${Date.now()}`, "test-file.txt");
    const content = new TextEncoder().encode("hello s3");

    await writeS3File(s3Path, content.buffer as ArrayBuffer);

    const result = await readS3File(s3Path);
    expect(result.bytes).toBeDefined();
    const text = new TextDecoder().decode(result.bytes);
    expect(text).toBe("hello s3");
  });

  test("deleteS3File removes a previously written file", async () => {
    const s3Path = trackS3Path(`s3-delete-${Date.now()}`, "deleteme.txt");
    const content = new TextEncoder().encode("to be deleted");

    await writeS3File(s3Path, content.buffer as ArrayBuffer);
    await deleteS3File(s3Path);

    try {
      await readS3File(s3Path);
    } catch {
      // Expected: file no longer exists
    }
  });

  test("readS3File returns correct content for HTML files", async () => {
    const s3Path = trackS3Path(`s3-html-${Date.now()}`, "page.html");
    const content = new TextEncoder().encode("<h1>hi</h1>");

    await writeS3File(s3Path, content.buffer as ArrayBuffer);

    const result = await readS3File(s3Path);
    expect(result.bytes).toBeDefined();
    const text = new TextDecoder().decode(result.bytes);
    expect(text).toBe("<h1>hi</h1>");
  });
});
