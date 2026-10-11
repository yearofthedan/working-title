import { describe, expect, it } from 'vite-plus/test';
import { isProject, newProject, type Method, type Project } from './project';

// A toy method, shaped differently from the built-in one: the method's own words belong in
// `methods/`, and the core knows only kinds and facets ([ADR 5](../../docs/adr/0005-method-as-data.md)).
const method: Method = {
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
    expect(isProject(newProject(method))).toBe(true);
  });

  // Every value the app could find where it left a project: JSON.parse reads each of these
  // without error, so a parse alone never tells them from a project.
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
  ])('refuses %s', (_, value) => {
    expect(isProject(value)).toBe(false);
  });
});
