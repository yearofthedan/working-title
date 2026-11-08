import type { Locator } from 'vite-plus/test/browser';
import type { OpenProject, PieceView } from '../../application/project';
import { thePanel, type Panel } from './panel.dom';

export const theBeat: PieceView = {
  id: 'beat-2',
  name: 'Beat 2',
  facets: [{ id: 'one-sentence-summary', label: 'One-sentence summary', text: '' }],
  longFacets: [
    { id: 'paragraph', label: 'Paragraph', text: '' },
    { id: 'page', label: 'Page', text: '' },
  ],
  children: [],
  childKind: 'Scene',
};

export interface PanelHooks {
  readonly elaborate?: OpenProject['elaborate'];
  readonly close?: () => void;
}

export const mountThePanel = (piece: PieceView = theBeat, hooks: PanelHooks = {}): Panel => {
  document.body.replaceChildren();
  const aside = document.createElement('aside');
  document.body.append(aside);
  const panel = thePanel(aside, {
    elaborate: hooks.elaborate ?? (() => Promise.resolve()),
    close: hooks.close ?? (() => undefined),
  });
  panel.open(piece);
  return panel;
};

export const theAppSetsAField = (panel: Panel, facetId: string, text: string): void => {
  panel.show(facetId, text);
};

export const theAppClosesThePanel = (panel: Panel): void => {
  panel.close();
};

const textareaIn = (field: Locator): HTMLTextAreaElement => {
  const element = field.element();
  if (!(element instanceof HTMLTextAreaElement)) {
    throw new Error('this is not a field the writer types in');
  }
  return element;
};

export const putTheCaretAt = (field: Locator, offset: number): void => {
  textareaIn(field).setSelectionRange(offset, offset);
};

export const putTheCaretAtTheEndOf = (field: Locator): void => {
  const textarea = textareaIn(field);
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);
};

export const focusWithoutScrolling = (field: Locator): void => {
  field.element().focus({ preventScroll: true });
};

export const scrollTo = (element: Locator, top: number): void => {
  element.element().scrollTop = top;
};

export const scrollToTheEnd = (element: Locator): void => {
  const scrolled = element.element();
  scrolled.scrollTop = scrolled.scrollHeight;
};
