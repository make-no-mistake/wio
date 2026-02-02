#!/usr/bin/env bash

# Create a GitHub issue for this repository.
#
# This script wraps the GitHub CLI (`gh`) to create an issue in the current
# repository. It is primarily intended to be called by agents or developers.
#
# Prerequisites:
#   - GitHub CLI installed: https://cli.github.com/
#   - Authenticated with GitHub CLI (e.g. `gh auth login`).
#   - Run this script from within the target repository so that `gh` picks
#     up the correct repository context.
#
# Usage:
#   ./dev/scripts/create_issues.sh --title "Issue title" --label "label1,label2" --body "Issue body"
#
# Arguments:
#   --title   (required) The title of the issue
#   --label   (optional) Comma-separated labels to apply
#   --body    (optional) The body/description of the issue
#
# Example:
#   ./dev/scripts/create_issues.sh --title "Add user authentication" --label "api,enhancement" --body "Implement OAuth2 authentication"

set -e

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo "Error: GitHub CLI (gh) is not installed. Install from https://cli.github.com/"
  exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
  echo "Error: Not authenticated with GitHub CLI. Run 'gh auth login' first."
  exit 1
fi

# Check if at least --title is provided
if [[ $# -eq 0 ]]; then
  echo "Usage: $0 --title \"Issue title\" [--label \"labels\"] [--body \"body\"]"
  echo "Example: $0 --title \"Add feature\" --label \"enhancement\" --body \"Description here\""
  exit 1
fi

echo "Creating GitHub issue..."
gh issue create "$@" --web=false
echo "Done!"
