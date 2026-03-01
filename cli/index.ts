#!/usr/bin/env bun
import { exists, mkdir, readFile, writeFile } from "fs/promises";
import { parseArgs } from "util";
import { YAML } from "bun";

const API_URL = "https://wio.onl";
const MAX_ARCHIVE_SIZE = 50 * 1024 * 1024;

const { positionals } = parseArgs({
  args: Bun.argv,
  allowPositionals: true,
});

if (positionals.length === 0) {
  console.error("No command provided");
  process.exit(1);
}

const last = positionals[positionals.length - 1];
const second_last = positionals[positionals.length - 2];

// Handle push command
if (last === "push") {
  const cwd = process.cwd();

  if (!(await exists(`${cwd}/wio.yaml`))) {
    console.error("No wio.yaml file found");
    process.exit(1);
  }

  const wio_yaml_config = await readFile(`${cwd}/wio.yaml`);
  const config = YAML.parse(wio_yaml_config.toString()) as { name: string };

  if (!config.name) {
    console.error("No name found in wio.yaml");
    process.exit(1);
  }

  const project_name = config.name;

  console.log(`Pushing ${project_name} to remote...`);
  console.log(`Scanning project files...`);

  // Scan for all files in the project directory
  const glob = new Bun.Glob("**/*");
  const files: Record<string, ArrayBuffer> = {};

  for await (const path of glob.scan({ cwd, onlyFiles: true })) {
    files[path] = await Bun.file(`${cwd}/${path}`).arrayBuffer();
  }

  const archive = new Bun.Archive(files, { compress: "gzip", level: 9 });
  const blob = await archive.blob();

  if (blob.size > MAX_ARCHIVE_SIZE) {
    console.error(
      `Archive exceeds the ${MAX_ARCHIVE_SIZE / 1024 / 1024} MB limit`,
    );
    process.exit(1);
  }

  console.log(`Sending to server...`);

  const formData = new FormData();
  formData.append("name", project_name);
  formData.append("archive", blob, `${project_name}.tar.gz`);

  try {
    const response = await fetch(`${API_URL}/api/site`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error(`Server error: ${response.status} ${response.statusText}`);
      process.exit(1);
    }

    const result = await response.json();
    console.log("Push successful!", result);
  } catch (err) {
    console.error("Failed to connect to server:", (err as Error).message);
    process.exit(1);
  }

  process.exit(0);
}

// Handle init command
if (second_last === "init") {
  const project_name = last;

  console.log(`Initializing project ${project_name}...`);

  if (await exists(`${project_name}`)) {
    console.error(`Project ${project_name} already exists`);
    process.exit(1);
  }

  await mkdir(`${project_name}`);

  const agents_md = await readFile(`${import.meta.dir}/AGENTS.sample.md`);

  await writeFile(`${project_name}/AGENTS.md`, agents_md);

  const wio_yaml_content = `name: ${project_name}
    `;

  await writeFile(`${project_name}/wio.yaml`, wio_yaml_content);
  process.exit(0);
}

console.log(`Commands:`);
console.log(`  init <project_name> - Initialize a new project`);
console.log(`  push - Push current project to remote`);
process.exit(0);
