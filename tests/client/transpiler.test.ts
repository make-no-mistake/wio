import { describe, expect, test } from "bun:test";
import { transpileSDK } from "../../src/client/transpiler";

describe("transpileSDK", () => {
  test("successfully compiles the SDK", async () => {
    const result = await transpileSDK();

    expect(result.success).toBe(true);
    expect(result.body).toBeDefined();
    expect(result.body).toBeTypeOf("string");
    expect(result.body!.length).toBeGreaterThan(0);
    expect(result.error).toBeUndefined();
  });
});
