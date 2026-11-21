import * as browser from 'vite-plus/test/browser';

const theBanner = browser.page.getByRole('banner', { includeHidden: true });

export const theHeader = () => ({
  header: theBanner,
  heading: theBanner.getByRole('heading', { includeHidden: true }),
  path: theBanner.getByRole('navigation', { name: 'Where you are' }),
  notice: theBanner.getByRole('status'),
  noticeReload: theBanner.getByRole('status').getByRole('button', { name: 'Reload' }),
});

export const thePageHolds = (): readonly string[] =>
  [...document.body.children].map((child) => child.tagName.toLowerCase());

export const thePanelBesideTheGraph = () => ({ panels: browser.page.getByElement('aside') });
