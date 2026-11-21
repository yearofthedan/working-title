import type { Locator } from 'vite-plus/test/browser';
import * as browser from 'vite-plus/test/browser';
import { settled } from './driver';
import { laidOut } from './graph-page';
import { stopTheApp } from './the-app';

export const thePage = async (width: number): Promise<Document> => {
  await browser.page.viewport(width, 900);
  stopTheApp();
  await laidOut();
  await settled();
  document.body.replaceChildren();
  const main = document.createElement('main');
  main.style.width = `${width}px`;
  document.body.append(main);
  return document;
};

export const root = (tag: string): HTMLElement => {
  const element = document.createElement(tag);
  document.body.replaceChildren(element);
  return element;
};

export const aPageFocusedOnSomethingUnnamed = (): Element => {
  stopTheApp();
  const unnamed = document.createElement('p');
  unnamed.tabIndex = 0;
  document.body.replaceChildren(unnamed);
  unnamed.focus();
  return document.body;
};

export const narrowThePane = (width: number): void => {
  document.querySelector('main')!.style.width = `${width}px`;
};

export const setStyleOn = (part: Locator, property: string, value: string): void => {
  part.element().style.setProperty(property, value);
};

export const theViewport = async (width: number, height: number): Promise<void> => {
  await browser.page.viewport(width, height);
};
export const aPageWithoutAMain = (): Document => {
  document.body.replaceChildren();
  return document;
};
