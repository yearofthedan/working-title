import type { Override } from './override';

const waitsOnThePage = {
  selector: `CallExpression:matches([callee.object.name='expect'][callee.property.name='poll'], [callee.object.name='vi'][callee.property.name=/^(waitFor|waitUntil)$/]):has(CallExpression[callee.property.name=/^(element|elements|tree)$/])`,
  message:
    'Wait on a page part with expect.element; poll only what the page doesn’t show (docs/standards/testing.md).',
};

const refusingToPoll = (files: string[]): Override => ({
  files,
  rules: { 'eslint-js/no-restricted-syntax': ['error', waitsOnThePage] },
});

export const waitOnThePage: Override[] = [
  refusingToPoll(['src/ui/**/*.harness.ts']),
  refusingToPoll(['src/**/*.component.test.ts']),
  refusingToPoll(['**/*.dsl.ts']),
];
