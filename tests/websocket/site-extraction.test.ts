import { describe, expect, it } from "bun:test";
import { extractLowestLevelDomain } from "@/helpers/extract-lowest-level-domain";

describe("extractLowestLevelDomain (websocket logic)", () => {
  describe("valid hostnames", () => {
    it("should extract site from subdomain.lvh.me", () => {
      expect(extractLowestLevelDomain("mysite.lvh.me")).toBe("mysite");
    });

    it("should extract site from subdomain.lvh.me:3000", () => {
      expect(extractLowestLevelDomain("mysite.lvh.me:3000")).toBe("mysite");
    });

    it("should extract site from subdomain.wio.onl", () => {
      expect(extractLowestLevelDomain("test.wio.onl")).toBe("test");
    });

    it("should handle hyphenated site names", () => {
      expect(extractLowestLevelDomain("my-site.wio.onl")).toBe("my-site");
    });
  });

  describe("invalid hostnames", () => {
    it("should return undefined for localhost", () => {
      expect(extractLowestLevelDomain("localhost")).toBe(undefined);
    });

    it("should return undefined for www subdomain", () => {
      expect(extractLowestLevelDomain("www.wio.onl")).toBe(undefined);
    });

    it("should return undefined for single-part hostname", () => {
      expect(extractLowestLevelDomain("localhost:3000")).toBe(undefined);
    });

    it("should return undefined for IP addresses", () => {
      expect(extractLowestLevelDomain("127.0.0.1")).toBe(undefined);
      expect(extractLowestLevelDomain("0.0.0.0")).toBe(undefined);
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      expect(extractLowestLevelDomain("")).toBe(undefined);
    });

    it("should handle port-only input", () => {
      expect(extractLowestLevelDomain(":3000")).toBe(undefined);
    });
  });
});
