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

export const openTheApp = async (): Promise<void> => {
  await startApp(document);
};
