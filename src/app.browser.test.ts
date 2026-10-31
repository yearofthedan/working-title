import { describe, expect, it } from 'vite-plus/test';
import { startApp } from './app';

describe('starting the app', () => {
  it('refuses a page with no main', async () => {
    document.body.replaceChildren(document.createElement('header'));

    await expect(startApp(document)).rejects.toThrow('the page has no <main>');
  });

  it('refuses a page with no header', async () => {
    document.body.replaceChildren(document.createElement('main'));

    await expect(startApp(document)).rejects.toThrow('the page has no <header>');
  });
});
