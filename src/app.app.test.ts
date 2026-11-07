import { describe, expect, it } from 'vite-plus/test';
import { startApp } from './app';
import type { RawGlob } from './test-helpers/raw-glob';
import { playScenarioFiles } from './test-helpers/scenario-entry';
import {
  aPageWithoutAHeader,
  aPageWithoutAMain,
  aPageWithoutAnAside,
} from './test-helpers/staging';
import { vitestBrowserDriver } from './test-helpers/vitest-browser.driver';
import { graphScenarioSteps } from './ui/graph/graph.harness';

describe('starting the app', () => {
  it('refuses a page with no main', async () => {
    await expect(startApp(aPageWithoutAMain())).rejects.toThrow('the page has no <main>');
  });

  it('refuses a page with no header', async () => {
    await expect(startApp(aPageWithoutAHeader())).rejects.toThrow('the page has no <header>');
  });

  it('refuses a page with no aside to open a piece beside', async () => {
    await expect(startApp(aPageWithoutAnAside())).rejects.toThrow('the page has no <aside>');
  });
});

const files = (import.meta as unknown as RawGlob).glob('/src/scenarios/*.approved.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

playScenarioFiles(files, () => vitestBrowserDriver(undefined, 'page'), graphScenarioSteps);
