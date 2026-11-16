import type { Locator } from 'vite-plus/test/browser';
import * as browser from 'vite-plus/test/browser';
import type { DirectoryPicker } from '../adapters/file-system-folders';
import { settled } from './driver';
import { anEmptyFolderNamed, theProjectsFolderName } from './folders';
import { laidOut } from './graph-page';
import { openTheApp, stopTheApp, type Staging } from './the-app';

export const thePage = async (width: number): Promise<Document> => {
  await browser.page.viewport(width, 900);
  stopTheApp();
  await laidOut();
  await settled();
  document.body.replaceChildren();
  const header = document.createElement('header');
  header.append(document.createElement('h1'));
  const main = document.createElement('main');
  main.style.width = `${width}px`;
  document.body.append(header, main);
  return document;
};

export const stagingTheAppIn = async (
  picker: DirectoryPicker,
  width: number,
  on: Staging,
): Promise<void> => {
  await anEmptyFolderNamed(theProjectsFolderName);
  await thePage(width);
  await openTheApp(document, on, picker);
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
  document.body.replaceChildren(document.createElement('header'));
  return document;
};

export const aPageWithoutAHeader = (): Document => {
  document.body.replaceChildren(document.createElement('main'));
  return document;
};
