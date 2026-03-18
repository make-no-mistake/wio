import { describe, expect, test } from "bun:test";
import { mimeForPath } from "../../src/repositories/s3.repository";

describe("mimeForPath", () => {
  test("returns correct MIME type for common web extensions", () => {
    expect(mimeForPath("site/index.html")).toBe("text/html;charset=utf-8");
    expect(mimeForPath("site/style.css")).toBe("text/css;charset=utf-8");
    expect(mimeForPath("site/app.js")).toBe("text/javascript;charset=utf-8");
    expect(mimeForPath("site/app.mjs")).toBe("text/javascript;charset=utf-8");
    expect(mimeForPath("site/data.json")).toBe(
      "application/json;charset=utf-8",
    );
  });

  test("returns correct MIME type for image extensions", () => {
    expect(mimeForPath("logo.png")).toBe("image/png");
    expect(mimeForPath("photo.jpg")).toBe("image/jpeg");
    expect(mimeForPath("photo.jpeg")).toBe("image/jpeg");
    expect(mimeForPath("anim.gif")).toBe("image/gif");
    expect(mimeForPath("icon.svg")).toBe("image/svg+xml");
    expect(mimeForPath("favicon.ico")).toBe("image/x-icon");
    expect(mimeForPath("hero.webp")).toBe("image/webp");
  });

  test("returns correct MIME type for font extensions", () => {
    expect(mimeForPath("font.woff")).toBe("font/woff");
    expect(mimeForPath("font.woff2")).toBe("font/woff2");
  });

  test("is case-insensitive", () => {
    expect(mimeForPath("APP.JS")).toBe("text/javascript;charset=utf-8");
    expect(mimeForPath("Style.CSS")).toBe("text/css;charset=utf-8");
    expect(mimeForPath("INDEX.HTML")).toBe("text/html;charset=utf-8");
  });

  test("returns application/octet-stream for files with no extension", () => {
    expect(mimeForPath("Makefile")).toBe("application/octet-stream");
    expect(mimeForPath("LICENSE")).toBe("application/octet-stream");
  });
});
