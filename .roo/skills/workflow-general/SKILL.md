---
name: workflow-general
description: FOUNDATIONAL workflow for all code changes. Covers ./do scripts, linting, TypeScript safety rules, commit standards, and documentation philosophy. Load this before implementation-specific skills.
---

## When to Use

- Executing common tasks via `./do` scripts
- Making any code changes that require linting, building, or testing
- Documenting architectural decisions or domain logic
- Preparing commit messages and verifying changes
- Ensuring TypeScript type safety and code style consistency

## Task Execution & Tooling

### Standard Operating Procedure

- Prefer ./do scripts over direct pnpm or npm commands to ensure consistency.
- Run ./do without arguments to see a full list of available automation.

### Common Commands:

- ./do test — Executes the full test suite (Vite + Playwright).
- ./do lint — Runs static analysis and formatting.
- ./do build — Verifies the production build process.
- ./do dev — Launch a local dev server to interact with
- ./do launch-chromium-debug — Launch a instance of chromium to interface with
- ./do storybook — Launch storybook, to review component stories

### Manual Fallback

If a required task is not covered by a ./do script, follow this order:

1. Inspect the /scripts directory for relevant shell scripts.
2. Check package.json for existing pnpm scripts.
3. Execute the command directly if no wrapper exists.
4. Propose a new ./do script if the task is likely to be repeated (see: [Adding do scripts](references/adding-do-scripts.md))

## Documentation philosophy and techniques

- The primary source of documentation is our automated tests. Ensure they are readable and reflect current system behavior.
- Clean Code: Prioritize domain-driven naming for classes and methods to reduce the need for comments.
- Comments:
  - Avoid arbitrary comments that explain what the code does.
  - Use comments to explain why (e.g., 3rd party constraints, non-obvious business logic), only where tests and clean code are not enough.

## Delivery / Commits

### Precommit checklist

Before committing any code, you must:

1. Verify standards alignment with `./do lint`
2. Verify the app can build `./do build`.
3. Execute the full test suite (`./do test`) to ensure no regressions.
4. Review agent guidance documentation (see
  [Agents.md](/AGENTS.md), and [.roo](/.roo/)) and update where appropriate. This could include capturing and updating ADRs, a high level overview of the domain model, as well as technical debt / uncovered additional work, or additional context the user provided during the session, which you know will be useful for the future.
5. Analyze test coverage to identify any gaps in the new logic.

### Commit messages

Every commit must follow the imperative style and document the "why" behind the change. Use the commit body to explain the reasoning if the change is complex.

## Code style

### Path Aliases

Use aliases to keep imports clean and readable:

- `@/*` -> `src/*`

### TypeScript Type Safety

- **No Type Casting**: Avoid type casting (e.g., `as SomeType`) whenever possible.
- **No `any`**: NEVER use the `any` type. Whenever you use an `any` a puppy dies and you're responsible for it. Use real data, use builders, use `unknown` or `never`, or ask for help.

### Comments

- Avoid comments unless absolutely necessary.
- Prefer clear method and variable names over explanatory comments.
- Use comments only when:
  - Explaining non-obvious business logic or domain constraints.
  - Documenting workarounds for known issues.
  - Providing context that cannot be expressed through code structure.

## Conflict Resolution

If you identify a gap between the codebase reality and these instructions, immediately stop and verify the discrepancy with the user, rather than making assumptions. Potential outcomes could be

- tech debt which can be resolved as part of this story
- tech debt which you can document in order to be fixed in a future story
- no action, due to a false positive
