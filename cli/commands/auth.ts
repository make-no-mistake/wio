import { printError, printInfo, printSuccess } from "../helpers/pretty_print";
import { describeError } from "../helpers/errors";
import {
  readWioConfig,
  writeWioConfig,
  CONFIG_FILE_NAME,
} from "../helpers/config";
import { prompt } from "../helpers/input";
import { API_URL, REGISTER_URL } from "../helpers/constants";
import { msg } from "../helpers/messages";
import { isWioDirectory, openBrowser } from "../helpers/utils";

export async function runRegister(): Promise<void> {
  printInfo(`Opening register page: ${REGISTER_URL}`);
  await openBrowser(REGISTER_URL);
}

export async function runLogin(args: string[]): Promise<void> {
  // Ensure that we only log in into a directory that contains a wio project.
  if (!(await isWioDirectory())) {
    printError(
      "You must be in a wio project directory to log in. Navigate into a wio project directory or initialize a new project using the wio init command.",
    );
    process.exit(1);
  }

  let tag = args[0]?.trim();
  if (!tag) {
    if (process.stdin.isTTY) {
      tag = await prompt("User tag: ");
      if (!tag) {
        printError("Error: user tag is required");
        msg.registerHint();
        process.exit(1);
      }
    } else {
      printError("Error: user tag is required");
      printError("Usage: wio login <user-tag>");
      msg.registerHint();
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
      msg.registerHint();
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
      msg.notLoggedIn();
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
