import { expect, test } from "bun:test";
import { extractLowestLevelDomain } from "../../src/hooks/setSiteOrDie";

test("production domain", () => {
  expect(extractLowestLevelDomain("hi.wio.dev")).toBe("hi");
});

test("local domain", () => {
  expect(extractLowestLevelDomain("hi.localhost:3000")).toBe("hi");
});

test("local numeric domain", () => {
  expect(extractLowestLevelDomain("hi.127.0.0.1:3000")).toBe("hi");
});

test("no subdomain", () => {
  expect(extractLowestLevelDomain("localhost:3000")).toBeUndefined();
});

test("local numeric domain", () => {
  expect(extractLowestLevelDomain("0.0.0.0:3000")).toBeUndefined();
});

test("no domain", () => {
  expect(extractLowestLevelDomain("")).toBeUndefined();
});
