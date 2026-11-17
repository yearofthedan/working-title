import type { Override } from './override';

export const domGlobals = [
  'document',
  'window',
  'getComputedStyle',
  'requestAnimationFrame',
  'ResizeObserver',
  'localStorage',
];

const theDomBelongsInADomFile =
  'The DOM belongs in a *.dom.ts beside this one, which holds the logic (docs/standards/testing.md).';

export const domInDomFiles: Override[] = [
  {
    files: ['src/ui/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...domGlobals.map((name) => ({ name, message: theDomBelongsInADomFile })),
      ],
    },
  },
  {
    files: [
      'src/ui/**/*.dom.ts',
      'src/ui/**/*.test.ts',
      'src/ui/**/*.test-page.ts',
      'src/ui/**/*.harness.ts',
    ],
    rules: { 'no-restricted-globals': 'off' },
  },
];
