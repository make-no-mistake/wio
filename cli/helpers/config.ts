import { exists, readFile, writeFile } from "fs/promises";
import { YAML } from "bun";

export const CONFIG_FILE_NAME = "wio.yaml";

export type WioConfig = {
  name?: string;
  auth?: { token?: string };
};

export async function readWioConfig(): Promise<WioConfig> {
  const cwd = process.cwd();
  const configPath = `${cwd}/${CONFIG_FILE_NAME}`;

  if (!(await exists(configPath))) {
    return {};
  }

  const raw = await readFile(configPath, "utf8");
  const parsed = YAML.parse(raw) as WioConfig | null;
  return parsed ?? {};
}

export async function writeWioConfig(config: WioConfig): Promise<void> {
  const configPath = `${process.cwd()}/${CONFIG_FILE_NAME}`;
  await writeFile(configPath, YAML.stringify(config, null, 2));
}
