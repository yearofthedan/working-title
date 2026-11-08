import type { Locator } from 'vite-plus/test/browser';
import { topOf } from './box';

export const textareaIn = (field: Locator): HTMLTextAreaElement => {
  const element = field.element();
  if (!(element instanceof HTMLTextAreaElement)) {
    throw new Error('this is not a field the writer types in');
  }
  return element;
};

export const caretOf = (field: Locator): number => textareaIn(field).selectionStart!;

export const caretLineBottomOf = (field: Element): number => {
  const padding = Number.parseFloat(getComputedStyle(field).paddingBottom);
  return topOf(field) + field.clientTop + field.scrollHeight - padding - field.scrollTop;
};
