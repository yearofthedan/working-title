import * as browser from 'vite-plus/test/browser';
import { stopTheApp } from './the-app';

export const thePage = async (width: number): Promise<Document> => {
  await browser.page.viewport(width, 900);
  stopTheApp();
  document.body.replaceChildren();
  const header = document.createElement('header');
  header.append(document.createElement('h1'));
  const main = document.createElement('main');
  main.style.width = `${width}px`;
  document.body.append(header, main, document.createElement('aside'));
  return document;
};

export const root = (tag: string): HTMLElement => {
  const element = document.createElement(tag);
  document.body.replaceChildren(element);
  return element;
};

export const narrowThePane = (width: number): void => {
  document.querySelector('main')!.style.width = `${width}px`;
};

export const theViewport = async (width: number, height: number): Promise<void> => {
  await browser.page.viewport(width, height);
};
export const aPageWithoutAMain = (): Document => {
  document.body.replaceChildren(document.createElement('header'));
  return document;
};

export const aPageWithoutAHeader = (): Document => {
  document.body.replaceChildren(document.createElement('main'));
  return document;
};

export const aPageWithoutAnAside = (): Document => {
  document.body.replaceChildren(document.createElement('header'), document.createElement('main'));
  return document;
};
