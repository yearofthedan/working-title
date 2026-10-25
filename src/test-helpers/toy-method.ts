import type { Method } from '../domain/project';

export const toyMethod: Method = {
  name: 'toy',
  version: 1,
  rootKind: { id: 'root', label: 'Root', facets: [{ id: 'note', label: 'Note' }] },
  startingChildren: {
    kind: {
      id: 'item',
      label: 'Item',
      facets: [
        { id: 'title', label: 'Title' },
        { id: 'note', label: 'Note' },
      ],
    },
    count: 2,
  },
};
