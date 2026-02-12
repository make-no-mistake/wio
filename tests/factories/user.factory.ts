import { sql } from "bun";

let userCounter = 1;

interface UserOverrides {
  unique_id?: string;
}

export async function createUser(overrides: UserOverrides = {}) {
  const unique_id = overrides.unique_id ?? `test-user-${userCounter++}`;

  const result = await sql`
    INSERT INTO users (unique_id)
    VALUES (${unique_id})
    RETURNING id, unique_id, created_at;`;

  return result[0];
}
