import { readFile } from "fs/promises";
import { getScriptDir } from "./runtime";
import { readWioConfig } from "./config";
import { printInfo } from "./pretty_print";

export async function getVersion(): Promise<string> {
  try {
    const scriptDir = getScriptDir(import.meta);
    const pkg = JSON.parse(
      (await readFile(`${scriptDir}/../package.json`)).toString(),
    ) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export function getBaseName(path: string): string {
  const normalized = path.replace(/[\\/]+$/, "");
  const parts = normalized.split(/[\\/]/);
  return parts[parts.length - 1] ?? "";
}

export function validateProjectName(name: string): string | null {
  if (name === ".") return null;
  const trimmed = name.trim();
  if (!trimmed) return "Project name cannot be empty.";
  if (trimmed !== name)
    return "Project name cannot have leading or trailing spaces.";
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return "Project name can only contain letters, numbers, hyphens, and underscores.";
  }
  if (/^-/.test(trimmed)) return "Project name cannot start with a hyphen.";
  if (trimmed.length > 50)
    return "Project name must be 50 characters or fewer.";
  return null;
}

export function wantsHelp(args: string[]): boolean {
  return args.includes("--help") || args.includes("-h");
}

export async function isWioDirectory() {
  const config = await readWioConfig();
  return Object.keys(config).length > 0;
}

export async function openBrowser(url: string): Promise<void> {
  try {
    const isDarwin = process.platform === "darwin";
    const isLinux = process.platform === "linux";
    const command = isDarwin ? "open" : isLinux ? "xdg-open" : null;

    if (command) {
      const { spawn } = await import("child_process");
      spawn(command, [url], {
        detached: true,
        stdio: "ignore",
      }).unref();
    } else {
      printInfo("Please open the link manually in your browser.");
    }
  } catch {
    printInfo("Please open the link manually in your browser.");
  }
}
