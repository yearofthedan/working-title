import type { OpenProject, PieceView } from '../../application/project';
import { thePanel, type Panel } from './panel.dom';

export const theBeat: PieceView = {
  id: 'beat-2',
  name: 'Beat 2',
  facets: [{ id: 'one-sentence-summary', label: 'One-sentence summary', text: '' }],
  longFacets: [{ id: 'paragraph', label: 'Paragraph', text: '' }],
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
