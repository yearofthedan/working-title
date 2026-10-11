import { describe, expect, it } from 'vite-plus/test';
import { newProject } from '../domain/project';
import { snowflakeExtended } from '../methods/snowflake-extended';
import { projectStore } from './local-storage-project-store';

const key = 'working-title:project';
const summary = snowflakeExtended.rootKind.facets[0]?.id ?? '';
const saved = (): string | null => localStorage.getItem(key);

describe('the project in browser storage', () => {
  it('reads back what it saved, an empty sentence included', async () => {
    const store = projectStore();
    const typed = { ...newProject(snowflakeExtended) };
    await store.save({
      ...typed,
      root: { ...typed.root, facets: { [summary]: "A widow hunts the man's ship" } },
    });
    expect((await store.load())?.root.facets[summary]).toBe("A widow hunts the man's ship");

    await store.save({ ...typed, root: { ...typed.root, facets: { [summary]: '' } } });
    expect((await store.load())?.root.facets[summary]).toBe('');
  });

  it.each([
    [
      'line breaks, quotes and non-Latin characters',
      '«Начало» — it\'s "hers"\nand so it goes\n\n終わり',
    ],
    ['nothing at all', ''],
  ])('reads back %s unchanged', async (_, text) => {
    const store = projectStore();
    const project = newProject(snowflakeExtended);
    await store.save({ ...project, root: { ...project.root, facets: { [summary]: text } } });
    expect((await store.load())?.root.facets[summary]).toBe(text);
  });

  it('reads nothing where nothing was saved', async () => {
    localStorage.clear();
    expect(await projectStore().load()).toBeUndefined();
  });

  it('refuses text that is not JSON, leaving it where it is', async () => {
    localStorage.setItem(key, '{not json');
    await expect(projectStore().load()).rejects.toThrow();
    expect(saved()).toBe('{not json');
  });

  it.each([
    ['null', 'null'],
    ['an empty object', '{}'],
    ['an array', '[]'],
    ['a project with no facets', '{"method":"m","version":1,"root":{"kind":"root"}}'],
    [
      'a facet that is not text',
      '{"method":"m","version":1,"root":{"kind":"root","facets":{"a":{"b":1}}}}',
    ],
  ])('refuses %s, leaving it where it is', async (_, stored) => {
    localStorage.setItem(key, stored);
    await expect(projectStore().load()).rejects.toThrow('is not a project');
    expect(saved()).toBe(stored);
  });
});
