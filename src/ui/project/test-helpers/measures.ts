import { expect } from 'vite-plus/test';
import type { Locator } from 'vite-plus/test/browser';

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

const textareaIn = (field: Locator): HTMLTextAreaElement => {
  const element = field.element();
  if (!(element instanceof HTMLTextAreaElement)) {
    throw new Error('this is not a field the writer types in');
  }
  return element;
};

export const caretOf = (field: Locator): number => textareaIn(field).selectionStart!;

export const expectVisuallyShown = (part: Locator): Promise<void> =>
  expect.element(part).toHaveStyle({ opacity: '1' });

export const expectVisuallyHidden = (part: Locator): Promise<void> =>
  expect.element(part).toHaveStyle({ opacity: '0' });
