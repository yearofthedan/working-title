import type { Method } from '../domain/project';

export const snowflakeExtended: Method = {
  name: 'snowflake-extended',
  version: 1,
  rootKind: {
    id: 'story',
    facets: [{ id: 'one-sentence-summary', label: 'One-sentence summary' }],
  },
};
