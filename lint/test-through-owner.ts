import { findsByElement } from './find-elements';
import type { Override } from './override';

export const componentTestRefusals = [
  'querySelector',
  'querySelectorAll',
  'style',
  ...findsByElement,
];

const theComponentHasATestPage =
  'Reach the component’s markup through its *.test-page.ts beside its *.dom.ts, or stage the page in src/test-helpers/staging.ts (docs/standards/testing.md).';
const actsThroughTheWriter =
  'Act through the writer its language gives you, never userEvent (docs/standards/testing.md).';

export const testThroughTheirOwner: Override[] = [
  {
    files: ['src/**/*.component.test.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        ...componentTestRefusals.map((property) => ({
          property,
          message: theComponentHasATestPage,
        })),
        { object: 'browser', property: 'userEvent', message: actsThroughTheWriter },
      ],
      'no-restricted-globals': ['error', { name: 'document', message: theComponentHasATestPage }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'vite-plus/test/browser',
              importNames: ['userEvent'],
              message: actsThroughTheWriter,
            },
          ],
        },
      ],
    },
  },
];
