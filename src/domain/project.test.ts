import { describe, expect, it } from 'vite-plus/test';
import {
  elaborate,
  isProject,
  isProjectFromVersion1,
  newProject,
  readProject,
  type Method,
  type Project,
} from './project';

const ids = (): (() => string) => {
  let made = 0;
  return () => `id-${(made += 1)}`;
};

// A method shaped unlike Snowflake: a root kind that starts with two children of another kind.
const toyMethod: Method = {
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

const project = (): Project => newProject(toyMethod, ids());

const everyPiece = [
  { id: 'id-1', kind: 'root', parent: null, order: 0, facets: {} },
  { id: 'id-2', kind: 'item', parent: 'id-1', order: 0, facets: {} },
  { id: 'id-3', kind: 'item', parent: 'id-1', order: 1, facets: {} },
];

describe('newProject', () => {
  it('starts the project with a root, and the children it starts with, in order', () => {
    expect(project()).toEqual({ method: 'toy', version: 1, pieces: everyPiece });
  });
});

describe('elaborate', () => {
  it('changes the facet it names, and leaves every other piece and facet', () => {
    const typed = elaborate(
      elaborate(elaborate(project(), 'id-1', 'note', 'the root'), 'id-2', 'title', 'the first'),
      'id-3',
      'note',
      'the second',
    );
    expect(typed.pieces).toEqual([
      { id: 'id-1', kind: 'root', parent: null, order: 0, facets: { note: 'the root' } },
      { id: 'id-2', kind: 'item', parent: 'id-1', order: 0, facets: { title: 'the first' } },
      { id: 'id-3', kind: 'item', parent: 'id-1', order: 1, facets: { note: 'the second' } },
    ]);
  });
});

describe('readProject', () => {
  it('reads a project in the shape the app writes as it is', () => {
    const saved = elaborate(project(), 'id-2', 'title', 'the first');
    expect(readProject(saved, toyMethod, ids())).toEqual(saved);
  });

  it('reads a save in the shape version 1 wrote with its facets kept and its starting children added', () => {
    const saved = {
      method: 'toy',
      version: 1,
      root: { kind: 'root', facets: { note: 'the root' } },
    };
    expect(readProject(saved, toyMethod, ids())).toEqual({
      method: 'toy',
      version: 1,
      pieces: [
        { id: 'id-1', kind: 'root', parent: null, order: 0, facets: { note: 'the root' } },
        { id: 'id-2', kind: 'item', parent: 'id-1', order: 0, facets: {} },
        { id: 'id-3', kind: 'item', parent: 'id-1', order: 1, facets: {} },
      ],
    });
  });

  it("records the method's version, reading a save the version 1 wrote", () => {
    const atVersion2 = { ...toyMethod, version: 2 };
    const fromVersion1 = { method: 'toy', version: 1, root: { kind: 'root', facets: {} } };
    expect(readProject(fromVersion1, atVersion2, ids())?.version).toBe(2);
  });
});

describe('isProject', () => {
  it('reads a project, with its facets filled in or not', () => {
    expect(isProject(project())).toBe(true);
    expect(isProject(elaborate(project(), 'id-2', 'title', 'the first'))).toBe(true);
  });

  it.each([
    ['null', null],
    ['a number', 0],
    ['a string', 'x'],
    ['an array', []],
    ['an empty object', {}],
    ['no pieces', { method: 'toy', version: 1 }],
    ['pieces that are not a list', { method: 'toy', version: 1, pieces: {} }],
    ['a piece with no id', { method: 'toy', version: 1, pieces: [{ kind: 'item', facets: {} }] }],
    ['a piece with no kind', { method: 'toy', version: 1, pieces: [{ id: 'id-1', facets: {} }] }],
    ['no facets', { method: 'toy', version: 1, pieces: [{ id: 'id-1', kind: 'item' }] }],
    [
      'a facet that is not text',
      {
        method: 'toy',
        version: 1,
        pieces: [{ id: 'id-1', kind: 'item', facets: { note: { a: 1 } } }],
      },
    ],
    ['no method', { version: 1, pieces: [] }],
    ['no version', { method: 'toy', pieces: [] }],
    ['a piece that is nothing', { method: 'toy', version: 1, pieces: [null] }],
    [
      'facets that are nothing',
      { method: 'toy', version: 1, pieces: [{ id: 'id-1', kind: 'item', facets: null }] },
    ],
    [
      'a piece the writer filled in beside one that names no kind',
      {
        method: 'toy',
        version: 1,
        pieces: [
          { id: 'id-1', kind: 'item', facets: { note: 'the first' } },
          { id: 'id-2', facets: {} },
        ],
      },
    ],
  ])('refuses %s, which parses but is not a project', (_, value) => {
    expect(isProject(value)).toBe(false);
  });
});

describe('isProjectFromVersion1', () => {
  it('reads a save in the shape version 1 wrote, its facets filled in or not', () => {
    expect(
      isProjectFromVersion1({ method: 'toy', version: 1, root: { kind: 'root', facets: {} } }),
    ).toBe(true);
    expect(
      isProjectFromVersion1({
        method: 'toy',
        version: 1,
        root: { kind: 'root', facets: { note: 'the root' } },
      }),
    ).toBe(true);
  });

  it.each([
    ['null', null],
    ['a number', 0],
    ['a string', 'x'],
    ['an array', []],
    ['an empty object', {}],
    ['a root with no facets', { method: 'toy', version: 1, root: { kind: 'root' } }],
    ['a method that is not text', { method: 7, version: 1, root: { kind: 'root', facets: {} } }],
    ['no version', { method: 'toy', root: { kind: 'root', facets: {} } }],
    [
      'a version that is not a number',
      { method: 'toy', version: '1', root: { kind: 'root', facets: {} } },
    ],
    ['no root', { method: 'toy', version: 1 }],
    ['a root with no kind', { method: 'toy', version: 1, root: { facets: {} } }],
    [
      'a facet that is not text',
      { method: 'toy', version: 1, root: { kind: 'root', facets: { note: { a: 1 } } } },
    ],
    [
      'facets that are nothing',
      { method: 'toy', version: 1, root: { kind: 'root', facets: null } },
    ],
  ])('refuses %s, which parses but is not a save version 1 wrote', (_, value) => {
    expect(isProjectFromVersion1(value)).toBe(false);
  });
});
