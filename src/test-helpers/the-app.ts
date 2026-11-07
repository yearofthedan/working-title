import { startApp } from '../app';

export const openTheApp = async (): Promise<void> => {
  await startApp(document);
};

export const reopenTheApp = async (): Promise<void> => {
  const main = document.querySelector<HTMLElement>('main');
  const width = main?.style.width ?? '';
  const label = main?.getAttribute('aria-label');

  const header = document.createElement('header');
  header.append(document.createElement('h1'));
  const freshMain = document.createElement('main');
  freshMain.style.width = width;
  if (label !== null && label !== undefined) freshMain.setAttribute('aria-label', label);
  const aside = document.createElement('aside');

  document.querySelector('header')?.replaceWith(header);
  main?.replaceWith(freshMain);
  document.querySelector('aside')?.replaceWith(aside);

  await startApp(document);
};
