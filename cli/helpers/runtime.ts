/**
 * Runtime abstraction layer — dispatches to Bun or Node.js APIs.
 *
 * Node-only packages (yaml, glob, tar) are dynamically imported so they are
 * never loaded when running under Bun.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BunGlobal = any;

export const isBun =
  typeof (globalThis as Record<string, unknown>).Bun !== "undefined";

export async function exists(path: string): Promise<boolean> {
  try {
    const { access } = await import("fs/promises");
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function yamlParse(text: string): Promise<unknown> {
  if (isBun) {
    const { YAML } = await import("bun");
    return YAML.parse(text);
  }
  const yaml = await import("yaml");
  return yaml.parse(text);
}

export async function yamlStringify(value: unknown): Promise<string> {
  if (isBun) {
    const { YAML } = await import("bun");
    return YAML.stringify(value, null, 2);
  }
  const yaml = await import("yaml");
  return yaml.stringify(value);
}

export async function globFiles(
  cwd: string,
  pattern: string,
): Promise<string[]> {
  if (isBun) {
    const Bun = (globalThis as Record<string, BunGlobal>).Bun;
    const g = new Bun.Glob(pattern);
    const results: string[] = [];
    for await (const path of g.scan({ cwd, onlyFiles: true })) {
      results.push(path);
    }
    return results;
  }
  const { glob } = await import("glob");
  return glob(pattern, { cwd, nodir: true, dot: false });
}

export async function readFileAsBuffer(filePath: string): Promise<ArrayBuffer> {
  if (isBun) {
    const Bun = (globalThis as Record<string, BunGlobal>).Bun;
    return Bun.file(filePath).arrayBuffer();
  }
  const { readFile } = await import("fs/promises");
  const buf = await readFile(filePath);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

export async function createArchive(
  files: Record<string, ArrayBuffer>,
): Promise<Blob> {
  if (isBun) {
    const Bun = (globalThis as Record<string, BunGlobal>).Bun;
    const archive = new Bun.Archive(files, {
      compress: "gzip",
      level: 9,
    });
    return archive.blob();
  }

  const tar = await import("tar");
  const { writeFile, mkdir, rm } = await import("fs/promises");
  const { join } = await import("path");
  const { randomUUID } = await import("crypto");
  const { readFile: readFs } = await import("fs/promises");
  const os = await import("os");

  const tmpDir = join(os.tmpdir(), `wio-archive-${randomUUID()}`);
  await mkdir(tmpDir, { recursive: true });

  try {
    for (const [name, buffer] of Object.entries(files)) {
      const filePath = join(tmpDir, name);
      await mkdir(join(filePath, ".."), { recursive: true });
      await writeFile(filePath, Buffer.from(buffer));
    }

    const archivePath = join(tmpDir, "__archive.tar.gz");
    await tar.create(
      {
        gzip: true,
        file: archivePath,
        cwd: tmpDir,
        filter: (path: string) => path !== "__archive.tar.gz",
      },
      Object.keys(files),
    );

    const archiveBuffer = await readFs(archivePath);
    return new Blob([archiveBuffer], { type: "application/gzip" });
  } finally {
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

export function getScriptDir(meta: ImportMeta): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m = meta as any;
  if (isBun && m.dir) {
    return m.dir as string;
  }
  if (m.dirname) {
    return m.dirname as string;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const url = require("url");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require("path");
  return path.dirname(url.fileURLToPath(meta.url));
}

export function getCliArgs(): string[] {
  if (isBun) {
    const Bun = (globalThis as Record<string, BunGlobal>).Bun;
    return Bun.argv.slice(2);
  }
  return process.argv.slice(2);
}

export async function promptUser(question: string): Promise<string> {
  if (isBun && typeof globalThis.prompt === "function") {
    return (globalThis.prompt as (q: string) => string | null)(question) ?? "";
  }
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise<string>((resolve) => {
    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer);
    });
  });
}
