import { printInfo, c } from "../helpers/pretty_print";
import { getVersion, openBrowser } from "../helpers/utils";
import { stripAnsi, padRight } from "../helpers/display";
import { DASHBOARD_URL } from "../helpers/constants";

const COMMANDS = [
  ["init [name]", "Create new project"],
  ["push", "Push to remote"],
  ["register", "Create a new account"],
  ["login <user-tag>", "Sign in"],
  ["logout", "Sign out"],
  ["status", "Show project + auth status"],
  ["dashboard", "Open the observability dashboard"],
  ["version", "Show version"],
  ["help", "Show help"],
];

const COMMAND_USAGE: Record<string, string[]> = {
  init: [
    "Usage: wio init [name]",
    "",
    "  Creates a new Wio project in a new directory.",
    "  Use '.' to initialize in the current directory.",
  ],
  push: [
    "Usage: wio push",
    "",
    "  Packages and uploads the current project to Wio.",
    "  Requires login. Run: wio login <user-tag>",
  ],
  register: [
    "Usage: wio register",
    "",
    "  Opens the Wio registration page in your browser.",
  ],
  login: [
    "Usage: wio login <user-tag>",
    "",
    "  Signs in with your Wio user tag.",
    "  Get a tag at https://wio.onl/register",
  ],
  logout: ["Usage: wio logout", "", "  Removes your saved auth token."],
  status: [
    "Usage: wio status",
    "",
    "  Shows project files and login state for the current directory.",
  ],
  dashboard: [
    "Usage: wio dashboard",
    "",
    "  Opens the Wio observability dashboard in your browser.",
  ],
  version: ["Usage: wio version", "", "  Prints the installed wio version."],
};

export async function showHelp() {
  const commands = COMMANDS;
  const cmdWidth = Math.max(
    ...commands.map(([cmd]) => stripAnsi(cmd ?? "").length),
  );
  printInfo("Commands:");
  for (const [cmd, desc] of commands) {
    const padded = padRight(c.blue(cmd ?? ""), cmdWidth);
    printInfo(`  ${padded}  ${desc ?? ""}`);
  }
  console.log();
  printInfo("Visit https://wio.onl for more information.");
}

export async function showCommandHelp(cmd: string): Promise<void> {
  const lines = COMMAND_USAGE[cmd];
  if (!lines) {
    await showHelp();
    return;
  }
  for (const line of lines) {
    printInfo(line);
  }
  console.log();
}

export async function runVersion(): Promise<void> {
  const version = await getVersion();
  printInfo(`wio v${version}`);
}

export async function runDashboard(): Promise<void> {
  printInfo(`Opening dashboard: ${DASHBOARD_URL}`);
  await openBrowser(DASHBOARD_URL);
}
