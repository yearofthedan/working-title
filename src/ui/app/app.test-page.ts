import * as browser from 'vite-plus/test/browser';

const theBanner = browser.page.getByRole('banner', { includeHidden: true });

export const theHeader = () => ({
  header: theBanner,
  notice: theBanner.getByRole('status'),
  noticeReload: theBanner.getByRole('status').getByRole('button', { name: 'Reload' }),
});
