import { describe, expect, it } from 'vite-plus/test';
import { clicking, markingFocus, narrowing, type Finds, type Focus, type Point } from './driver';

const tree = [
  '- main:',
  '  - toolbar "Scenes under Beat 4":',
  '    - group "Scene 1":',
  '      - heading "Scene 1" [level=4]:',
  '        - button "Scene 1"',
  '      - text: List line',
  '      - textbox "List line"',
  '    - group "Scene 2":',
  '      - heading "Scene 2" [level=4]:',
  '        - button "Scene 2"',
  '      - text: List line',
  '      - textbox "List line": Maren bribes the harbourmaster',
];

const markedIn = (focus?: Focus): readonly string[] =>
  markingFocus(tree, focus).filter((line) => line.includes('[active]'));

describe('marking what holds focus in a tree', () => {
  it('marks the focused name, which only one line reads', () => {
    expect(
      markedIn({
        element: { role: 'button', name: 'Scene 2' },
        inside: { role: 'heading', name: 'Scene 2' },
      }),
    ).toEqual(['        - button "Scene 2" [active]']);
  });

  it('marks the focused facet field, which every card names the same', () => {
    expect(
      markedIn({
        element: { role: 'textbox', name: 'List line' },
        inside: { role: 'group', name: 'Scene 2' },
      }),
    ).toEqual(['      - textbox "List line" [active]: Maren bribes the harbourmaster']);
  });

  it('marks the focused card, which its row holds', () => {
    expect(
      markedIn({
        element: { role: 'group', name: 'Scene 1' },
        inside: { role: 'toolbar', name: 'Scenes under Beat 4' },
      }),
    ).toEqual(['    - group "Scene 1" [active]:']);
  });

  it('marks nothing when nothing inside main holds focus', () => {
    expect(markedIn()).toEqual([]);
  });

  it('leaves a tree with no focus as it was printed', () => {
    expect(markingFocus(tree, undefined)).toEqual(tree);
  });
});

describe('clicking a part', () => {
  const clicksSeenBy = async (at?: Point): Promise<unknown[]> => {
    const seen: unknown[] = [];
    const part = {
      click: (options?: unknown): Promise<void> => {
        seen.push(options);
        return Promise.resolve();
      },
    };
    const page = { getByRole: () => ({ ...part, getByRole: () => part }) } as unknown as Finds;
    await clicking(page)('group', 'Beat 2', undefined, at);
    return seen;
  };

  it('clicks at the point it is given', async () => {
    expect(await clicksSeenBy({ x: 0, y: 16 })).toEqual([{ position: { x: 0, y: 16 } }]);
  });

  it('clicks the middle of the part when it is given no point', async () => {
    expect(await clicksSeenBy()).toEqual([undefined]);
  });
});

describe('narrowing a tree to the parts a scenario asserted on', () => {
  const theSecondScene = [
    '- group "Scene 2":',
    '  - heading "Scene 2" [level=4]:',
    '    - button "Scene 2"',
    '  - text: List line',
    '  - textbox "List line": Maren bribes the harbourmaster',
  ];

  it('keeps a named part and what is under it, starting it at the left', () => {
    expect(narrowing(tree, [{ role: 'group', name: 'Scene 2' }])).toEqual(theSecondScene);
  });

  it('keeps what it finds in the order the page draws it, whichever order it was declared in', () => {
    expect(
      narrowing(tree, [
        { role: 'group', name: 'Scene 2' },
        { role: 'heading', name: 'Scene 1' },
      ]),
    ).toEqual(['- heading "Scene 1" [level=4]:', '  - button "Scene 1"', ...theSecondScene]);
  });

  it('matches a part whatever case it is named in', () => {
    expect(narrowing(tree, [{ role: 'group', name: 'scene 2' }])).toEqual(theSecondScene);
  });

  it('returns the tree as it stands when nothing is declared', () => {
    expect(narrowing(tree, [])).toEqual(tree);
  });

  it('refuses a tree holding none of the parts, so a record cannot silently empty', () => {
    expect(() => narrowing(tree, [{ role: 'group', name: 'Beat 9' }])).toThrow(
      'no line reads group "Beat 9"',
    );
  });

  it('refuses a part the tree does not hold, even where another was found', () => {
    expect(() =>
      narrowing(tree, [
        { role: 'group', name: 'Scene 2' },
        { role: 'group', name: 'Beat 9' },
      ]),
    ).toThrow('no line reads group "Beat 9"');
  });
});
