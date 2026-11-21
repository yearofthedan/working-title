import { describe, expect, it } from 'vite-plus/test';
import { ids } from '../test-helpers/ids';
import { toyMethod } from '../test-helpers/toy-method';
import { branch, elaborate, isProject, newProject, type Project } from './project';

const project = (): Project => newProject(toyMethod, ids());

const everyPiece = [
  { id: 'id-1', definition: 'root', parent: null, order: 0, facets: {} },
  { id: 'id-2', definition: 'item', parent: 'id-1', order: 0, facets: {} },
  { id: 'id-3', definition: 'item', parent: 'id-1', order: 1, facets: {} },
];

describe('newProject', () => {
  it('starts the project untitled, with a root, and the children it starts with, in order', () => {
    expect(project()).toEqual({ title: '', method: 'toy', version: 1, pieces: everyPiece });
  });

  it('starts the project under the title it is given', () => {
    expect(newProject(toyMethod, ids(), 'The Ferryman').title).toBe('The Ferryman');
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
      { id: 'id-1', definition: 'root', parent: null, order: 0, facets: { note: 'the root' } },
      { id: 'id-2', definition: 'item', parent: 'id-1', order: 0, facets: { title: 'the first' } },
      { id: 'id-3', definition: 'item', parent: 'id-1', order: 1, facets: { note: 'the second' } },
    ]);
  });
});

describe('branch', () => {
  it('adds a piece under its parent, after the pieces already under it, leaving every other piece alone', () => {
    const childDefinition = toyMethod.startingChildren.definition.childDefinition!;
    const one = branch(project(), 'id-2', childDefinition, 'id-4');
    const two = branch(one, 'id-2', childDefinition, 'id-5');

    expect(one.pieces).toEqual([
      ...everyPiece,
      { id: 'id-4', definition: 'child', parent: 'id-2', order: 0, facets: {} },
    ]);
    expect(two.pieces).toEqual([
      ...everyPiece,
      { id: 'id-4', definition: 'child', parent: 'id-2', order: 0, facets: {} },
      { id: 'id-5', definition: 'child', parent: 'id-2', order: 1, facets: {} },
    ]);
  });
});

describe('isProject', () => {
  it('reads a project, with its facets filled in or not', () => {
    expect(isProject(project())).toBe(true);
    expect(isProject(elaborate(project(), 'id-2', 'title', 'the first'))).toBe(true);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a number', 0],
    ['a string', 'x'],
    ['an array', []],
    ['an empty object', {}],
    ['no pieces', { title: '', method: 'toy', version: 1 }],
    ['pieces that are not a list', { title: '', method: 'toy', version: 1, pieces: {} }],
    [
      'a piece with no id',
      { title: '', method: 'toy', version: 1, pieces: [{ definition: 'item', facets: {} }] },
    ],
    [
      'a piece with no definition',
      { title: '', method: 'toy', version: 1, pieces: [{ id: 'id-1', facets: {} }] },
    ],
    [
      'no facets',
      { title: '', method: 'toy', version: 1, pieces: [{ id: 'id-1', definition: 'item' }] },
    ],
    [
      'a facet that is not text',
      {
        title: '',
        method: 'toy',
        version: 1,
        pieces: [{ id: 'id-1', definition: 'item', facets: { note: { a: 1 } } }],
      },
    ],
    ['no method', { title: '', version: 1, pieces: [] }],
    ['no version', { title: '', method: 'toy', pieces: [] }],
    ['no title', { method: 'toy', version: 1, pieces: [] }],
    ['a title that is not text', { title: 7, method: 'toy', version: 1, pieces: [] }],
    ['a piece that is nothing', { title: '', method: 'toy', version: 1, pieces: [null] }],
    [
      'facets that are nothing',
      {
        title: '',
        method: 'toy',
        version: 1,
        pieces: [{ id: 'id-1', definition: 'item', facets: null }],
      },
    ],
    [
      'a piece the writer filled in beside one that names no definition',
      {
        title: '',
        method: 'toy',
        version: 1,
        pieces: [
          { id: 'id-1', definition: 'item', facets: { note: 'the first' } },
          { id: 'id-2', facets: {} },
        ],
      },
    ],
  ])('refuses %s, which parses but is not a project', (_, value) => {
    expect(isProject(value)).toBe(false);
  });
});
