# 7. Playwright for the browser specs

Status: Accepted, 2026-10-10

## Context

What runs the specs that need the built app in a real browser: opening offline after the first load now, and each epic's demo later ([#18](https://github.com/yearofthedan/working-title/issues/18))?

- **The built app.** Only a build has the whole app in the service worker's precache ([development](https://vite-pwa-org.netlify.app/guide/development)), and opening offline means loading the app, cutting the network, and reloading the page.
- **Agents copy.** Every runner and config beside Vite+ is another pattern to copy wrongly ([ADR 6](0006-vite-plus-toolchain.md)).
- **Lock-in.** Every spec, and the writer driver #18 builds, is written against one runner's API.

## Options considered

| Option | The built app | Agents copy | Lock-in |
| --- | --- | --- | --- |
| Playwright | [Builds and serves the app](https://playwright.dev/docs/test-webserver) before the specs; a spec owns the page and [the context's network](https://playwright.dev/docs/api/class-browsercontext#browser-context-set-offline) | A second runner and config | Specs and the driver import `@playwright/test` |
| Vitest browser mode, inside Vite+ | Runs each test [inside an iframe](https://vitest.dev/guide/browser/#running-tests) of its own page, [served by the Vite dev server](https://vitest.dev/guide/browser/#browser-compatibility); reaching a build means a [custom command](https://vitest.dev/api/browser/commands#custom-playwright-commands) that opens a page through Playwright's `BrowserContext` | Vitest for the test and Playwright's API inside each command: two patterns either way | Specs import `vite-plus/test`, and the commands are written against Playwright's API |

## Decision

Specs that need the built app in a browser run in Playwright.

**The built app** decided it. Vitest browser mode runs each test inside a frame of its own page, so the test cannot itself be the page that loads the build, goes offline and reloads. Doing that from Vitest means a custom command that opens a page through Playwright's `BrowserContext` and drives it with Playwright's API, so the spec becomes Playwright code called through Vitest. That cancels the lead Vitest browser mode would have on **Agents copy**, since there are two patterns to learn either way, and on **Lock-in**, since the specs depend on Playwright's API either way. Vitest's docs say browser mode [does not replace a standalone end-to-end runner](https://vitest.dev/guide/browser/why#drawbacks).

## Consequences

`./do e2e` runs the browser specs and `./do check` runs them after the tests, so a first run downloads Chromium. A spec builds the app first, which makes it slower than a test, so behaviour that needs no build is tested in Vitest instead. Leaving Playwright means rewriting every spec and the writer driver. Today that is one spec; the cost grows with #18's driver and each epic's demo.

This record covers only specs of the built app. Tests that need a real browser but not a build, such as a component's behaviour or the time it takes to render, are left to the first story that needs one, and Vitest browser mode is a candidate there: a prototype of this app ran its component tests and a render-timing check in it.
