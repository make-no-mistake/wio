import { printError, printInfo, printSuccess } from "../helpers/pretty_print";
import { describeError } from "../helpers/errors";
import {
  readWioConfig,
  writeWioConfig,
  CONFIG_FILE_NAME,
} from "../helpers/config";
import { prompt } from "../helpers/input";
import { API_URL } from "../helpers/constants";

export async function runLogin(args: string[]): Promise<void> {
  let tag = args[0]?.trim();
  if (!tag) {
    if (process.stdin.isTTY) {
      tag = await prompt("User tag: ");
      if (!tag) {
        printError("Error: user tag is required");
        printInfo("Visit https://wio.onl/register to get a user tag.");
        process.exit(1);
      }
    } else {
      printError("Error: user tag is required");
      printError("Usage: wio login <user-tag>");
      printInfo("Visit https://wio.onl/register to get a user tag.");
      process.exit(1);
    }
  }

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag }),
    });

    if (!response.ok) {
      printError("Unauthorized: user tag not recognized");
      printInfo("Visit https://wio.onl/register to get a user tag.");
      process.exit(1);
    }

    const body = (await response.json()) as { token?: string };
    const config = await readWioConfig();
    config.auth = {
      ...(config.auth ?? {}),
      token: body.token,
      tag,
    };
    await writeWioConfig(config);
    printSuccess(`Login successful. Token saved to ${CONFIG_FILE_NAME}.`);
  } catch (err) {
    printError(describeError(err));
    process.exit(1);
  }
}

export async function runLogout(): Promise<void> {
  try {
    const config = await readWioConfig();
    if (!config.auth?.token) {
      printInfo("You are not logged in.");
      return;
    }
    const tag = config.auth.tag;
    delete config.auth;
    await writeWioConfig(config);
    printSuccess(`Logged out${tag ? ` (${tag})` : ""}.`);
  } catch (err) {
    printError(describeError(err));
    process.exit(1);
  }
}
