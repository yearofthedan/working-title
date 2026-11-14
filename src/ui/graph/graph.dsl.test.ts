import { describe, expect, it } from 'vite-plus/test';
import { recording, storyDrawn } from '../../test-helpers/recording';
import type { SeededProject } from '../../test-helpers/seed';
import { graphSteps, seesOn, writerOn } from './graph.dsl';

describe('the graph language', () => {
  it('clicks a piece where it is, without going to it through the path', async () => {
    const { calls, driver, opening, reads } = recording(storyDrawn);
    const click = graphSteps(writerOn(driver, opening), seesOn(driver, reads))[
      'the writer clicks {piece}'
    ]!;

    await click({ piece: 'Scene 1' });

    expect(calls).toEqual(['click heading "Scene 1" in group "Scene 1"']);
  });
});

describe('what a graph step returns', () => {
  it('returns the card whose sentence it reads', async () => {
    const { driver, reads } = recording(storyDrawn);
    const step = graphSteps(
      writerOn(driver, { fresh: async () => {}, reopen: async () => {} }),
      seesOn(driver, reads),
    )['{piece}\'s {facet} on its card reads "{text}"']!;

    expect(await step({ piece: 'The story', facet: 'One-sentence summary', text: '' })).toEqual({
      kind: 'part',
      parts: [{ role: 'group', name: 'The story' }],
    });
  });

  it('returns the part that holds focus, telling the runner to mark it', async () => {
    const { driver, reads } = recording(storyDrawn);
    const sees = seesOn({ ...driver, focusIs: async () => true }, reads);

    expect(await sees.focusIsOnTheName('Beat 4')).toEqual({
      kind: 'part',
      parts: [{ role: 'group', name: 'Beat 4' }],
      focus: true,
    });
    expect(await sees.focusIsIn('Beat 4', 'One-sentence summary')).toEqual({
      kind: 'part',
      parts: [{ role: 'group', name: 'Beat 4' }],
      focus: true,
    });
  });

  const box = { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 };
  const drawing = (current: boolean) => ({
    drawn: async () => [
      {
        name: 'Beat 4',
        kind: current ? ('current' as const) : ('chip' as const),
        current,
        box,
        row: 'Beats under The story',
      },
    ],
  });

  const aBox = (top: number, left: number) => ({
    top,
    bottom: top + 100,
    left,
    right: left + 240,
    width: 240,
    height: 100,
  });

  const theWorld = {
    drawn: async () => [
      {
        name: 'The story',
        kind: 'card' as const,
        current: false,
        box: aBox(100, 300),
        row: 'The story',
      },
      {
        name: 'Beat 1',
        kind: 'chip' as const,
        current: false,
        box: aBox(300, 0),
        row: 'Beats under The story',
      },
      {
        name: 'Beat 2',
        kind: 'current' as const,
        current: true,
        box: aBox(300, 300),
        row: 'Beats under The story',
      },
      {
        name: 'Scene 1',
        kind: 'card' as const,
        current: false,
        box: aBox(500, 0),
        row: 'Scenes under Beat 2',
      },
    ],
  };

  const rowOfScenes = [
    {
      name: 'Scene 2',
      kind: 'chip' as const,
      current: false,
      box: aBox(300, 600),
      row: 'Scenes under Beat 2',
    },
    {
      name: 'Scene 3',
      kind: 'chip' as const,
      current: false,
      box: aBox(300, 900),
      row: 'Scenes under Beat 2',
    },
  ];
  const twoChipsInOneRow = {
    drawn: async () => [
      {
        name: 'Scene 1',
        kind: 'current' as const,
        current: true,
        box: aBox(300, 0),
        row: 'Scenes under Beat 2',
      },
      ...rowOfScenes,
    ],
  };

  it('returns the card it checked as current, and not the row it shares', async () => {
    const { driver } = recording(storyDrawn);

    expect(await seesOn(driver, theWorld).currentIs('Beat 2')).toEqual({
      kind: 'part',
      parts: [{ role: 'group', name: 'Beat 2' }],
    });
  });

  it("returns the parent's card where it checked the piece above", async () => {
    const { driver } = recording(storyDrawn);

    expect(await seesOn(driver, theWorld).currentIs('Beat 2', { above: 'The story' })).toEqual({
      kind: 'part',
      parts: [
        { role: 'group', name: 'Beat 2' },
        { role: 'group', name: 'The story' },
      ],
    });
  });

  it('returns the row of the pieces under it, and not the row it shares with its siblings', async () => {
    const { driver } = recording(storyDrawn);

    expect(await seesOn(driver, theWorld).currentIs('Beat 2', { under: ['Scene 1'] })).toEqual({
      kind: 'part',
      parts: [
        { role: 'group', name: 'Beat 2' },
        { role: 'toolbar', name: 'Scenes under Beat 2' },
      ],
    });
  });

  it('returns the row of the pieces beside it', async () => {
    const { driver } = recording(storyDrawn);

    expect(await seesOn(driver, theWorld).currentIs('Beat 2', { beside: ['Beat 1'] })).toEqual({
      kind: 'part',
      parts: [
        { role: 'group', name: 'Beat 2' },
        { role: 'toolbar', name: 'Beats under The story' },
      ],
    });
  });

  it('reports a row once where it checked two pieces drawn in it', async () => {
    const { driver } = recording(storyDrawn);

    expect(
      await seesOn(driver, twoChipsInOneRow).currentIs('Scene 1', {
        beside: ['Scene 2', 'Scene 3'],
      }),
    ).toEqual({
      kind: 'part',
      parts: [
        { role: 'group', name: 'Scene 1' },
        { role: 'toolbar', name: 'Scenes under Beat 2' },
      ],
    });
  });

  it('returns the card that is current and holds focus, telling the runner to mark it', async () => {
    const { driver } = recording(storyDrawn);
    const sees = seesOn({ ...driver, focusIs: async () => true }, drawing(true));

    expect(await sees.becomesCurrentAndHasFocus('Beat 4')).toEqual({
      kind: 'part',
      parts: [{ role: 'group', name: 'Beat 4' }],
      focus: true,
    });
  });

  it('returns the card of a piece that is neither current nor holding focus', async () => {
    const { driver } = recording(storyDrawn);
    const sees = seesOn({ ...driver, focusIs: async () => false }, drawing(false));

    expect(await sees.isNoLongerCurrentAndHasNoFocus('Beat 4')).toEqual({
      kind: 'part',
      parts: [{ role: 'group', name: 'Beat 4' }],
      focus: true,
    });
  });

  it('refuses a piece that is not current, or whose card does not hold focus', async () => {
    const { driver } = recording(storyDrawn);

    await expect(
      seesOn({ ...driver, focusIs: async () => true }, drawing(false)).becomesCurrentAndHasFocus(
        'Beat 4',
      ),
    ).rejects.toThrow('the current piece is nothing, not Beat 4');

    await expect(
      seesOn({ ...driver, focusIs: async () => false }, drawing(true)).becomesCurrentAndHasFocus(
        'Beat 4',
      ),
    ).rejects.toThrow("the focus is not on Beat 4's card");
  });

  it('refuses a piece that is still current, or still holding focus', async () => {
    const { driver } = recording(storyDrawn);

    await expect(
      seesOn(
        { ...driver, focusIs: async () => false },
        drawing(true),
      ).isNoLongerCurrentAndHasNoFocus('Beat 4'),
    ).rejects.toThrow('Beat 4 is still the current piece');

    await expect(
      seesOn(
        { ...driver, focusIs: async () => true },
        drawing(false),
      ).isNoLongerCurrentAndHasNoFocus('Beat 4'),
    ).rejects.toThrow("the focus is still on Beat 4's card");
  });

  it('returns the piece it checked is no longer current', async () => {
    const { driver } = recording(storyDrawn);

    expect(await seesOn(driver, drawing(false)).isNoLongerCurrent('Beat 4')).toEqual({
      kind: 'part',
      parts: [{ role: 'group', name: 'Beat 4' }],
    });
  });

  it('refuses a piece that is still current', async () => {
    const { driver } = recording(storyDrawn);

    await expect(seesOn(driver, drawing(true)).isNoLongerCurrent('Beat 4')).rejects.toThrow(
      'Beat 4 is still the current piece',
    );
  });

  it('returns the card it checked as holding the current piece', async () => {
    const { driver } = recording(storyDrawn);

    expect(await seesOn(driver, drawing(true)).currentIs('Beat 4')).toEqual({
      kind: 'part',
      parts: [{ role: 'group', name: 'Beat 4' }],
    });
  });
});

describe('what only the app can play', () => {
  it.each(['one-sentence summary under beat 2', 'paragraph beside the graph'])(
    'refuses to type into "%s"',
    async (facet) => {
      const { calls, driver, opening } = recording(storyDrawn);
      const writer = writerOn(driver, opening);

      await expect(writer.types('Maren rows out', { piece: 'Beat 2', facet })).rejects.toThrow(
        `types needs the app's path or panel for "${facet}"`,
      );
      expect(calls).toEqual([]);
    },
  );
});

const shapeOf = (project: SeededProject): readonly string[] =>
  project.pieces.map((piece) => {
    const parent = project.pieces.findIndex((other) => other.id === piece.parent);
    return `${piece.kind} ${piece.order} ${piece.parent === null ? 'root' : parent}`;
  });

const twoBeats = ['story 0 root', 'beat 0 0', 'beat 1 0'];
const aBeatWithTwoScenes = [...twoBeats, 'scene 0 2', 'scene 1 2'];

describe('a seeded Given', () => {
  const played = async (
    phrase: string,
    vars: Record<string, string> = {},
  ): Promise<{ calls: readonly string[]; worlds: readonly (readonly string[])[] }> => {
    const { calls, driver, opening, reads, startFrom, started } = recording(storyDrawn);
    const step = graphSteps(writerOn(driver, opening, startFrom), seesOn(driver, reads))[phrase]!;

    await step(vars);

    return { calls, worlds: started.map(shapeOf) };
  };

  it('starts from the beats the words name, with the scenes under the beat they name', async () => {
    for (const beat of ['beat two', 'beat 2']) {
      expect(await played('a project with two scenes under {beat}', { beat })).toEqual({
        calls: [],
        worlds: [aBeatWithTwoScenes],
      });
    }
  });

  it('refuses a beat a project has none of', async () => {
    await expect(
      played('a project with two scenes under {beat}', { beat: 'beat nine' }),
    ).rejects.toThrow('a project has no beat nine');
  });

  it('starts from two beats and makes the first current', async () => {
    expect(await played('two beats, the first current with tab focus')).toEqual({
      calls: ['click heading "Beat 1" in group "Beat 1"'],
      worlds: [twoBeats],
    });
  });

  it('starts from a beat with two scenes and makes the beat current', async () => {
    const clicks = ['click heading "Beat 2" in group "Beat 2"'];
    for (const phrase of [
      'a current beat with two scenes',
      'a beat with two scenes, the beat current',
    ]) {
      expect(await played(phrase)).toEqual({ calls: clicks, worlds: [aBeatWithTwoScenes] });
    }
  });

  it('refuses when the writer was given no way to start from a seeded project', async () => {
    const { driver, opening, reads } = recording(storyDrawn);
    const step = graphSteps(writerOn(driver, opening), seesOn(driver, reads))[
      'two beats, the first current with tab focus'
    ]!;

    await expect(step({})).rejects.toThrow(
      'Only the page tier starts a scenario from a seeded world',
    );
  });
});
