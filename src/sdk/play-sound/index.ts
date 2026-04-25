import { request } from "./request";

/**
 * Wio Playsound Client SDK
 *
 * Provides a simple interface for playing a sound
 *
 * Usage: wio.renderMarkdown("# Hello")
 *
 * @param sound - The name of the sound we wish to play
 * @returns The rendered HTML as a string
 */
export async function playSound(sound: string) {
  request({ sound });
}
