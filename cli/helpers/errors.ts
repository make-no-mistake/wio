export function formatError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export function getErrnoCode(err: unknown): string | undefined {
  return (err as NodeJS.ErrnoException)?.code;
}

export function describeError(err: unknown): string {
  const code = getErrnoCode(err);
  if (code === "ENOENT") return "File or directory not found.";
  if (code === "EACCES") return "Permission denied.";

  const msg = formatError(err);
  const networkPatterns = [
    "fetch",
    "ECONNREFUSED",
    "ENOTFOUND",
    "ETIMEDOUT",
    "network",
  ];
  if (networkPatterns.some((p) => msg.includes(p))) {
    return "Failed to connect. Check your internet connection.";
  }
  return msg;
}
