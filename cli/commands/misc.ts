import { printInfo, c } from "../helpers/pretty_print";
import { getVersion } from "../helpers/utils";
import { stripAnsi, padRight } from "../helpers/display";

const COMMAND_GROUPS = [
  {
    label: "Project",
    commands: [
      ["init [name]", "Create a new project"],
      ["status", "Show project + auth status"],
    ],
  },
  {
    label: "Deploy",
    commands: [
      ["push", "Deploy current project"],
      ["list", "List all your sites"],
    ],
  },
  {
    label: "Auth",
    commands: [
      ["register", "Create a new account"],
      ["login <user-tag>", "Sign in"],
      ["logout", "Sign out"],
    ],
  },
  {
    label: "Other",
    commands: [
      ["version", "Show version"],
      ["help", "Show this help"],
    ],
  },
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
    "  Packages and deploys the current project to Wio.",
    "  Requires login. Run: wio login <user-tag>",
  ],
  list: [
    "Usage: wio list [--json]",
    "",
    "  Lists all sites owned by the authenticated user.",
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
  version: ["Usage: wio version", "", "  Prints the installed wio version."],
};

export async function showHelp() {
  const allCommands = COMMAND_GROUPS.flatMap((g) => g.commands);
  const cmdWidth = Math.max(
    ...allCommands.map(([cmd]) => stripAnsi(cmd ?? "").length),
  );

  for (const group of COMMAND_GROUPS) {
    printInfo(`  ${c.dim(group.label)}`);
    for (const [cmd, desc] of group.commands) {
      const padded = padRight(c.blue(cmd ?? ""), cmdWidth);
      printInfo(`    ${padded}  ${desc ?? ""}`);
    }
    console.log();
  }

  printInfo(
    `  Run ${c.blue("wio <command> --help")} for usage details on any command.`,
  );
  printInfo("  Visit https://wio.onl/docs for full documentation.");
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
