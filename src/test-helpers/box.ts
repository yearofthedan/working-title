import * as browser from 'vite-plus/test/browser';
import type { Locator } from 'vite-plus/test/browser';
import { nameOf } from '../ui/project/graph/card/card.test-page';
import { everyCard } from '../ui/project/graph/graph.test-page';

export const heightOf = (element: Element): number => element.getBoundingClientRect().height;

export const leftOf = (element: Element): number => element.getBoundingClientRect().left;

export const boxOf = (element: Element): string => {
  const { left, top, width, height } = element.getBoundingClientRect();
  return `${left} ${top} ${width} ${height}`;
};

export const widthOf = (element: Element): number => element.getBoundingClientRect().width;

export const topOf = (element: Element): number => element.getBoundingClientRect().top;

export const bottomOf = (element: Element): number => element.getBoundingClientRect().bottom;

export const rightOf = (element: Element): number => element.getBoundingClientRect().right;

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
