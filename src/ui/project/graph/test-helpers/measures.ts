import { expect } from 'vite-plus/test';
import * as browser from 'vite-plus/test/browser';
import type { Locator } from 'vite-plus/test/browser';
import { boxOf } from '../../../../test-helpers/box';
import { nameOf } from '../card/card.test-page';
import { everyCard } from '../graph.test-page';

export const middleOf = (element: Element): number => {
  const { top, height } = element.getBoundingClientRect();
  return top + height / 2;
};

export const showsAllItsText = (field: Element): boolean =>
  field.clientHeight >= field.scrollHeight - 1;

export const centreOf = (part: Locator): number => {
  const { left, width } = part.element().getBoundingClientRect();
  return left + width / 2;
};

const insideMain = (element: Element): boolean => {
  const box = element.getBoundingClientRect();
  const pane = browser.page.getByRole('main').element().getBoundingClientRect();
  return (
    box.left >= pane.left &&
    box.right <= pane.right &&
    box.top >= pane.top &&
    box.bottom <= pane.bottom
  );
};

export const inMain = (part: Locator): boolean => insideMain(part.element());

export const boxes = (): readonly string[] =>
  everyCard().map((card) => `${nameOf(card)} ${boxOf(card)}`);

export const offScreenFocus = (): string[] => {
  const card = everyCard().find((one) => one.contains(document.activeElement));
  return card === undefined || insideMain(card) ? [] : [nameOf(card)];
};

export const expectRingDrawn = (part: Locator): Promise<void> =>
  expect.element(part).toHaveStyle({ outlineStyle: 'solid' });
