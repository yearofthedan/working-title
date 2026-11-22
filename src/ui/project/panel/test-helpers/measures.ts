import type { Locator } from 'vite-plus/test/browser';
import { heightOf, topOf } from '../../test-helpers/measures';

export const textHeightOf = (field: Element): number => {
  const style = getComputedStyle(field);
  const box = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'].reduce(
    (sum, side) => sum + Number.parseFloat(style[side as 'paddingTop']),
    0,
  );
  return heightOf(field) - box;
};

export const lineHeightOf = (element: Element): number =>
  Number.parseFloat(getComputedStyle(element).lineHeight);

export const scrollHeightOf = (element: Element): number => element.scrollHeight;

export const writerCanScroll = (element: Element): boolean =>
  ['auto', 'scroll'].includes(getComputedStyle(element).overflowY);

export const scrollTo = (element: Locator, top: number): void => {
  element.element().scrollTop = top;
};

export const focusWithoutScrolling = (field: Locator): void => {
  field.element().focus({ preventScroll: true });
};

export const whatCoversTheTopOf = (element: Locator): Element | null => {
  const { left, top, width } = element.element().getBoundingClientRect();
  return document.elementFromPoint(left + width / 2, Math.max(top, 0) + 1);
};

export const bottomOfTheTextIn = (located: Locator): number => {
  const field = located.element();
  const padding = Number.parseFloat(getComputedStyle(field).paddingBottom);
  return topOf(field) + field.clientTop + field.scrollHeight - padding - field.scrollTop;
};
