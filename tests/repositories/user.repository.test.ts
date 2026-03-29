import { describe, expect, test } from "bun:test";
import {
  findUserByTag,
  createUser,
} from "../../src/repositories/user.repository";

describe("findUserByTag", () => {
  test("returns null for non-existent tag", async () => {
    const result = await findUserByTag("non-existent-tag-xyz-999");
    expect(result).toBeNull();
  });

  test("finds an existing user by tag", async () => {
    const tag = `repo-test-find-${Date.now()}`;
    await createUser(tag);

    const result = await findUserByTag(tag);
    expect(result).not.toBeNull();
    expect(result!.tag).toBe(tag);
    expect(typeof result!.id).toBe("number");
    expect(result!.created_at).toBeInstanceOf(Date);
  });
});

describe("createUser", () => {
  test("creates a user and returns it", async () => {
    const tag = `repo-test-create-${Date.now()}`;
    const result = await createUser(tag);

    expect(result).not.toBeNull();
    expect(result!.tag).toBe(tag);
    expect(typeof result!.id).toBe("number");
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  test("returns null on duplicate tag (ON CONFLICT DO NOTHING)", async () => {
    const tag = `repo-test-dup-${Date.now()}`;
    const first = await createUser(tag);
    expect(first).not.toBeNull();

    const second = await createUser(tag);
    expect(second).toBeNull();
  });
});
