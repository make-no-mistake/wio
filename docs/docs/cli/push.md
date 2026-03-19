---
sidebar_position: 1
title: wio push
---

# `wio push`

Package all project files and deploy them to Wio. Creates the site if it doesn't exist; overwrites it if the authenticated user is the owner.

## Usage

```bash
wio push
```

## Flags

| Flag | Description |
|---|---|
| `--help` | Show usage |

## Behavior

1. Reads `wio.yaml` for the site name and auth token
2. Scans all project files, excluding `wio.yaml`
3. Creates a `.tar.gz` archive and uploads it to the server

## Excluded files

`wio.yaml` is always excluded (it contains your auth token and is never deployed). All other files in the project directory are included.

## Example output

**First deploy:**

```
  Pushing my-site to remote...
  Scanning project files...
  Sending to server...

  Push successful!
  Live at: https://my-site.wio.onl
```

## Errors

| Condition | Message | Fix |
|---|---|---|
| `wio.yaml` missing or unreadable | *(ENOENT or parse error)* | Run `wio init <name>` first. |
| `wio.yaml` has no site name | `No name found in wio.yaml` | Add `name: my-site` to `wio.yaml` or re-run `wio init`. |
| Not logged in | `Not logged in` | Run `wio login <user-tag>` first. |
| Archive too large | `Archive exceeds the 50 MB limit` | Remove large files from the project directory. |
| Network error | `Could not reach wio.onl` | Check your connection. Status: wio.onl/status |

:::note
Requires authentication. Run `wio login <user-tag>` first.
:::
