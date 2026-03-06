import { readWioConfig } from "./config";

export async function fetchWithAuth(
  ...args: Parameters<typeof fetch>
): ReturnType<typeof fetch> {
  const config = await readWioConfig();
  const token = config.auth?.token;

  const [input, init = {}] = args;

  const headers = {
    ...(init.headers ?? {}),
    Authorization: `Bearer ${token}`,
  };

  return fetch(input, { ...init, headers });
}
