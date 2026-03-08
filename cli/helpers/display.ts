// eslint-disable-next-line no-control-regex
export const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "");

export function padRight(s: string, w: number): string {
  const len = stripAnsi(s).length;
  return s + " ".repeat(Math.max(0, w - len));
}
