import * as browser from 'vite-plus/test/browser';
import type { Locator } from 'vite-plus/test/browser';
import { bottomOf, topOf } from '../../test-helpers/box';
import { inThePage } from '../card/card.test-page';

const headerRowIn = (panel: Locator): HTMLElement => {
  const row = panel.element().querySelector('div.heading');
  if (!(row instanceof HTMLElement)) throw new Error('the panel draws no header row');
  return row;
};

export const thePanelOn = (name: string) => {
  const panel = browser.page.getByRole('complementary', { name, exact: true, includeHidden: true });
  return {
    panel,
    name: panel.getByRole('heading', { level: 2, includeHidden: true }),
    header: browser.page.elementLocator(headerRowIn(panel)),
    actions: {
      close: panel.getByRole('button', { name: 'Close', exact: true, includeHidden: true }),
    },
    field: (label: string): Locator => panel.getByLabelText(label, { exact: true }),
  };
};

export const panelOf = (): HTMLElement => {
  const [panel] = inThePage(
    browser.page.getByRole('complementary', { includeHidden: true }).elements(),
  );
  if (panel === undefined) throw new Error('the page draws no panel');
  return panel;
};

export const fieldFor = (panel: HTMLElement, label: string): HTMLTextAreaElement => {
  const field = browser.page
    .getByLabelText(label, { exact: true })
    .elements()
    .find((element) => panel.contains(element));
  if (!(field instanceof HTMLTextAreaElement)) {
    throw new Error(`the panel has no ${label} field`);
  }
  return field;
};

export const closeButtonOf = (panel: HTMLElement): HTMLElement => {
  const button = inThePage(
    browser.page.getByRole('button', { name: /^Close$/i, includeHidden: true }).elements(),
  ).find((one) => panel.contains(one));
  if (button === undefined) throw new Error('the panel draws no Close button');
  return button;
};

export const keysHeardOnThePage = (): { readonly keys: readonly string[]; stop(): void } => {
  const keys: string[] = [];
  const listener = (event: KeyboardEvent): void => {
    keys.push(event.key);
  };
  document.addEventListener('keydown', listener);
  return { keys, stop: () => document.removeEventListener('keydown', listener) };
};

export const insideTheViewport = (element: Element): boolean =>
  topOf(element) >= 0 && bottomOf(element) <= window.innerHeight;
