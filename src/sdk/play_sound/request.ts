import type { PlaySoundPayload, PlaySoundResponce } from "./payload";

const PLAY_SOUND_ENDPOINT = "/playsound";
export async function request(payload: PlaySoundPayload): Promise<void> {
  const res = await fetch(PLAY_SOUND_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as PlaySoundResponce;

  if (!res.ok) {
    const message = data.error ?? `Play sound request failed (${res.status})`;
    throw new Error(message);
  }
}
