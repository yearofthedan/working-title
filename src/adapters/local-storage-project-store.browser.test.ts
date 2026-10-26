import { describe, expect, it } from 'vite-plus/test';
import { elaborate, newProject, readProject, type Project } from '../domain/project';
import { snowflakeExtended } from '../methods/snowflake-extended';
import type { ProjectStore } from '../ports/project-store';
import { ids } from '../test-helpers/ids';
import type { RawGlob } from '../test-helpers/raw-glob';
import { projectStore } from './local-storage-project-store';

const key = 'working-title:project';
const summary = snowflakeExtended.rootKind.facets[0]?.id ?? '';
const listLine = snowflakeExtended.startingChildren.kind.childKind?.facets[0]?.id ?? '';
const saved = (): string | null => localStorage.getItem(key);

const opened = async (store: ProjectStore = projectStore()): Promise<Project | undefined> =>
  readProject(await store.load(), snowflakeExtended, ids());

const longSentences = (import.meta as unknown as RawGlob).glob(
  '/scripts/_screenshot-long-sentences.json',
  { query: '?raw', import: 'default', eager: true },
);

const eightScenes = (import.meta as unknown as RawGlob).glob(
  '/scripts/_screenshot-eight-scenes.json',
  { query: '?raw', import: 'default', eager: true },
);

const projectIn = (files: Record<string, string>): string => {
  const [raw] = Object.values(files);
  const state = JSON.parse(String(raw)) as {
    origins: { localStorage: { name: string; value: string }[] }[];
  };
  return (
    state.origins.flatMap(({ localStorage: items }) => items).find(({ name }) => name === key)
      ?.value ?? ''
  );
};

describe('the project in browser storage', () => {
  it('reads back what it saved, an empty sentence included', async () => {
    const store = projectStore();
    const sentence = "A widow hunts the man's ship";
    await store.save(elaborate(newProject(snowflakeExtended, ids()), 'id-1', summary, sentence));
    expect((await opened(store))?.pieces[0]?.facets[summary]).toBe(sentence);

    await store.save(elaborate(newProject(snowflakeExtended, ids()), 'id-1', summary, ''));
    expect((await opened(store))?.pieces[0]?.facets[summary]).toBe('');
  });

  it.each([
    [
      'line breaks, quotes and non-Latin characters',
      '«Начало» — it\'s "hers"\nand so it goes\n\n終わり',
    ],
    ['nothing at all', ''],
  ])('reads back %s unchanged', async (_, text) => {
    const store = projectStore();
    await store.save(elaborate(newProject(snowflakeExtended, ids()), 'id-1', summary, text));
    expect((await opened(store))?.pieces[0]?.facets[summary]).toBe(text);
  });

  it('reads nothing where nothing was saved', async () => {
    localStorage.clear();
    expect(await projectStore().load()).toBeUndefined();
  });

  it('opens a save in the shape version 1 wrote, keeping its sentence and adding its beats', async () => {
    const sentence = "A widow hunts the man's ship";
    localStorage.setItem(
      key,
      JSON.stringify({
        method: 'snowflake-extended',
        version: 1,
        root: { kind: 'story', facets: { [summary]: sentence } },
      }),
    );

    expect((await opened())?.pieces.map(({ facets }) => facets[summary] ?? '')).toEqual([
      sentence,
      '',
      '',
      '',
      '',
      '',
    ]);
  });

  it('opens the project the screenshots load, its story, Beat 2 and a scene holding long sentences', async () => {
    localStorage.setItem(key, projectIn(longSentences));

    const project = await opened();
    const story = project?.pieces.find(({ parent }) => parent === null);
    const beats = project?.pieces.filter(({ parent }) => parent === story?.id) ?? [];
    const beat2 = beats.find(({ order }) => order === 1);
    const scenes = project?.pieces.filter(({ parent }) => parent === beat2?.id) ?? [];

    expect(project?.pieces).toHaveLength(1 + snowflakeExtended.startingChildren.count + 2);
    expect((story?.facets[summary] ?? '').length).toBeGreaterThanOrEqual(150);
    expect((beat2?.facets[summary] ?? '').length).toBeGreaterThanOrEqual(150);
    expect((scenes[0]?.facets[listLine] ?? '').length).toBeGreaterThanOrEqual(150);
    expect(scenes[1]?.facets[listLine] ?? '').toBe('');
    expect(
      beats.filter(({ order }) => order !== 1).every(({ facets }) => facets[summary] === ''),
    ).toBe(true);
  });

  it('opens the eight-scenes screenshot project, its eight scenes under its fourth beat', async () => {
    localStorage.setItem(key, projectIn(eightScenes));

    const project = await opened();
    const story = project?.pieces.find(({ parent }) => parent === null);
    const beats = project?.pieces.filter(({ parent }) => parent === story?.id) ?? [];
    const beat4 = beats.find(({ order }) => order === 3);
    const scenes = project?.pieces.filter(({ parent }) => parent === beat4?.id) ?? [];

    expect(beats).toHaveLength(snowflakeExtended.startingChildren.count);
    expect((beat4?.facets[summary] ?? '').length).toBeGreaterThanOrEqual(150);
    expect(scenes.map(({ order }) => order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(scenes.filter(({ facets }) => (facets[listLine] ?? '').length >= 150)).toHaveLength(1);
    expect((scenes[1]?.facets[listLine] ?? '').length).toBeGreaterThanOrEqual(150);
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
    ['a root with no facets', '{"method":"m","version":1,"root":{"kind":"root"}}'],
    [
      'a facet that is not text',
      '{"method":"m","version":1,"root":{"kind":"root","facets":{"a":{"b":1}}}}',
    ],
    ['a piece with no id', '{"method":"m","version":2,"pieces":[{"kind":"beat","facets":{}}]}'],
  ])('refuses %s, leaving it where it is', async (_, stored) => {
    localStorage.setItem(key, stored);
    await expect(projectStore().load()).rejects.toThrow('is not a project');
    expect(saved()).toBe(stored);
  });
});
