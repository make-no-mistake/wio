import { sql } from "bun";

let userCounter = 1;

interface UserOverrides {
  tag?: string;
}

export async function createUser(overrides: UserOverrides = {}) {
  const tag = overrides.tag ?? `test-user-${userCounter++}`;

  const result = await sql`
    INSERT INTO users (tag)
    VALUES (${tag})
    RETURNING id, tag, created_at;`;

  return result[0];
}
