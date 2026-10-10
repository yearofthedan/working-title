# 7. Playwright for the browser specs

Status: Accepted, 2026-10-10

## Context

What runs the specs that need the built app in a real browser: opening offline after the first load now, and each epic's demo and the speed checks later ([#18](https://github.com/yearofthedan/working-title/issues/18))?

- **The built app.** The service worker exists only in a build, and opening offline means loading the app, cutting the network, and reloading the page.
- **Agents copy.** Every runner and config beside Vite+ is another pattern to copy wrongly ([ADR 6](0006-vite-plus-toolchain.md)).
- **Lock-in.** Every spec, and the writer driver #18 builds, is written against one runner's API.

## Options considered

| Option | The built app | Agents copy | Lock-in |
| --- | --- | --- | --- |
| Playwright | [Builds and serves the app](https://playwright.dev/docs/test-webserver) before the specs; a spec owns the page and [the context's network](https://playwright.dev/docs/api/class-browsercontext#browser-context-set-offline) | A second runner and config | Specs and the driver import `@playwright/test` |
| Vitest browser mode, inside Vite+ | Runs tests [through the Vite dev server](https://vitest.dev/guide/browser/#browser-compatibility), [inside an iframe](https://vitest.dev/guide/browser/#running-tests) of its own page, so a spec cannot reload the app it tests | No second runner | Specs import `vite-plus/test`, and anything Vitest lacks is a [custom command](https://vitest.dev/api/browser/commands#custom-playwright-commands) written against Playwright anyway |

## Decision

Specs that need the built app in a browser run in Playwright, in `e2e/`. Every other test runs in Vitest inside Vite+.

**The built app** decided it: Vitest browser mode tests source modules from the dev server, inside a frame its own page controls, so it cannot load a build, go offline and reload. Vitest's docs say browser mode [does not replace a standalone end-to-end runner](https://vitest.dev/guide/browser/why#drawbacks). Vitest browser mode leads on **Agents copy**, and the cost is held down by keeping Playwright to `e2e/`, with one config. On **Lock-in** neither leads: going offline in Vitest browser mode would be a custom command written against Playwright's API.

## Consequences

`./do e2e` runs the browser specs and `./do check` runs them after the tests, so a first run downloads Chromium. A spec builds the app first, which makes it slower than a test, so behaviour that needs no browser is tested in Vitest instead. Leaving Playwright means rewriting every spec and the writer driver. Whether component tests that need a real browser use Vitest browser mode is left to the first story with a component.
