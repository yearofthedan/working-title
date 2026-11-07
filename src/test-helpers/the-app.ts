import { startApp } from '../app';

const stops = new Map<ParentNode, () => void>();

export const stopTheApp = (): void => {
  for (const stop of stops.values()) stop();
  stops.clear();
};

export const openTheApp = async (page: ParentNode = document): Promise<void> => {
  stops.get(page)?.();
  stops.set(page, await startApp(page));
};

export const reopenTheApp = async (): Promise<void> => {
  stopTheApp();

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

  await openTheApp();
};
