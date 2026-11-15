import * as browser from 'vite-plus/test/browser';

const theBanner = browser.page.getByRole('banner', { includeHidden: true });

export const theHeader = () => ({
  header: theBanner,
  path: theBanner.getByRole('navigation', { name: 'Where you are' }),
  notice: theBanner.getByRole('status'),
  noticeReload: theBanner.getByRole('status').getByRole('button', { name: 'Reload' }),
});

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

export const yourProjects = () => ({
  startAProject: browser.page.getByRole('button', {
    name: 'Start a project',
    exact: true,
    includeHidden: true,
  }),
  said: browser.page.getByText(/will make a folder named/),
});

export const thePanelBesideTheGraph = () => ({ panels: browser.page.getByElement('aside') });
