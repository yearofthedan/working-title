import * as browser from 'vite-plus/test/browser';
import { startApp } from '../app';

export const thePage = async (width: number): Promise<void> => {
  await browser.page.viewport(width, 900);
  document.body.replaceChildren();
  const header = document.createElement('header');
  header.append(document.createElement('h1'));
  const main = document.createElement('main');
  main.style.width = `${width}px`;
  const column = document.createElement('div');
  column.className = 'column';
  column.append(header, main);
  const row = document.createElement('div');
  row.className = 'row';
  const panel = document.createElement('aside');
  row.append(column, panel);
  document.body.append(row);
};

export const twoGraphs = async (): Promise<void> => {
  document.querySelector('main')!.setAttribute('aria-label', 'First graph');
  const page = document.createElement('div');
  const header = document.createElement('header');
  const main = document.createElement('main');
  main.setAttribute('aria-label', 'Second graph');
  main.style.width = '1440px';
  const panel = document.createElement('aside');
  page.append(header, main, panel);
  document.body.append(page);
  await startApp(page);
};

export const narrowThePane = (width: number): void => {
  document.querySelector('main')!.style.width = `${width}px`;
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
