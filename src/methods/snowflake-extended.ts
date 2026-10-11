import type { Method } from '../domain/project';

/** The method's own words live here, and nowhere else ([ADR 5](../docs/adr/0005-method-as-data.md)). */
export const snowflakeExtended: Method = {
  name: 'snowflake-extended',
  version: 1,
  rootKind: {
    id: 'story',
    facets: [{ id: 'one-sentence-summary', label: 'One-sentence summary' }],
  },
};
