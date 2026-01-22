---
name: add-do-command
description: Create new executable commands for the ./do task runner. Use when adding build scripts, dev tools, or automation tasks that should be easily discoverable and runnable.
---

# Add Do Command

Create new executable commands for the project's [`./do`](../../../do) task runner. This provides a consistent interface for running project tasks like building, testing, and development workflows.

## When to Use

- Adding new build or deployment scripts
- Creating development tools or utilities
- Automating repetitive tasks
- Exposing complex operations through simple commands
- When a task needs to be discoverable via `./do help`

## Prerequisites

- Understanding of what the command should accomplish
- Bash scripting knowledge for implementation
- Access to `execute_command` tool

## Procedure

### 1. Create the Script File

Create an executable script in the `scripts/` directory:

```bash
touch scripts/my-command
chmod +x scripts/my-command
```

**Naming conventions:**
- Use `kebab-case` for command names
- Prefix with `_` for utility scripts that shouldn't be directly called (e.g., `_common`)
- Name should clearly describe the action (e.g., `lint`, `test`, `build`)

### 2. Add Script Header

Start the script with a shebang and a comment describing what it does:

```bash
#!/bin/bash
# Brief description of what this command does. Used by ./do help.

# Rest of script implementation
```

**Important:** The first comment line after the shebang is used by `./do help` to display command descriptions. Keep it concise (one line).

### 3. Implement the Command

Add the script logic. Use the common utilities if needed:

```bash
#!/bin/bash
# Run integration tests with coverage report

# Source common utilities (if needed)
source "$(dirname "$0")/_common"

# Your implementation here
echo "Running integration tests..."
pnpm vitest run --coverage
```

**Best practices:**
- Use `set -e` to exit on errors
- Provide clear output messages
- Handle arguments if the command accepts them
- Use relative paths or reference project root

### 4. Test the Command

Verify the command works:

```bash
./do my-command
```

Test edge cases:
- Run without arguments (if applicable)
- Run with invalid arguments (if applicable)
- Verify error messages are clear
- Confirm exit codes are correct (0 for success, non-zero for failure)

### 5. Verify Help Integration

Check that the command appears in help:

```bash
./do help
```

Confirm:
- Command is listed
- Description from the comment appears correctly
- Utility scripts (prefixed with `_`) don't appear

## Validation Checklist

- [ ] Script file created in `scripts/` directory
- [ ] File is executable (`chmod +x`)
- [ ] Shebang (`#!/bin/bash`) is first line
- [ ] First comment describes the command clearly
- [ ] Script implements the intended functionality
- [ ] Command runs successfully: `./do my-command`
- [ ] Command appears in help output: `./do help`
- [ ] Error cases are handled gracefully

## Common Pitfalls

**Command doesn't appear in help**
- **Cause**: Missing or malformed first comment after shebang
- **Solution**: Ensure format is exactly:
  ```bash
  #!/bin/bash
  # Description goes here
  ```

**Permission denied error**
- **Cause**: Script not executable
- **Solution**: Run `chmod +x scripts/my-command`

**Command fails with "command not found"**
- **Cause**: Dependencies not installed or not in PATH
- **Solution**: Document prerequisites or add checks:
  ```bash
  if ! command -v pnpm &> /dev/null; then
    echo "Error: pnpm not found"
    exit 1
  fi
  ```

**Relative paths break when script changes directory**
- **Cause**: Paths relative to current working directory
- **Solution**: Use absolute paths or reference script directory:
  ```bash
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
  ```

**Script works locally but fails in CI**
- **Cause**: Environment differences
- **Solution**: Don't rely on user-specific env vars, use project-local tools

## Notes

- The `./do` script automatically discovers all executable files in `scripts/`
- Utility scripts should be prefixed with `_` to hide them from help
- Commands run from the project root directory context
- Keep commands focused on single responsibilities
- Document complex scripts with additional comments

## Examples

### Simple Command
```bash
#!/bin/bash
# Clean build artifacts and caches

rm -rf dist/
rm -rf node_modules/.vite/
echo "Build artifacts cleaned"
```

### Command with Arguments
```bash
#!/bin/bash
# Deploy to specified environment (usage: ./do deploy staging)

ENV="${1:-staging}"

echo "Deploying to $ENV..."
./do build
./scripts/_deploy-to-env "$ENV"
```

### Command Using Common Utilities
```bash
#!/bin/bash
# Run linters with auto-fix

source "$(dirname "$0")/_common"

run_step "ESLint" "pnpm eslint --fix ."
run_step "Prettier" "pnpm prettier --write ."
```

## References

- [Contributing Guide](../../rules-code/contributing.md) - Task runner overview
- [Existing Scripts](../../../scripts/) - Examples to follow
- [`./do` wrapper](../../../do) - Task runner implementation
