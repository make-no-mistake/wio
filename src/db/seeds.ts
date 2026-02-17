import { sql } from "bun";

export async function seed() {
  const users = [{ unique_id: "example-user" }];

  const [user] = await sql<{ id: number; unique_id: string }[]>`
    INSERT INTO users ${sql(users)}
    ON CONFLICT (unique_id)
    DO UPDATE SET unique_id = EXCLUDED.unique_id
    RETURNING id, unique_id;`;

  const sites = [{ name: `${user!.id}_mysite`, owner_id: user!.id }];

  const [site] = await sql<{ name: string; id: number }[]>`
    INSERT INTO sites ${sql(sites)}
    ON CONFLICT DO NOTHING
    RETURNING name, id;`;

  const siteFiles = [
    {
      site_id: site!.id,
      s3_path: `${site!.name}/cat.png`,
      file_name: "cat",
      mimetype: "image/png",
    },
  ];

  await sql`
    INSERT INTO site_files ${sql(siteFiles)}
    ON CONFLICT DO NOTHING;`;
}
