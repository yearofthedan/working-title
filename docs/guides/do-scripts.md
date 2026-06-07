# Adding `./do` Scripts

`./do` is the entry point for every project task. It runs any executable file in [`scripts/`](../../scripts/) and lists them via `./do help`. Add a command when a task is worth running more than once.

## Steps

1. **Create an executable file** in `scripts/`, named in `kebab-case` after the action (e.g. `scripts/bootstrap-gh`). Prefix with `_` only for private helpers that should NOT appear in `./do help` (e.g. `_common`).

   ```bash
   touch scripts/my-command && chmod +x scripts/my-command
   ```

2. **First comment line is the help text.** `./do help` reads the first `#` line after the shebang, so keep it to one line ending in `Usage: ./do my-command`:

   ```bash
   #!/bin/bash
   # What this command does. Usage: ./do my-command

   . "$(dirname "$0")"/_common   # colour helpers (SUCCESS_COLOR, etc.), optional
   set -euo pipefail

   echo -e "${INFO_COLOR}Doing the thing...${RESET_COLOR}"
   ```

3. **Verify** it runs and is discoverable: `./do my-command`, then `./do help` (confirm it's listed with its description).

## Notes

- Commands run from the project root; reference other commands as `"$(dirname "$0")/../do" <cmd>` or just `./do <cmd>`.
- Don't call the underlying tool (`pnpm`, `vitest`, …) directly elsewhere — wrap it here so there's one consistent interface.
