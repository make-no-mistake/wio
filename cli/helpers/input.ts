import { input } from "@inquirer/prompts";
import { promptUser } from "./runtime";

const STYLED_INPUT_THEME = {
  style: {
    defaultAnswer: (text: string) => `\x1b[2m${text}\x1b[0m`,
    answer: (text: string) => `\x1b[97m${text}\x1b[0m`,
  },
};

export async function prompt(question: string): Promise<string> {
  const answer = await promptUser(question);
  return answer.trim();
}

export async function styledInput(
  placeholder: string,
  options?: { message?: string; prefix?: string },
): Promise<string> {
  if (!process.stdin.isTTY) return "";
  const prefix = options?.prefix ?? "> ";
  const answer = await input({
    message: options?.message ?? "",
    default: placeholder,
    prefill: "tab",
    theme: {
      ...STYLED_INPUT_THEME,
      prefix: { idle: prefix, done: prefix },
    },
  });
  return answer.trim();
}
