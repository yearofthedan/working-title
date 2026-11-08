import type { Method } from '../domain/project';

export const snowflakeExtended: Method = {
  name: 'snowflake-extended',
  version: 2,
  rootKind: {
    id: 'story',
    label: 'The story',
    facets: [{ id: 'one-sentence-summary', label: 'One-sentence summary' }],
  },
  startingChildren: {
    kind: {
      id: 'beat',
      label: 'Beat',
      plural: 'Beats',
      facets: [
        { id: 'one-sentence-summary', label: 'One-sentence summary' },
        { id: 'paragraph', label: 'Paragraph', long: true },
        { id: 'page', label: 'Page', long: true },
      ],
      childKind: {
        id: 'scene',
        label: 'Scene',
        plural: 'Scenes',
        facets: [
          { id: 'list-line', label: 'List line' },
          { id: 'narrative', label: 'Narrative', long: true },
          { id: 'prose', label: 'Prose', long: true },
        ],
      },
    },
    count: 5,
  },
};
