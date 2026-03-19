---
sidebar_position: 2
title: wio list
---

# `wio list`

List all sites owned by the authenticated user, across all local directories. Unlike `wio status`, this is not tied to the current directory — it shows the full account picture.

## Usage

```bash
wio list
wio list --json
```

## Flags

| Flag | Description |
|---|---|
| `--json` | Output as JSON |
| `--help` | Show usage |

## Behavior

- Reads auth from `wio.yaml` in the current directory
- Fetches all sites owned by the authenticated user from the server
- Sorts by last pushed date, most recent first
- Shows site status: `live` (deployed and serving files) or `offline`

## Example output

```
  3 sites  tag ···3456
  ─────────────────────────────────────────────────────
  my-portfolio   live     https://my-portfolio.wio.onl   2h ago
  test-app       live     https://test-app.wio.onl        5d ago
  old-site       offline  https://old-site.wio.onl        3w ago
  ─────────────────────────────────────────────────────
```

**No sites:**

```
  No sites yet.
    Run wio init <name> to create your first site.
```

## JSON output

```json
[
  {
    "name": "my-portfolio",
    "status": "live",
    "url": "https://my-portfolio.wio.onl",
    "lastPushed": "2025-03-15T10:00:00Z"
  }
]
```

## Errors

| Condition | Message | Fix |
|---|---|---|
| Not logged in | `Not logged in` | Run `wio login <your-tag>` first. |
| Network error | `Could not reach wio.onl` | Check your connection. Status: wio.onl/status |

:::note
`wio list` works from any directory. Auth is read from `wio.yaml` in the current directory.
:::
