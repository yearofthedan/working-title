import type { OpenProject, PieceView } from '../../application/project';
import { root } from '../../test-helpers/staging';
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

export const theScene: PieceView = {
  id: 'scene-2',
  name: 'Scene 2',
  facets: [{ id: 'list-line', label: 'List line', text: '' }],
  longFacets: [
    { id: 'narrative', label: 'Narrative', text: '' },
    { id: 'prose', label: 'Prose', text: '' },
  ],
  children: [],
};

export interface PanelHooks {
  readonly elaborate?: OpenProject['elaborate'];
  readonly close?: () => void;
}

export const mountThePanel = (piece: PieceView = theBeat, hooks: PanelHooks = {}): Panel => {
  const panel = thePanel(root('aside'), {
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
