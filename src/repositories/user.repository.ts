import { sql } from "bun";

export interface User {
  id: number;
  unique_id: string;
  created_at: Date;
}

export async function findUserByUniqueId(
  unique_id: string,
): Promise<User | null> {
  const result = await sql<User[]>`
    SELECT *
    FROM users
    WHERE unique_id = ${unique_id};`;

  return result[0] ?? null;
}

export async function createUser(unique_id: string): Promise<User | null> {
  const result = await sql<User[]>`
    INSERT INTO users (unique_id)
    VALUES (${unique_id})
    ON CONFLICT (unique_id) DO NOTHING
    RETURNING id, unique_id, created_at;
  `;

  return result[0] ?? null;
}
