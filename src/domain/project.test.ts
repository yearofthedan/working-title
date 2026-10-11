import { describe, expect, it } from 'vite-plus/test';
import { isProject, newProject, type Method, type Project } from './project';

const toyMethod: Method = {
  name: 'toy',
  version: 1,
  rootKind: { id: 'root', facets: [{ id: 'note', label: 'Note' }] },
};

const project: Project = {
  method: 'toy',
  version: 1,
  root: { kind: 'root', facets: { note: 'First line' } },
};

describe('isProject', () => {
  it('reads a project, with a facet filled in or not', () => {
    expect(isProject(project)).toBe(true);
    expect(isProject(newProject(toyMethod))).toBe(true);
  });

  it.each([
    ['null', null],
    ['a number', 0],
    ['a string', 'x'],
    ['an array', []],
    ['an empty object', {}],
    ['no facets', { method: 'toy', version: 1, root: { kind: 'root' } }],
    [
      'a facet that is not text',
      { ...project, root: { kind: 'root', facets: { note: { a: 1 } } } },
    ],
    ['no method', { version: 1, root: { kind: 'root', facets: {} } }],
    ['no version', { method: 'toy', root: { kind: 'root', facets: {} } }],
  ])('refuses %s, which parses but is not a project', (_, value) => {
    expect(isProject(value)).toBe(false);
  });
});
