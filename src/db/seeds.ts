import { sql } from "bun";
import { s3 } from "bun";
import { getS3Path } from "../helpers/storage";

const static_dir = `${import.meta.dir}/../static`;

const users = [
  {
    tag: "1234",
  },
];

const sites = [
  {
    name: "cat",
    owner_tag: "1234",
  },
  {
    name: "chat",
    owner_tag: "1234",
  },
  {
    name: "cli_simulator",
    owner_tag: "1234",
  },
  {
    name: "prompt_maker",
    owner_tag: "1234",
  },
  {
    name: "ai",
    owner_tag: "1234",
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

const global_sounds = [
  {
    file_name: "pop.mp3",
    mimetype: "audio/mpeg",
    path: `${static_dir}/sounds/pop.mp3`,
  },
  {
    file_name: "fart.mp3",
    mimetype: "audio/mpeg",
    path: `${static_dir}/sounds/fart.mp3`,
  },
];

const relations = [
  {
    site_name: "cat",
    relation_name: "comments",
    data: {
      post_title: "My First Cat",
      text: "Great post!",
      commenter: "user1",
    },
  },
  {
    site_name: "chat",
    relation_name: "messages",
    data: {
      sender: "user1",
      content: "Hello, world!",
      timestamp: "2026-01-15T10:30:00Z",
    },
  },
  {
    site_name: "chat",
    relation_name: "messages",
    data: {
      sender: "user2",
      content: "Hey! How are you?",
      timestamp: "2026-01-15T10:31:00Z",
    },
  },
  {
    site_name: "chat",
    relation_name: "channels",
    data: { name: "general", description: "General discussion channel" },
  },
];

export async function seed() {
  await seedUsers();
  await seedSites();
  await seedFiles();
  await seedGlobalSounds();
  await seedRelations();
}

async function seedUsers() {
  for (const user of users) {
    await sql`
      INSERT INTO users (tag) VALUES (${user.tag})
      ON CONFLICT (tag) DO NOTHING;`;
  }
}

async function seedSites() {
  for (const site of sites) {
    const [owner] = await sql<{ id: number }[]>`
      SELECT id FROM users WHERE tag = ${site.owner_tag};`;

    if (!owner) {
      console.warn(
        `Seed: user with tag '${site.owner_tag}' not found, skipping site '${site.name}'`,
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

async function seedRelations() {
  for (const relation of relations) {
    const [site] = await sql<{ id: number }[]>`
      SELECT id FROM sites WHERE name = ${relation.site_name};`;

    if (!site) {
      console.warn(
        `Seed: site with name '${relation.site_name}' not found, skipping relation '${relation.relation_name}'`,
      );
      continue;
    }

    await sql`
      INSERT INTO relations (site_id, relation_name, data)
      VALUES (${site.id}, ${relation.relation_name}, ${relation.data}::jsonb)
      ON CONFLICT DO NOTHING;`;
  }
}

async function seedGlobalSounds() {
  for (const file of global_sounds) {
    const s3Path = `sounds/${file.file_name}`;
    const file_s3 = s3.file(s3Path);
    const file_bytes = await Bun.file(file.path).arrayBuffer();
    await file_s3.write(file_bytes, { type: file.mimetype });
  }
}
