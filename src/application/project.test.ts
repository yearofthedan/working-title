import { describe, expect, it } from 'vite-plus/test';
import { elaborate, newProject, type Project, type StoredProject } from '../domain/project';
import type { ProjectStore } from '../ports/project-store';
import { ids } from '../test-helpers/ids';
import { toyMethod } from '../test-helpers/toy-method';
import { openProject } from './project';

const rootName = 'Root';
const names = ['Item 1', 'Item 2'];
const typed = 'a title with "quotes" and a line\nbreak';

const storeOf = (project?: StoredProject): ProjectStore => ({
  load: async () => project,
  save: async () => undefined,
});

const copyingStore = (): ProjectStore & { saved: () => Project | undefined } => {
  let kept: Project | undefined;
  return {
    saved: () => kept,
    load: async () => structuredClone(kept),
    save: async (project) => {
      kept = structuredClone(project);
    },
  };
};

const item2Of = (children: readonly { readonly id: string }[]): { readonly id: string } => {
  const item = children[1];
  if (item === undefined) throw new Error('the project has no item 2');
  return item;
};

describe('opening a project', () => {
  it('lists the root and its children in order, named for what they are, each with an empty first facet', async () => {
    const project = await openProject(toyMethod, storeOf(), ids());
    expect(project.root.name).toBe(rootName);
    expect(project.root.children.map(({ name }) => name)).toEqual(names);
    expect(project.root.facets[0]?.text).toBe('');
    expect(project.root.children.map(({ facets }) => facets[0]?.text)).toEqual(['', '']);
  });

  it('reads the text the root holds', async () => {
    const started = elaborate(newProject(toyMethod, ids()), 'id-1', 'note', 'a note');
    const project = await openProject(toyMethod, storeOf(started), ids());
    expect(project.root.facets[0]?.text).toBe('a note');
  });

  it('lists the root first and its children by their order, however the store holds them', async () => {
    const started = newProject(toyMethod, ids());
    const shuffled = { ...started, pieces: [...started.pieces].reverse() };
    const project = await openProject(toyMethod, storeOf(shuffled), ids());
    expect(project.root.id).toBe('id-1');
    expect(project.root.name).toBe(rootName);
    expect(project.root.children.map(({ id, name }) => [id, name])).toEqual([
      ['id-2', 'Item 1'],
      ['id-3', 'Item 2'],
    ]);
  });

  it('refuses to open where the store cannot read what it holds', async () => {
    const store: ProjectStore = {
      load: async () => {
        throw new Error('holds something that is not a project');
      },
      save: async () => undefined,
    };
    await expect(openProject(toyMethod, store, ids())).rejects.toThrow('is not a project');
  });

  it('saves the text typed into a child under the ids the app mints, leaving the root and the other child alone', async () => {
    const store = copyingStore();
    const project = await openProject(toyMethod, store);
    await project.elaborate(item2Of(project.root.children).id, 'title', typed);
    expect(store.saved()?.pieces.map(({ facets }) => facets['title'] ?? '')).toEqual([
      '',
      '',
      typed,
    ]);
  });

  it('branches under a piece, saving the new piece after the ones already under it', async () => {
    const store = copyingStore();
    const opened = await openProject(toyMethod, store, ids());

    const one = await opened.branch('id-2');
    const two = await one.project.branch('id-2');
    const elsewhere = await two.project.branch('id-3');

    expect([one.added, two.added, elsewhere.added]).toEqual(['id-4', 'id-5', 'id-6']);
    expect(store.saved()?.pieces).toEqual([
      { id: 'id-1', kind: 'root', parent: null, order: 0, facets: {} },
      { id: 'id-2', kind: 'item', parent: 'id-1', order: 0, facets: {} },
      { id: 'id-3', kind: 'item', parent: 'id-1', order: 1, facets: {} },
      { id: 'id-4', kind: 'child', parent: 'id-2', order: 0, facets: {} },
      { id: 'id-5', kind: 'child', parent: 'id-2', order: 1, facets: {} },
      { id: 'id-6', kind: 'child', parent: 'id-3', order: 0, facets: {} },
    ]);
  });

  it('lists the new pieces under their own parent, in order, numbered within that parent', async () => {
    const opened = await openProject(toyMethod, storeOf(), ids());
    const one = await opened.branch('id-2');
    const two = await one.project.branch('id-2');
    const elsewhere = await two.project.branch('id-3');

    expect(two.project.root.children.map(({ name }) => name)).toEqual(names);
    expect(
      two.project.root.children.map(({ children }) => children.map(({ name }) => name)),
    ).toEqual([['Child 1', 'Child 2'], []]);
    expect(elsewhere.project.root.children[1]?.children.map(({ name }) => name)).toEqual([
      'Child 1',
    ]);
    expect(two.project.root.children[0]?.children[0]).toEqual({
      id: 'id-4',
      name: 'Child 1',
      facets: [{ id: 'note', label: 'Note', text: '' }],
      children: [],
    });
    expect(two.project.root.children.map(({ childKind }) => childKind)).toEqual(['Child', 'Child']);
  });

  it('reads the text back on the next open', async () => {
    const store = copyingStore();
    const first = await openProject(toyMethod, store, ids());
    await first.elaborate(item2Of(first.root.children).id, 'title', typed);

    const reopened = await openProject(toyMethod, store, ids());
    expect(reopened.root.children[1]?.facets[0]?.text).toBe(typed);
  });

  it('opens a version 1 save, its text kept and nothing under the pieces under the root', async () => {
    const saved = {
      method: 'toy',
      version: 1,
      root: { kind: 'root', facets: { note: 'the first' } },
    };

    const opened = await openProject(toyMethod, storeOf(saved), ids());

    expect(opened.root.name).toBe(rootName);
    expect(opened.root.children.map(({ name }) => name)).toEqual(names);
    expect(opened.root.facets[0]?.text).toBe('the first');
    expect(opened.root.children.flatMap(({ children: under }) => under)).toEqual([]);
  });
});
