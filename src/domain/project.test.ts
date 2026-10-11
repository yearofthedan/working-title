import { describe, expect, test } from 'vite-plus/test';
import { isProject, newProject, type Method, type Project } from './project';

const method: Method = {
  name: 'snowflake-extended',
  version: 1,
  rootKind: {
    id: 'story',
    facets: [{ id: 'one-sentence-summary', label: 'One-sentence summary' }],
  },
};

const project: Project = {
  method: 'snowflake-extended',
  version: 1,
  root: { kindId: 'story', facets: { 'one-sentence-summary': 'A widow hunts' } },
};

describe('isProject', () => {
  test('reads a project, with a facet filled in or not', () => {
    expect(isProject(project)).toBe(true);
    expect(isProject(newProject(method))).toBe(true);
  });

  // Every value the app could find where it left a project: JSON.parse reads each of these
  // without error, so a parse alone never tells them from a project.
  test.each([
    ['null', null],
    ['a number', 0],
    ['a string', 'x'],
    ['an array', []],
    ['an empty object', {}],
    ['no facets', { method: 'snowflake-extended', version: 1, root: { kindId: 'story' } }],
    [
      'a facet that is not text',
      { ...project, root: { kindId: 'story', facets: { 'one-sentence-summary': { a: 1 } } } },
    ],
    ['no method', { version: 1, root: { kindId: 'story', facets: {} } }],
    ['no version', { method: 'snowflake-extended', root: { kindId: 'story', facets: {} } }],
  ])('refuses %s', (_, value) => {
    expect(isProject(value)).toBe(false);
  });
});
