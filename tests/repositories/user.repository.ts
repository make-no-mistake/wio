import { createUser } from "../factories/user.factory";
import { findUserByTag } from "../../src/repositories/user.repository";
import { describe, expect, test } from "bun:test";

describe("findUserByTag", () => {
  test("returns a created user", async () => {
    const user = await createUser();
    const found = await findUserByTag(user.tag);

    expect(found?.tag).toBe(user.tag);
  });
});
