import { sql } from "bun";

export interface User {
  id: number;
  tag: string;
  created_at: Date;
}

export async function findUserByTag(tag: string): Promise<User | null> {
  const result = await sql<User[]>`
    SELECT *
    FROM users
    WHERE tag = ${tag};`;

  return result[0] ?? null;
}

export async function createUser(tag: string): Promise<User | null> {
  const result = await sql<User[]>`
    INSERT INTO users (tag)
    VALUES (${tag})
    ON CONFLICT (tag) DO NOTHING
    RETURNING id, tag, created_at;
  `;

  return result[0] ?? null;
}
