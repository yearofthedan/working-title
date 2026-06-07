# Inspecting the Running App

The agent drives a browser with the Playwright agent CLI (`playwright-cli`), installed globally in the dev container. Its usage skill lives in [`.claude/skills/playwright-cli`](../../.claude/skills/playwright-cli/SKILL.md).

## Targets

- **App** — `./do dev` serves Vite at http://localhost:5173
- **Storybook** — `./do storybook` serves at http://localhost:6006

## Config

[`.playwright/cli.config.json`](../../.playwright/cli.config.json) launches chromium with `--no-sandbox` (required in the container). Session snapshots and console logs are written to `.playwright-cli/` (gitignored).

## Canvas vs. UI

The editor is canvas/SVG-heavy, which the accessibility snapshot represents poorly. Use `playwright-cli screenshot` for the canvas itself, and `playwright-cli snapshot` for the surrounding panels, toolbars, and dialogs.

## Browser binary

If `playwright-cli open` reports a missing browser, install the build its bundled Playwright expects:

```bash
node "$(npm root -g)/@playwright/cli/node_modules/playwright-core/cli.js" install chromium
```
