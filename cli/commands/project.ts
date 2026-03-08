import { exists, mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { YAML } from "bun";
import {
  printError,
  printInfo,
  printSuccess,
  c,
} from "../helpers/pretty_print";
import { describeError, formatError, getErrnoCode } from "../helpers/errors";
import {
  readWioConfig,
  CONFIG_FILE_NAME,
  type WioConfig,
} from "../helpers/config";
import { fetchWithAuth } from "../helpers/authentication";
import { validateProjectName, getBaseName } from "../helpers/utils";
import { styledInput } from "../helpers/input";
import { API_URL, MAX_ARCHIVE_SIZE } from "../helpers/constants";

export async function runInit(args: string[]): Promise<void> {
  let projectName = args.find((a) => !a.startsWith("-")) ?? "";

  if (!projectName) {
    if (process.stdin.isTTY) {
      projectName = await styledInput("", { message: "Project name" });
      if (!projectName) {
        printError("Error: project name is required");
        process.exit(1);
      }
    } else {
      printError("Error: project name is required");
      printError("Usage: wio init <projectName>");
      process.exit(1);
    }
  }

  const validationError = validateProjectName(projectName);
  if (validationError) {
    printError(`Error: ${validationError}`);
    process.exit(1);
  }

  const cwd = process.cwd();
  const useCurrentDir = projectName === ".";
  const targetDir = useCurrentDir ? cwd : projectName;
  const displayName = useCurrentDir
    ? getBaseName(cwd) || "project"
    : projectName;

  try {
    if (useCurrentDir) {
      if (await exists(`${cwd}/${CONFIG_FILE_NAME}`)) {
        printError(
          `Error: ${CONFIG_FILE_NAME} already exists in this directory`,
        );
        process.exit(1);
      }
    } else {
      if (await exists(projectName)) {
        printError(`Project ${projectName} already exists`);
        process.exit(1);
      }
      await mkdir(projectName);
    }

    const agents_md = await readFile(`${import.meta.dir}/../AGENTS.sample.md`);
    await writeFile(`${targetDir}/AGENTS.md`, agents_md);

    const config: WioConfig = { name: displayName };
    await writeFile(
      `${targetDir}/${CONFIG_FILE_NAME}`,
      YAML.stringify(config, null, 2),
    );

    const projectPath = useCurrentDir ? cwd : join(cwd, projectName);
    const cdHint = useCurrentDir
      ? "You're already in this directory — start building."
      : `Run: cd ${projectName} to navigate and start building.`;
    printSuccess(
      `Project ${displayName} initialized at ${projectPath}. ${cdHint}`,
    );
  } catch (err) {
    const code = getErrnoCode(err);
    const rawMsg = formatError(err);
    if (code === "EACCES") {
      printError("Permission denied. Cannot create project directory.");
    } else if (code === "ENOENT" && rawMsg.includes("AGENTS.sample.md")) {
      printError("Cannot find AGENTS.sample.md. Reinstall wio.");
    } else {
      printError(describeError(err));
    }
    process.exit(1);
  }
}

export async function runPush(): Promise<void> {
  const cwd = process.cwd();
  let config;
  try {
    config = await readWioConfig();
  } catch (err) {
    printError(describeError(err));
    process.exit(1);
  }

  if (!config.name) {
    printError(`No name found in ${CONFIG_FILE_NAME}`);
    process.exit(1);
  }

  if (!config.auth?.token) {
    printError("You are not logged in. Run: wio login <user-tag>");
    process.exit(1);
  }

  const projectName = config.name;

  printInfo(`Pushing ${projectName} to remote...`);
  printInfo(`Scanning project files...`);

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
  formData.append("name", projectName);
  formData.append("archive", blob, `${projectName}.tar.gz`);

  try {
    const response = await fetchWithAuth(`${API_URL}/api/site`, {
      method: "POST",
      body: formData,
    });

    const result = (await response.json()) as { site?: string; error?: string };
    if (!response.ok) {
      printError(
        `Server error: ${response.status} ${result.error || response.statusText}`,
      );
      process.exit(1);
    }

    const urlLine =
      typeof result.site === "string"
        ? `\n  Live at: https://${result.site}.wio.onl`
        : "";
    printSuccess(`Push successful!${urlLine}`);
  } catch (err) {
    printError(describeError(err));
    process.exit(1);
  }
}

export async function runStatus(): Promise<void> {
  const cwd = process.cwd();
  const [hasConfig, hasIndexHtml, hasAgentsMd] = await Promise.all([
    exists(`${cwd}/${CONFIG_FILE_NAME}`),
    exists(`${cwd}/index.html`),
    exists(`${cwd}/AGENTS.md`),
  ]);
  let config;
  try {
    config = await readWioConfig();
  } catch (err) {
    printInfo(`${c.blue("Project status")} — ${cwd}`);
    printInfo(
      `  ${hasConfig ? c.green("✓") : c.red("✗")} ${CONFIG_FILE_NAME} (invalid or unreadable)`,
    );
    printInfo(`  ${hasIndexHtml ? c.green("✓") : c.red("✗")} index.html`);
    printInfo(`  ${hasAgentsMd ? c.green("✓") : c.red("✗")} AGENTS.md`);
    printError(describeError(err));
    return;
  }
  const isLoggedIn = Boolean(config.auth?.token);

  printInfo(`${c.blue("Project status")} — ${cwd}`);
  printInfo(
    `  ${hasConfig ? c.green("✓") : c.red("✗")} ${CONFIG_FILE_NAME}${hasConfig && config.name ? ` (${config.name})` : ""}`,
  );
  printInfo(`  ${hasIndexHtml ? c.green("✓") : c.red("✗")} index.html`);
  printInfo(`  ${hasAgentsMd ? c.green("✓") : c.red("✗")} AGENTS.md`);
  printInfo(
    `  ${isLoggedIn ? c.green("✓") : c.red("✗")} Logged in${isLoggedIn ? ` as ${config.auth?.tag ?? "?"}` : ""}`,
  );
}
