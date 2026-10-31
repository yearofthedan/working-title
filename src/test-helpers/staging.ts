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
