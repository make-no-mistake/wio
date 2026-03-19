import { readWioConfig } from "./config";

export async function getAuthToken(): Promise<string | undefined> {
  const config = await readWioConfig();
  return config.auth?.token;
}

export async function fetchWithAuth(
  ...args: Parameters<typeof fetch>
): ReturnType<typeof fetch> {
  const token = await getAuthToken();

  const [input, init = {}] = args;

  const headers = {
    ...(init.headers ?? {}),
    Authorization: `Bearer ${token}`,
  };

  return fetch(input, { ...init, headers });
}
