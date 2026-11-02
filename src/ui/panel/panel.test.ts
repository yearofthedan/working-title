import { describe, expect, it } from 'vite-plus/test';
import type { PieceView } from '../../application/project';
import { fieldsFor } from './panel';

const theBeat: PieceView = {
  id: 'beat-2',
  name: 'Beat 2',
  facets: [{ id: 'one-sentence-summary', label: 'One-sentence summary', text: 'the sentence' }],
  longFacets: [{ id: 'paragraph', label: 'Paragraph', text: 'the paragraph' }],
  children: [],
};

describe('the fields the panel shows', () => {
  it("reads the piece's short facets, then its long facets, each as it stands", () => {
    expect(fieldsFor(theBeat)).toEqual([
      { id: 'one-sentence-summary', label: 'One-sentence summary', text: 'the sentence' },
      { id: 'paragraph', label: 'Paragraph', text: 'the paragraph' },
    ]);
  });

  it('reads no field for a piece with none', () => {
    expect(fieldsFor({ ...theBeat, facets: [], longFacets: [] })).toEqual([]);
  });
});
