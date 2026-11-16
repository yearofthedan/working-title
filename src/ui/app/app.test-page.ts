import * as browser from 'vite-plus/test/browser';

const theBanner = browser.page.getByRole('banner', { includeHidden: true });

export const theHeader = () => ({
  header: theBanner,
  path: theBanner.getByRole('navigation', { name: 'Where you are' }),
  notice: theBanner.getByRole('status'),
  noticeReload: theBanner.getByRole('status').getByRole('button', { name: 'Reload' }),
});

export const thePanelBesideTheGraph = () => ({ panels: browser.page.getByElement('aside') });
