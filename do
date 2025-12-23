#!/bin/bash

set -e

get_project_root() {
  echo "$(cd "$(dirname "$0")" && pwd)"
}

source_common() {
  . "$1"
}

extract_summary() {
  local script_path=$1
  grep "^#[^!]" "$script_path" | head -n 1 | sed 's/^#[[:space:]]*//; s/[[:space:]]*$//'
}

list_commands() {
  local scripts_dir="$1"
  echo -e "${WARNING_COLOR}Usage: ./do <command> [args...]${RESET_COLOR}"
  echo -e "${INFO_COLOR}Available commands:${RESET_COLOR}"

  if [ ! -d "$scripts_dir" ]; then
    echo -e "  ${WARNING_COLOR}(No scripts directory found)${RESET_COLOR}"
    return
  fi

  find "$scripts_dir" -maxdepth 1 -type f ! -name "_*" -print0 | sort -z | while IFS= read -r -d $'\0' file; do
    if [ -x "$file" ]; then
      local name=$(basename "$file")
      local summary=$(extract_summary "$file")
      printf "  ${INFO_COLOR}%-15s${RESET_COLOR} %s\n" "$name" "$summary"
    fi
  done
}

# --- Main Logic ---

PROJECT_ROOT=$(get_project_root)
SCRIPTS_DIR="$PROJECT_ROOT/scripts"
source_common "$SCRIPTS_DIR/_common"

COMMAND=$1

if [ -z "$COMMAND" ] || [ "$COMMAND" = "help" ]; then
  list_commands "$SCRIPTS_DIR"
  exit 0
fi

if [[ "$COMMAND" == _* ]]; then
  echo -e "${ERROR_COLOR}Error: '$COMMAND' is private.${RESET_COLOR}"
  exit 1
fi

SCRIPT_PATH="$SCRIPTS_DIR/$COMMAND"

if [ -f "$SCRIPT_PATH" ] && [ -x "$SCRIPT_PATH" ]; then
  echo -e "${SUCCESS_COLOR}Running: $COMMAND...${RESET_COLOR}"
  shift
  "$SCRIPT_PATH" "$@"
else
  echo -e "${ERROR_COLOR}Error: Command '$COMMAND' not found.${RESET_COLOR}"
  exit 1
fi
