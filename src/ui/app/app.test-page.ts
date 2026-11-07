import * as browser from 'vite-plus/test/browser';
import { inThePage } from '../card/card.test-page';

export const headerOf = (): HTMLElement => {
  const [header] = inThePage(browser.page.getByRole('banner').elements());
  if (header === undefined) throw new Error('the page draws no header');
  return header;
};

export const navigationIn = (header: HTMLElement): HTMLElement | null =>
  inThePage(browser.page.getByRole('navigation', { includeHidden: true }).elements()).find(
    (navigation) => header.contains(navigation),
  ) ?? null;
