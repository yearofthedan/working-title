import * as browser from 'vite-plus/test/browser';
import { startApp } from '../app';

export const thePage = async (width: number): Promise<void> => {
  await browser.page.viewport(width, 900);
  document.body.replaceChildren();
  const header = document.createElement('header');
  header.append(document.createElement('h1'));
  const main = document.createElement('main');
  main.style.width = `${width}px`;
  document.body.append(header, main);
};

export const twoGraphs = async (): Promise<void> => {
  document.querySelector('main')!.setAttribute('aria-label', 'First graph');
  const page = document.createElement('div');
  const header = document.createElement('header');
  const main = document.createElement('main');
  main.setAttribute('aria-label', 'Second graph');
  main.style.width = '1440px';
  page.append(header, main);
  document.body.append(page);
  await startApp(page);
};

export const narrowThePane = (width: number): void => {
  document.querySelector('main')!.style.width = `${width}px`;
};

export const nothingFocused = (): void => {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
};

export const anExtraHeaderAbove = (): { given: HTMLElement; extra: HTMLElement } => {
  const given = document.querySelector<HTMLElement>('header')!;
  const extra = document.createElement('header');
  document.body.prepend(extra);
  return { given, extra };
};

export const theViewport = async (width: number, height: number): Promise<void> => {
  await browser.page.viewport(width, height);
};

export const altKeySeenFor = (key: string): boolean[] => {
  const seen: boolean[] = [];
  document.addEventListener('keydown', (event) => {
    if (event.key === key) seen.push(event.altKey);
  });
  return seen;
};

export const buttonsFocused = (): string[] => {
  const focused: string[] = [];
  document.addEventListener('focusin', (event) => {
    if (event.target instanceof HTMLElement && event.target.closest('button') !== null) {
      focused.push(event.target.textContent ?? '');
    }
  });
  return focused;
};

export const aPageWithoutAMain = (): Document => {
  document.body.replaceChildren(document.createElement('header'));
  return document;
};

export const aPageWithoutAHeader = (): Document => {
  document.body.replaceChildren(document.createElement('main'));
  return document;
};
