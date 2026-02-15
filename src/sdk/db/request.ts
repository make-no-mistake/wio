import type { Payload } from "./payload";

export async function request<T>(
  _relationName: string,
  _payload: Payload<T>,
): Promise<T> {
  return new Promise(() => {});
}
