import type { Locator } from 'vite-plus/test/browser';

const textareaIn = (field: Locator): HTMLTextAreaElement => {
  const element = field.element();
  if (!(element instanceof HTMLTextAreaElement)) {
    throw new Error('this is not a field the writer types in');
  }
  return element;
};

export const caretOf = (field: Locator): number => textareaIn(field).selectionStart!;
