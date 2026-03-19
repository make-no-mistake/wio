---
sidebar_position: 4
title: CLI
---

# CLI Reference

The Wio CLI (`wio-cli`) manages project creation, authentication, and deployment.

## Installation

```bash
npm i -g wio-cli
```

## Commands

### `wio init [name]`

Create a new Wio project.

```bash
wio init my-site        # Creates a "my-site" directory
```

**What it creates:**

| File | Description |
|------|-------------|
| `wio.yaml` | Project configuration with the site name |
| `index.html` | Starter HTML file that imports the SDK |
| `AGENTS.md` | Instructions for AI coding agents |

**Validation rules:**
- Project name must be 1-32 characters
- Cannot conflict with an existing directory
- Cannot reinitialize a directory that already has `wio.yaml`

### `wio push`

Package and deploy the current project to Wio.

```bash
wio push
```

This command:
1. Reads `wio.yaml` for the project name and auth token
2. Scans all files in the current directory recursively
3. Creates a compressed `.tar.gz` archive (max 50 MB)
4. Uploads to the Wio server

**Uploading rules:**
- If the site already exists and you are the owner of the site, it will be overwritten
- If the site does not exist, it will be created, and you are set as the owner

After a successful push, the site is live at `https://<project-name>.wio.onl`.

:::note
Requires authentication. Run `wio login` first.
:::

### `wio list`

List all sites owned by the authenticated user.

```bash
wio list
wio list --json
```

Unlike `wio status`, this is not tied to the current directory — it shows every site on your account along with its live/offline status and last pushed timestamp.

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON |

Requires authentication. Run `wio login <user-tag>` first.

### `wio register`

Open the Wio registration page to create a new account.

```bash
wio register
```

This opens [https://wio.onl/register](https://wio.onl/register) in your default browser. The page generates a unique 16-digit user tag — your identity on the platform.

**Important:** Save your user tag somewhere safe. You'll need it to log in from any project.

### `wio login <user-tag>`

Authenticate with the Wio platform.

```bash
wio login 1234567890123456
```

If no tag is provided in a TTY environment, you'll be prompted interactively. The token is saved to `wio.yaml` in the current directory.

Get a user tag by running `wio register` or visiting [https://wio.onl/register](https://wio.onl/register).

### `wio logout`

Remove the saved auth token from `wio.yaml`.

```bash
wio logout
```

### `wio status`

Show the current project status: config file, `index.html`, `AGENTS.md`, and authentication state.

```bash
wio status
```

Example output:
```
Project status — /path/to/my-site
  ✓ wio.yaml (my-site)
  ✓ index.html
  ✓ AGENTS.md
  ✓ Logged in as 1234567890123456
```

### `wio dashboard`

Open the Wio observability dashboard in your default browser.

```bash
wio dashboard
```

This opens [https://wio.onl/dashboard](https://wio.onl/dashboard) where you can view analytics and telemetry for your deployed sites.

### `wio version`

Print the installed CLI version.

```bash
wio version
```

### `wio help`

Show available commands.

```bash
wio help
```

## Configuration File

The `wio.yaml` file stores project settings:

```yaml
name: my-site
auth:
  token: <jwt-token>
  tag: "1234567890123456"
```

| Field | Description |
|-------|-------------|
| `name` | The site name (used as the subdomain) |
| `auth.token` | JWT authentication token (set by `wio login`) |
| `auth.tag` | User tag (set by `wio login`) |

## Flags

All commands support `--help` or `-h` for usage information:

```bash
wio init --help
wio push --help
```
