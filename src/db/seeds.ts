import { sql } from "bun";
import { s3 } from "bun";
import { getS3Path } from "../storage";

const static_dir = `${import.meta.dir}/../static`;

const users = [
  {
    unique_id: "1234",
  },
];

const sites = [
  {
    name: "cat",
    owner_unique_id: "1234",
  },
  {
    name: "chat",
    owner_unique_id: "1234",
  },
  {
    name: "cli_simulator",
    owner_unique_id: "1234",
  },
  {
    name: "prompt_maker",
    owner_unique_id: "1234",
  },
  {
    name: "ai",
    owner_unique_id: "1234",
  },
];

const files = [
  {
    file_name: "cat.png",
    site_name: "cat",
    mimetype: "image/png",
    path: `${static_dir}/cat.png`,
  },
  {
    file_name: "index.html",
    site_name: "cat",
    mimetype: "text/html",
    path: `${static_dir}/cat.html`,
  },
  {
    file_name: "index.html",
    site_name: "chat",
    mimetype: "text/html",
    path: `${static_dir}/chat.html`,
  },
  {
    file_name: "index.html",
    site_name: "cli_simulator",
    mimetype: "text/html",
    path: `${static_dir}/cli_simulator.html`,
  },
  {
    file_name: "index.html",
    site_name: "prompt_maker",
    mimetype: "text/html",
    path: `${static_dir}/prompt_maker.html`,
  },
  {
    file_name: "index.html",
    site_name: "ai",
    mimetype: "text/html",
    path: `${static_dir}/wio-ai-demo.html`,
  },
];

export async function seed() {
  await seedUsers();
  await seedSites();
  await seedFiles();
}

async function seedUsers() {
  for (const user of users) {
    await sql`
      INSERT INTO users (unique_id) VALUES (${user.unique_id})
      ON CONFLICT (unique_id) DO NOTHING;`;
  }
}

async function seedSites() {
  for (const site of sites) {
    const [owner] = await sql<{ id: number }[]>`
      SELECT id FROM users WHERE unique_id = ${site.owner_unique_id};`;

    if (!owner) {
      console.warn(
        `Seed: user with unique_id '${site.owner_unique_id}' not found, skipping site '${site.name}'`,
      );
      continue;
    }

    await sql`
      INSERT INTO sites (name, owner_id) VALUES (${site.name}, ${owner.id})
      ON CONFLICT (name) DO NOTHING;`;
  }
}

async function seedFiles() {
  for (const file of files) {
    const [site] = await sql<{ id: number; name: string }[]>`
      SELECT id, name FROM sites WHERE name = ${file.site_name};`;

    if (!site) {
      console.warn(
        `Seed: site with name '${file.site_name}' not found, skipping file '${file.file_name}'`,
      );
      continue;
    }

    // Upload file to S3
    const s3Path = getS3Path(site.name, file.file_name);
    const file_s3 = s3.file(s3Path);
    const file_bytes = await Bun.file(file.path).arrayBuffer();
    await file_s3.write(file_bytes, { type: file.mimetype });

    await sql`
      INSERT INTO site_files (site_id, s3_path, file_name)
      VALUES (${site.id}, ${s3Path}, ${file.file_name})
      ON CONFLICT (s3_path) DO NOTHING;`;
  }
}
