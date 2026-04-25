import { describe, expect, it } from "bun:test";
import { appAndSiteSpaceSwitch } from "@/callbacks/app-and-site-space-switch";
import type { IncomingMessage } from "node:http";

function createMockRequest(
  host: string,
  url: string,
): IncomingMessage & { __wioSite?: string } {
  return {
    headers: { host },
    url,
  } as IncomingMessage & { __wioSite?: string };
}

describe("appAndSiteSpaceSwitch", () => {
  describe("normal requests", () => {
    it("should rewrite subdomain requests to /sites/:site/path", () => {
      const req = createMockRequest("mysite.wio.onl", "/index.html");
      const result = appAndSiteSpaceSwitch(req);
      expect(result).toBe("/sites/mysite/index.html");
    });

    it("should rewrite root path correctly", () => {
      const req = createMockRequest("test.wio.onl", "/");
      const result = appAndSiteSpaceSwitch(req);
      expect(result).toBe("/sites/test/");
    });

    it("should handle nested paths", () => {
      const req = createMockRequest("demo.lvh.me", "/assets/style.css");
      const result = appAndSiteSpaceSwitch(req);
      expect(result).toBe("/sites/demo/assets/style.css");
    });

    it("should not rewrite when no subdomain exists", () => {
      const req = createMockRequest("wio.onl", "/dashboard");
      const result = appAndSiteSpaceSwitch(req);
      expect(result).toBe("/dashboard");
    });

    it("should not rewrite platform static paths on subdomains", () => {
      const req = createMockRequest(
        "mysite.wio.onl",
        "/static/views/errors/404.html",
      );
      const result = appAndSiteSpaceSwitch(req);
      expect(result).toBe("/static/views/errors/404.html");
    });
  });

  describe("edge cases", () => {
    it("should handle missing URL", () => {
      const req = {
        headers: { host: "test.wio.onl" },
        url: undefined,
      } as unknown as IncomingMessage;
      const result = appAndSiteSpaceSwitch(req);
      expect(result).toBe("/sites/test/");
    });

    it("should handle localhost without subdomain", () => {
      const req = createMockRequest("localhost:3000", "/api/health");
      const result = appAndSiteSpaceSwitch(req);
      expect(result).toBe("/api/health");
    });
  });
});
