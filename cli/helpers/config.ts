import { readFile, writeFile } from "fs/promises";
import { yamlParse, yamlStringify, exists } from "./runtime";
import { formatError, getErrnoCode } from "./errors";

export const CONFIG_FILE_NAME = "wio.yaml";

export type WioConfig = {
  name?: string;
  auth?: { token?: string; tag?: string };
};

export async function readWioConfig(): Promise<WioConfig> {
  const cwd = process.cwd();
  const configPath = `${cwd}/${CONFIG_FILE_NAME}`;

  if (!(await exists(configPath))) {
    return {};
  }

  let raw: string;
  try {
    raw = await readFile(configPath, "utf8");
  } catch (err) {
    const code = getErrnoCode(err);
    if (code === "ENOENT") return {};
    if (code === "EACCES")
      throw new Error("Permission denied reading wio.yaml", { cause: err });
    throw err;
  }

  try {
    const parsed = (await yamlParse(raw)) as WioConfig | null;
    return parsed ?? {};
  } catch (err) {
    throw new Error(`Invalid wio.yaml: ${formatError(err)}`, { cause: err });
  }
}

export async function writeWioConfig(config: WioConfig): Promise<void> {
  const configPath = `${process.cwd()}/${CONFIG_FILE_NAME}`;
  await writeFile(configPath, await yamlStringify(config));
}
