import { describe, expect, it } from 'vite-plus/test';
import { aProjectWithScenesUnder, seededProject } from './seed';

describe('a seeded project', () => {
  it('holds the beats the seed names, in their place', () => {
    const { pieces } = seededProject({ beats: [{}, {}, {}] });

    expect(pieces.map(({ kind, order }) => `${kind} ${order}`)).toEqual([
      'story 0',
      'beat 0',
      'beat 1',
      'beat 2',
    ]);
  });

  it('puts a beat its scenes, one after another, and no scenes under the others', () => {
    const { pieces } = seededProject({ beats: [{}, { scenes: 2 }, {}] });
    const scenes = pieces.filter(({ kind }) => kind === 'scene');

    expect(pieces.map(({ kind }) => kind)).toEqual([
      'story',
      'beat',
      'beat',
      'beat',
      'scene',
      'scene',
    ]);
    expect(scenes.map(({ order }) => order)).toEqual([0, 1]);
    expect(scenes.map(({ parent }) => parent)).toEqual([pieces[2]!.id, pieces[2]!.id]);
  });

  it('refuses a seed whose world cannot hold what it asks for', () => {
    expect(() => seededProject({ beats: [{}, {}, {}, {}, {}, {}] })).toThrow(
      'a project starts with 5 beats, not 6',
    );
  });

  it('takes the beat the name says, by its place among the beats', async () => {
    const { pieces } = await aProjectWithScenesUnder('Beat 4', 1);

    expect(pieces.map(({ kind, order }) => `${kind} ${order}`)).toEqual([
      'story 0',
      'beat 0',
      'beat 1',
      'beat 2',
      'beat 3',
      'scene 0',
    ]);
    expect(pieces.at(-1)!.parent).toBe(pieces[4]!.id);
  });

  it('refuses a beat a project has none of', async () => {
    await expect(aProjectWithScenesUnder('Beat 9', 1)).rejects.toThrow('a project has no Beat 9');
  });
});
