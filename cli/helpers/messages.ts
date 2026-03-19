import { printError, printInfo } from "./pretty_print";

export const msg = {
  notLoggedIn() {
    printError("Not logged in");
    printError("Run: wio login <user-tag>");
  },

  noConfig() {
    printError("No wio.yaml found");
    printError("Run wio init <name> to create a project here.");
  },

  networkError() {
    printError("Could not reach wio.onl");
    printError("Check your connection. Status: wio.onl/status");
  },

  registerHint() {
    printInfo("Visit https://wio.onl/register to get a user tag.");
  },
};
