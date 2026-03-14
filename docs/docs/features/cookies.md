---
sidebar_position: 7
title: Cookies
---

# Cookies

Wio provides a site-scoped cookie API through the SDK. You can read, write, and delete cookies without manually constructing request handlers.

## SDK Usage

```ts
import wio from "/wio.js";

await wio.cookies.write({ name: "theme", value: "dark" });
const result = await wio.cookies.read({ name: "theme" });
console.log(result.value);
await wio.cookies.delete({ name: "theme" });
```

## Methods

### `wio.cookies.read({ name })`

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Cookie name |

**Returns:** `Promise<{ value: string | null, error?: string }>`

Returns `null` when the cookie does not exist.

### `wio.cookies.write({ name, value })`

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Cookie name |
| `value` | `string` | Cookie value |

**Returns:** `Promise<{ error?: string }>`

### `wio.cookies.delete({ name })`

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Cookie name |

**Returns:** `Promise<{ error?: string }>`

## Cookie Behavior

Cookies written through Wio are:

- Scoped to the current site
- Stored at the `/` path
- Set with `HttpOnly`
- Set with `Secure`
- Set with `SameSite=Lax`
- Configured with a 7 day lifetime

This means they are intended for server-managed state, not direct access through `document.cookie`.

## Example: Remember a Theme Preference

```html
<button id="dark-btn">Dark</button>
<button id="light-btn">Light</button>

<script type="module">
  import wio from "/wio.js";

  async function applyTheme() {
    const result = await wio.cookies.read({ name: "theme" });
    document.documentElement.dataset.theme = result.value ?? "light";
  }

  document.getElementById("dark-btn").onclick = async () => {
    await wio.cookies.write({ name: "theme", value: "dark" });
    await applyTheme();
  };

  document.getElementById("light-btn").onclick = async () => {
    await wio.cookies.write({ name: "theme", value: "light" });
    await applyTheme();
  };

  applyTheme();
</script>
```
