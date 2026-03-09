import { printError } from "./helpers/pretty_print";
import { formatError } from "./helpers/errors";
import { wantsHelp } from "./helpers/utils";
import { getCliArgs } from "./helpers/runtime";
import { runLogin, runLogout } from "./commands/auth";
import { runInit, runPush, runStatus } from "./commands/project";
import { showHelp, showCommandHelp, runVersion } from "./commands/misc";

async function runCommand(cmd: string, args: string[]): Promise<boolean> {
  if (cmd === "help" || cmd === "--help" || cmd === "-h") {
    await showHelp();
    return true;
  }
  if (cmd === "version" || cmd === "--version" || cmd === "-V") {
    await runVersion();
    return true;
  }
  if (cmd === "login") {
    if (wantsHelp(args)) {
      await showCommandHelp("login");
      return true;
    }
    await runLogin(args);
    return true;
  }
  if (cmd === "logout") {
    await runLogout();
    return true;
  }
  if (cmd === "push") {
    if (wantsHelp(args)) {
      await showCommandHelp("push");
      return true;
    }
    await runPush();
    return true;
  }
  if (cmd === "init") {
    if (wantsHelp(args)) {
      await showCommandHelp("init");
      return true;
    }
    await runInit(args);
    return true;
  }
  if (cmd === "status") {
    if (wantsHelp(args)) {
      await showCommandHelp("status");
      return true;
    }
    await runStatus();
    return true;
  }
  return false;
}

async function main(): Promise<void> {
  process.env.WIO_MINIMAL_COLOR = "1";

  const rawArgs = getCliArgs();
  const command = rawArgs[0];
  const commandArgs = rawArgs.slice(1);

  if (rawArgs.length === 0) {
    await showHelp();
    process.exit(0);
  }

  console.log();
  const handled = await runCommand(command!, commandArgs);
  console.log();
  if (handled) process.exit(0);

  printError(`Unknown command: ${command}`);
  printError("Run 'wio help' for usage.");
  process.exit(1);
}

main().catch((err) => {
  printError(formatError(err));
  process.exit(1);
});
