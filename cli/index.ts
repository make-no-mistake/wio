import { printError } from "./helpers/pretty_print";
import { formatError } from "./helpers/errors";
import { wantsHelp } from "./helpers/utils";
import { getCliArgs } from "./helpers/runtime";
import { runLogin, runLogout, runRegister } from "./commands/auth";
import { runInit, runPush, runStatus, runList } from "./commands/project";
import {
  showHelp,
  showCommandHelp,
  runVersion,
  runDashboard,
} from "./commands/misc";

async function runCommand(cmd: string, args: string[]): Promise<boolean> {
  switch (cmd) {
    case "help":
    case "--help":
    case "-h":
      await showHelp();
      break;
    case "version":
    case "--version":
    case "-V":
      await runVersion();
      break;
    case "register":
      await runRegister();
      break;
    case "login":
      if (wantsHelp(args)) {
        await showCommandHelp("login");
      } else {
        await runLogin(args);
      }
      break;
    case "logout":
      await runLogout();
      break;
    case "push":
      if (wantsHelp(args)) {
        await showCommandHelp("push");
      } else {
        await runPush();
      }
      break;
    case "init":
      if (wantsHelp(args)) {
        await showCommandHelp("init");
      } else {
        await runInit(args);
      }
      break;
    case "status":
      if (wantsHelp(args)) {
        await showCommandHelp("status");
      } else {
        await runStatus();
      }
      break;
    case "list":
      if (wantsHelp(args)) {
        await showCommandHelp("list");
      } else {
        await runList(args);
      }
      break;
    case "dashboard":
      await runDashboard();
      break;
    default:
      return false;
  }

  return true;
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
