import type { Locator } from 'vite-plus/test/browser';

export const heightOf = (element: Element): number => element.getBoundingClientRect().height;

export const widthOf = (element: Element): number => element.getBoundingClientRect().width;

export const topOf = (element: Element): number => element.getBoundingClientRect().top;

export const bottomOf = (element: Element): number => element.getBoundingClientRect().bottom;

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
