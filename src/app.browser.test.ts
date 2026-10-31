import { describe, expect, it } from 'vite-plus/test';
import { startApp } from './app';
import { aPageWithoutAHeader, aPageWithoutAMain } from './test-helpers/staging';

describe('starting the app', () => {
  it('refuses a page with no main', async () => {
    await expect(startApp(aPageWithoutAMain())).rejects.toThrow('the page has no <main>');
  });

  it('refuses a page with no header', async () => {
    await expect(startApp(aPageWithoutAHeader())).rejects.toThrow('the page has no <header>');
  });
});
