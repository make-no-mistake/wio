import { s3 } from "bun";
import { readFile } from "node:fs/promises";

export async function initStorage() {
  await seedMinio();
}

async function seedMinio() {
  const example = s3.file(`site_assets/example/example.txt`);
  await example.write("Example text file for example site.", {
    type: "text/plain",
  });

  const cat = s3.file(`site_assets/example/cat.png`);
  const cat_bytes = await readFile(`${import.meta.dir}/static/cat.png`);
  await cat.write(cat_bytes, { type: "image/png" });
}
