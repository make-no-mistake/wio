#!/usr/bin/env bun
import { exists, mkdir, readFile, writeFile } from "fs/promises";
import { parseArgs } from "util";
import {
  CONFIG_FILE_NAME,
  readWioConfig,
  writeWioConfig,
} from "./helpers/config";
import { fetchWithAuth } from "./helpers/authentication";
import { Colours, pp } from "./helpers/pretty_print";

const API_URL = "https://wio.onl";
const MAX_ARCHIVE_SIZE = 50 * 1024 * 1024;

const { positionals } = parseArgs({
  args: Bun.argv,
  allowPositionals: true,
});

const printError = (text: string) => pp({ text, colour: Colours.Red });
const printSuccess = (text: string) => pp({ text, colour: Colours.Green });
const printInfo = (text: string) => pp({ text, colour: Colours.Gray });

if (positionals.length === 0) {
  printError("No command provided");
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
    printError("Unauthorized: user tag not recognized");
    process.exit(1);
  }

  const body = (await response.json()) as { token?: string };
  const config = await readWioConfig();
  config.auth = {
    ...(config.auth ?? {}),
    token: body.token,
  };
  await writeWioConfig(config);
  printSuccess(`Login successful. Token saved to ${CONFIG_FILE_NAME}.`);

  process.exit(0);
}

// Handle push command
if (last === "push") {
  const config = await readWioConfig();
  if (!config.name) {
    printError(`No name found in ${CONFIG_FILE_NAME}`);
    process.exit(1);
  }

  const project_name = config.name;

  printInfo(`Pushing ${project_name} to remote...`);
  printInfo(`Scanning project files...`);

  // Scan for all files in the project directory
  const glob = new Bun.Glob("**/*");
  const files: Record<string, ArrayBuffer> = {};

  for await (const path of glob.scan({ cwd, onlyFiles: true })) {
    files[path] = await Bun.file(`${cwd}/${path}`).arrayBuffer();
  }

  const archive = new Bun.Archive(files, { compress: "gzip", level: 9 });
  const blob = await archive.blob();

  if (blob.size > MAX_ARCHIVE_SIZE) {
    printError(
      `Archive exceeds the ${MAX_ARCHIVE_SIZE / 1024 / 1024} MB limit`,
    );
    process.exit(1);
  }

  printInfo(`Sending to server...`);

  const formData = new FormData();
  formData.append("name", project_name);
  formData.append("archive", blob, `${project_name}.tar.gz`);

  try {
    const response = await fetchWithAuth(`${API_URL}/api/site`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      printError(`Server error: ${response.status} ${response.statusText}`);
      process.exit(1);
    }

    const result = await response.json();
    printSuccess(`Push successful! ${JSON.stringify(result)}`);
  } catch (err) {
    printError(`Failed to connect to server: ${(err as Error).message}`);
    process.exit(1);
  }

  process.exit(0);
}

// Handle init command
if (second_last === "init") {
  const project_name = last;

  printInfo(`Initializing project ${project_name}...`);

  if (await exists(`${project_name}`)) {
    printError(`Project ${project_name} already exists`);
    process.exit(1);
  }

  await mkdir(`${project_name}`);

  const agents_md = await readFile(`${import.meta.dir}/AGENTS.sample.md`);

  await writeFile(`${project_name}/AGENTS.md`, agents_md);

  const wio_yaml_content = `name: ${project_name}
    `;

  await writeFile(`${project_name}/${CONFIG_FILE_NAME}`, wio_yaml_content);
  printSuccess(`Project ${project_name} initialized successfully!`);
  process.exit(0);
}

printInfo(`Commands:`);
printInfo(`  init <project_name> - Initialize a new project`);
printInfo(`  push - Push current project to remote`);
printInfo(`  login <user-tag> - Authenticate and store token in wio.yaml`);
process.exit(0);
