import { readFile } from "fs/promises";
import { getScriptDir } from "./runtime";

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
