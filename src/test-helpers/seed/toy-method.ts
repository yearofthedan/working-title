import type { Method } from '../../domain/project';

export const toyMethod: Method = {
  name: 'toy',
  version: 1,
  rootDefinition: {
    id: 'root',
    label: 'Root',
    facets: [{ id: 'note', label: 'Note' }],
    childDefinition: {
      id: 'item',
      label: 'Item',
      facets: [
        { id: 'title', label: 'Title' },
        { id: 'note', label: 'Note' },
        { id: 'body', label: 'Body', long: true },
      ],
      childDefinition: { id: 'child', label: 'Child', facets: [{ id: 'note', label: 'Note' }] },
    },
  },
};
