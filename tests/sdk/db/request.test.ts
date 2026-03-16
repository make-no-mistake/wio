import { describe, expect, test } from "bun:test";
import { request, setFetch } from "../../../src/sdk/db/request";
import type { Payload } from "../../../src/sdk/db/payload";

describe("db request", () => {
  test("throws on unknown payload type", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => request("test", {} as any)).toThrow("Unknown payload type");
  });

  test("select request throws on error response", async () => {
    setFetch(async () => {
      return {
        ok: false,
        status: 400,
        json: async () => ({ error: "Select failed intentionally" }),
      } as Response;
    });

    await expect(request("test", { select: ["name"] })).rejects.toThrow(
      "Select failed intentionally",
    );
  });

  test("select request throws default error when JSON fails", async () => {
    setFetch(async () => {
      return {
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("JSON parse error");
        },
      } as Response;
    });

    await expect(request("test", { select: ["name"] })).rejects.toThrow(
      "Select failed (500)",
    );
  });

  test("mutation request throws on error response", async () => {
    setFetch(async () => {
      return {
        ok: false,
        status: 400,
        json: async () => ({ error: "Mutation failed intentionally" }),
      } as Response;
    });

    await expect(request("test", { data: { foo: "bar" } })).rejects.toThrow(
      "Mutation failed intentionally",
    );
  });

  test("mutation request (update) throws on mismatched arrays", async () => {
    setFetch(async () => {
      return {
        ok: true,
        json: async () => ({ success: true, records: [] }),
      } as Response;
    });

    await expect(
      request("test", {
        id: [1, 2],
        data: { foo: "bar" },
      } as unknown as Payload<unknown>),
    ).rejects.toThrow("Mismatched id and data arrays in update payload");

    // Test the branch where one is array and other isn't

    await expect(
      request("test", {
        id: 1,
        data: [{ foo: "bar" }],
      } as unknown as Payload<unknown>),
    ).rejects.toThrow("Mismatched id and data arrays in update payload");
  });

  test("delete request throws on error response", async () => {
    setFetch(async () => {
      return {
        ok: false,
        status: 400,
        json: async () => ({ error: "Delete failed intentionally" }),
      } as Response;
    });

    await expect(request("test", { ids: [1, 2] })).rejects.toThrow(
      "Delete failed intentionally",
    );
  });

  test("delete request throws default error when JSON fails", async () => {
    setFetch(async () => {
      return {
        ok: false,
        status: 404,
        json: async () => {
          throw new Error("JSON parse error");
        },
      } as Response;
    });

    await expect(request("test", { ids: [1, 2] })).rejects.toThrow(
      "Delete failed (404)",
    );
  });
});
