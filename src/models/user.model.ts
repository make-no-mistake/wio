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
    FROM Users
    WHERE unique_id = ${unique_id};`;

  return result[0] ?? null;
}
