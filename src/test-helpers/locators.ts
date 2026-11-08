import * as browser from 'vite-plus/test/browser';
import type { Locator } from 'vite-plus/test/browser';

declare module 'vite-plus/test/browser' {
  interface LocatorSelectors {
    getByElement(css: string): Locator;
  }
}

browser.locators.extend({
  getByElement: (css: string) => `css=${css}`,
});
