import * as browser from 'vite-plus/test/browser';

export const theStartRow = () => {
  const row = browser.page.getByElement('form');
  return {
    row,
    said: row.getByText(/(will make|made) a folder named/),
    title: row.getByLabelText('Title', { exact: true }),
    startProject: row.getByRole('button', {
      name: 'Start project',
      exact: true,
      includeHidden: true,
    }),
    cancel: row.getByRole('button', { name: 'Cancel', exact: true, includeHidden: true }),
    failed: row.getByRole('alert', { includeHidden: true }),
  };
};
