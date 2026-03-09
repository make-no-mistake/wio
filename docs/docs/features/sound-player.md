---
sidebar_position: 4
title: Sound Player
---

# Sound Player

Wio can broadcast sound effects to all connected users in a site room.

## SDK Usage

```ts
import wio from "/wio.js";

await wio.playSound("pop");
```

### `wio.playSound(sound)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `sound` | `string` | Name of the sound to play |

**Returns:** `Promise<void>`

## Available Sounds

| Sound | Name |
|-------|------|
| Pop | `"pop"` |
| Fart | `"fart"` |

## How It Works

When `playSound` is called:

1. The SDK sends a POST request to the server with the sound name.
2. The server emits a `play-sound` WebSocket event to all users in the site's room.
3. Every connected client (including the caller) automatically plays the sound via the browser's `Audio` API.

This means the sound plays for **everyone** visiting the site, not just the user who triggered it.

## Example: Sound Board

```html
<button id="pop-btn">Pop!</button>
<button id="fart-btn">Fart!</button>

<script type="module">
  import wio from "/wio.js";

  document.getElementById("pop-btn").onclick = () => wio.playSound("pop");
  document.getElementById("fart-btn").onclick = () => wio.playSound("fart");
</script>
```
