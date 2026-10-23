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
      facets: [{ id: 'one-sentence-summary', label: 'One-sentence summary' }],
    },
    count: 5,
  },
};
