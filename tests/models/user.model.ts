import { createUser } from "../factories/user.factory";
import { findUserByUniqueId } from "../../src/models/user.model";
import { describe, expect, test } from "bun:test";

describe("findUserByUniqueId", () => {
  test("returns a created user", async () => {
    const user = await createUser();
    const found = await findUserByUniqueId(user.unique_id);

    expect(found?.unique_id).toBe(user.unique_id);
  });
});
