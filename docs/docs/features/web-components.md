---
sidebar_position: 6
title: Web Components
---

# Web Components

The Wio SDK registers two custom HTML elements: `<wio-button>` and `<wio-modal>`. They are available automatically when you import the SDK.

## `<wio-button>`

A styled button with optional modal integration.

```html
<wio-button>Click me</wio-button>
```

### Modal Integration

Set the `modal` attribute to automatically open a `<wio-modal>` on click:

```html
<wio-button modal="settings-modal">Open Settings</wio-button>

<wio-modal id="settings-modal">
  <h2>Settings</h2>
  <p>Configure your preferences here.</p>
</wio-modal>
```

### Styling

The button uses Shadow DOM. Customize it with the `::part(button)` selector:

```css
wio-button::part(button) {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
}
```

## `<wio-modal>`

A modal dialog with an overlay backdrop.

```html
<wio-modal id="my-modal">
  <h2>Modal Title</h2>
  <p>Modal content goes here.</p>
</wio-modal>
```

### Opening and Closing

**Via `<wio-button>`:**

```html
<wio-button modal="my-modal">Open</wio-button>
```

**Via JavaScript:**

```ts
import wio from "/wio.js";

wio.openModal("my-modal");
```

**Via attribute:**

```html
<wio-modal id="my-modal" open>
  <!-- Renders open immediately -->
</wio-modal>
```

### Closing

The modal closes when:
- The user clicks the backdrop (outside the modal content)
- The user presses the `Escape` key

### Events

| Event | Fires when |
|-------|-----------|
| `wio-modal-open` | The modal opens |
| `wio-modal-close` | The modal closes |

```ts
document.querySelector("#my-modal").addEventListener("wio-modal-close", () => {
  console.log("Modal was closed");
});
```

### Styling

Customize the overlay and modal container via CSS `::part()`:

```css
wio-modal::part(overlay) {
  background-color: rgba(0, 0, 0, 0.5);
}

wio-modal::part(modal) {
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
}
```

## Complete Example

```html
<wio-button modal="confirm-dialog">Delete Item</wio-button>

<wio-modal id="confirm-dialog">
  <h2>Confirm Deletion</h2>
  <p>Are you sure you want to delete this item?</p>
  <wio-button id="cancel-btn">Cancel</wio-button>
  <wio-button id="confirm-btn">Delete</wio-button>
</wio-modal>

<script type="module">
  import wio from "/wio.js";

  document.getElementById("cancel-btn").addEventListener("click", () => {
    document.getElementById("confirm-dialog").close();
  });

  document.getElementById("confirm-btn").addEventListener("click", () => {
    // perform deletion
    document.getElementById("confirm-dialog").close();
  });
</script>
```
