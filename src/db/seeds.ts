import { sql } from "bun";

export async function seed() {
  await sql`
      DELETE FROM site_assets`;

  await sql`
      INSERT INTO site_assets (site_id, filename)
      VALUES ('example', 'example.txt')`;

  await sql`
      INSERT INTO site_assets (site_id, filename)
      VALUES ('example', 'cat.png')`;
}
