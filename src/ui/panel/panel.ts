import type { FacetView, PieceView } from '../../application/project';

export const fieldsFor = (piece: PieceView): readonly FacetView[] => [
  ...piece.facets,
  ...piece.longFacets,
];
