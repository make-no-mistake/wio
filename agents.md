# Agents

This file contains the master instructions for all agents.

## Agent Definitions

The following files are symbolic links to this file:

- `agents/_base.md`
- `agents/claude.md`
- `agents/gemini.md`

## Scripts

The following scripts are available for agents to use.

### `dev/scripts/run_python.sh`

Executes a python script.

**Usage:**

```bash
./dev/scripts/run_python.sh <path_to_script>
```

### `dev/scripts/run_node.sh`

Executes a javascript/typescript script using bun.

**Usage:**

```bash
./dev/scripts/run_node.sh <path_to_script>
```

### `dev/scripts/create_issues.sh`

Creates a GitHub issue for the repository using the GitHub CLI.

**Usage:**

```bash
./dev/scripts/create_issues.sh --title "Issue title" --label "label1,label2" --body "Issue body"
```

**Arguments:**

- `--title` (required) - The title of the issue
- `--label` (optional) - Comma-separated labels to apply
- `--body` (optional) - The body/description of the issue

**Example:**

```bash
./dev/scripts/create_issues.sh --title "Add user authentication" --label "api,enhancement" --body "Implement OAuth2 authentication for the API"
```

**Available Labels:**

| Label              | Description                                         |
| ------------------ | --------------------------------------------------- |
| `ai`               | AI-related issues                                   |
| `api`              | API-related issues                                  |
| `bug`              | Something isn't working                             |
| `cli`              | CLI-related issues                                  |
| `db`               | Database-related issues                             |
| `documentation`    | Improvements or additions to documentation          |
| `duplicate`        | This issue or pull request already exists           |
| `enhancement`      | New feature or request                              |
| `epic`             | Epic issue (large feature spanning multiple issues) |
| `good first issue` | Good for newcomers                                  |
| `help wanted`      | Extra attention is needed                           |
| `invalid`          | This doesn't seem right                             |
| `jaja`             | -                                                   |
| `question`         | Further information is requested                    |
| `websocket`        | WebSocket-related issues                            |
| `wontfix`          | This will not be worked on                          |

**Commit rules:**

- one-line commit messages
- do not mention "co-authored by" in the commit message

Make no mistake.
