import * as browser from 'vite-plus/test/browser';

export const whereTheProjectsAreKept = () => {
  const screen = browser.page.getByRole('region', {
    name: 'Choose where to keep your projects',
    exact: true,
    includeHidden: true,
  });
  const refusal = screen.getByRole('alert', { includeHidden: true });
  return {
    screen,
    chooseAFolder: screen.getByRole('button', {
      name: 'Choose a folder…',
      exact: true,
      includeHidden: true,
    }),
    refusal,
    refusalIcon: refusal.getByElement('svg'),
  };
};
