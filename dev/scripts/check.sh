#!/usr/bin/env bash
set -u

# Colors
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RESET="\033[0m"

lint_status=0
test_status=0

run_step() {
  local name="$1"
  local command="$2"

  printf "%b\n" "${YELLOW}Running ${name}...${RESET}"

  if eval "$command" >/dev/null 2>&1; then
    printf "%b\n" "${GREEN}${name}: PASSED${RESET}"
    return 0
  else
    local status=$?
    printf "%b\n" "${RED}${name}: FAILED (exit ${status})${RESET}"
    return "$status"
  fi
}

run_step "Lint" "bun run lint:check" || lint_status=$?
run_step "Test" "bun run test" || test_status=$?

echo

if [ "$lint_status" -ne 0 ] || [ "$test_status" -ne 0 ]; then
  printf "%b\n" "${RED}One or more checks failed.${RESET}"
  exit 1
else
  printf "%b\n" "${GREEN}All checks passed successfully.${RESET}"
fi
