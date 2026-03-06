#!/usr/bin/env bun
import { exists, mkdir, readFile, writeFile } from "fs/promises";
import { parseArgs } from "util";
import {
  CONFIG_FILE_NAME,
  readWioConfig,
  writeWioConfig,
} from "./helpers/config";
import { fetchWithAuth } from "./helpers/authentication";

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
const cwd = process.cwd();

// Handle login command
if (second_last === "login") {
  const tag = last?.trim();
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tag }),
  });

  if (!response.ok) {
    console.error("Unauthorized: user tag not recognized");
    process.exit(1);
  }

  const body = (await response.json()) as { token?: string };
  const config = await readWioConfig();
  config.auth = {
    ...(config.auth ?? {}),
    token: body.token,
  };
  await writeWioConfig(config);
  console.log(`Login successful. Token saved to ${CONFIG_FILE_NAME}.`);

  process.exit(0);
}

// Handle push command
if (last === "push") {
  const config = await readWioConfig();
  if (!config.name) {
    console.error(`No name found in ${CONFIG_FILE_NAME}`);
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
    const response = await fetchWithAuth(`${API_URL}/api/site`, {
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

  await writeFile(`${project_name}/${CONFIG_FILE_NAME}`, wio_yaml_content);
  console.log(`Project ${project_name} initialized successfully!`);
  process.exit(0);
}

console.log(`Commands:`);
console.log(`  init <project_name> - Initialize a new project`);
console.log(`  push - Push current project to remote`);
console.log(`  login <user-tag> - Authenticate and store token in wio.yaml`);
process.exit(0);
