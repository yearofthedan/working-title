import * as browser from 'vite-plus/test/browser';

export const theHeader = () => ({
  header: browser.page.getByRole('banner', { includeHidden: true }),
});
