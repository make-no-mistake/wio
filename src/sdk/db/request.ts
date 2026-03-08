import type { Payload } from "./payload";

const DB_ENDPOINT = "/db";

function isSelectPayload(payload: Payload<unknown>): boolean {
  return "select" in payload;
}

function isInsertPayload(payload: Payload<unknown>): boolean {
  return "data" in payload && !("id" in payload);
}

function isUpdatePayload(payload: Payload<unknown>): boolean {
  return "data" in payload && "id" in payload;
}

function isDeletePayload(payload: Payload<unknown>): boolean {
  return "ids" in payload;
}

export async function request<T>(
  relationName: string,
  payload: Payload<T>,
): Promise<T> {
  if (isSelectPayload(payload)) {
    return selectRequest<T>(relationName, payload);
  } else if (isInsertPayload(payload)) {
    return mutationRequest<T>(relationName, "POST", payload);
  } else if (isUpdatePayload(payload)) {
    return mutationRequest<T>(relationName, "PATCH", payload);
  } else if (isDeletePayload(payload)) {
    return deleteRequest<T>(relationName, payload);
  }

  throw new Error("Unknown payload type");
}

async function selectRequest<T>(
  relationName: string,
  payload: Payload<T>,
): Promise<T> {
  const params = new URLSearchParams();
  params.set("payload", JSON.stringify(payload));

  const res = await fetch(
    `${DB_ENDPOINT}/${relationName}?${params.toString()}`,
  );

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as Record<
      string,
      string
    > | null;
    throw new Error(body?.error ?? `Select failed (${res.status})`);
  }

  const body = (await res.json()) as { success: boolean; records: T };
  return body.records;
}

async function mutationRequest<T>(
  relationName: string,
  method: "POST" | "PATCH",
  payload: Payload<T>,
): Promise<T> {
  let body: unknown;

  if (method === "POST" && "data" in payload) {
    body = payload.data;
  } else if (method === "PATCH" && "id" in payload && "data" in payload) {
    const ids = (payload as { id: number[]; data: Partial<T>[] }).id;
    const data = (payload as { id: number[]; data: Partial<T>[] }).data;
    body = ids.map((id: number, i: number) => ({ id, data: data[i] }));
  } else {
    body = payload;
  }

  const res = await fetch(`${DB_ENDPOINT}/${relationName}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const respBody = (await res.json().catch(() => null)) as Record<
      string,
      string
    > | null;
    throw new Error(
      respBody?.error ?? `${method} request failed (${res.status})`,
    );
  }

  const respBody = (await res.json()) as { success: boolean; records: T };
  return respBody.records;
}

async function deleteRequest<T>(
  relationName: string,
  payload: Payload<T>,
): Promise<T> {
  const ids = (payload as { ids: number[] }).ids.join(",");

  const res = await fetch(`${DB_ENDPOINT}/${relationName}?ids=${ids}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as Record<
      string,
      string
    > | null;
    throw new Error(body?.error ?? `Delete failed (${res.status})`);
  }

  const body = (await res.json()) as { success: boolean; deleted_ids: T };
  return body.deleted_ids;
}
