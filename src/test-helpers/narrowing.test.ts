import { describe, expect, it } from 'vite-plus/test';
import { narrowing } from './narrowing';

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

describe('narrowing a tree to the parts a scenario asserted on', () => {
  const theSecondScene = [
    '- main:',
    '  - toolbar "Scenes under Beat 4":',
    '    - group "Scene 2":',
    '      - heading "Scene 2" [level=4]:',
    '        - button "Scene 2"',
    '      - text: List line',
    '      - textbox "List line": Maren bribes the harbourmaster',
  ];

  it('keeps a named part, what is under it and the lines it sits in', () => {
    expect(narrowing(tree, [{ role: 'group', name: 'Scene 2' }])).toEqual(theSecondScene);
  });

  it('keeps what it finds in the order the page draws it, whichever order it was reported in', () => {
    expect(
      narrowing(tree, [
        { role: 'group', name: 'Scene 2' },
        { role: 'heading', name: 'Scene 1' },
      ]),
    ).toEqual([
      '- main:',
      '  - toolbar "Scenes under Beat 4":',
      '    - group "Scene 1":',
      '      - heading "Scene 1" [level=4]:',
      '        - button "Scene 1"',
      ...theSecondScene.slice(2),
    ]);
  });

  it('matches a part whatever case it is named in', () => {
    expect(narrowing(tree, [{ role: 'group', name: 'scene 2' }])).toEqual(theSecondScene);
  });

  it('returns the tree as it stands when nothing is reported', () => {
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

  it('keeps a reported part that sits under another reported part', () => {
    expect(
      narrowing(tree, [
        { role: 'group', name: 'Scene 2' },
        { role: 'heading', name: 'Scene 2' },
      ]),
    ).toEqual(theSecondScene);
  });
});

describe('narrowing to a part inside another part', () => {
  const page = [
    '- main:',
    '  - group "Beat 2":',
    '    - textbox "One-sentence summary": Maren rows out before first light',
    '- complementary "Beat 2":',
    '  - heading "Beat 2" [level=2]',
    '  - button "Close"',
    '  - text: One-sentence summary',
    '  - textbox "One-sentence summary": Maren learns the sinking was no accident',
    '  - text: Paragraph',
    '  - textbox "Paragraph": Maren rows out',
  ];

  const theSummaryBeside = {
    role: 'textbox' as const,
    name: 'One-sentence summary',
    within: { role: 'complementary' as const, name: 'Beat 2' },
  };

  const cards = [
    '- main:',
    '  - group "The story" [current]:',
    '    - heading "The story" [level=3]',
    '    - text: One-sentence summary',
    '    - textbox "One-sentence summary": A widow hunts the man who sank her husband\u2019s ship',
    '  - group "Beat 2":',
    '    - heading "Beat 2" [level=3]:',
    '      - button "Beat 2"',
    '    - text: One-sentence summary',
    '    - textbox "One-sentence summary": Maren rows out before first light',
  ];

  it('keeps the lines it sits in and the line, and no sibling of the line', () => {
    expect(narrowing(page, [theSummaryBeside])).toEqual([
      '- complementary "Beat 2":',
      '  - textbox "One-sentence summary": Maren learns the sinking was no accident',
    ]);
  });

  it('keeps the lines a part sits in where the step did not name them', () => {
    expect(narrowing(page, [{ role: 'textbox', name: 'Paragraph' }])).toEqual([
      '- complementary "Beat 2":',
      '  - textbox "Paragraph": Maren rows out',
    ]);
  });

  it('keeps the part it sits in once where two parts sit in it, in the order the page draws them', () => {
    expect(
      narrowing(page, [
        { role: 'textbox', name: 'Paragraph', within: { role: 'complementary', name: 'Beat 2' } },
        theSummaryBeside,
      ]),
    ).toEqual([
      '- complementary "Beat 2":',
      '  - textbox "One-sentence summary": Maren learns the sinking was no accident',
      '  - textbox "Paragraph": Maren rows out',
    ]);
  });

  it('matches the part it sits in, and the line, however they are cased', () => {
    expect(
      narrowing(page, [
        {
          role: 'textbox',
          name: 'one-sentence summary',
          within: { role: 'complementary', name: 'beat 2' },
        },
      ]),
    ).toEqual([
      '- complementary "Beat 2":',
      '  - textbox "One-sentence summary": Maren learns the sinking was no accident',
    ]);
  });

  it('keeps the named card alone where the same label sits on more than one card', () => {
    expect(
      narrowing(cards, [
        {
          role: 'textbox',
          name: 'One-sentence summary',
          within: { role: 'group', name: 'Beat 2' },
        },
      ]),
    ).toEqual([
      '- main:',
      '  - group "Beat 2":',
      '    - textbox "One-sentence summary": Maren rows out before first light',
    ]);
  });

  it('keeps a card whose heading holds no name button, and no other card', () => {
    expect(
      narrowing(cards, [
        {
          role: 'textbox',
          name: 'One-sentence summary',
          within: { role: 'group', name: 'The story' },
        },
      ]),
    ).toEqual([
      '- main:',
      '  - group "The story" [current]:',
      '    - textbox "One-sentence summary": A widow hunts the man who sank her husband\u2019s ship',
    ]);
  });

  it('refuses a line it holds outside the part it names, so a record cannot silently empty', () => {
    expect(() =>
      narrowing(page, [
        {
          role: 'textbox',
          name: 'One-sentence summary',
          within: { role: 'complementary', name: 'Beat 9' },
        },
      ]),
    ).toThrow('no line reads textbox "One-sentence summary" inside complementary "Beat 9"');
  });

  it('refuses a part it names but holds no line of, so a record cannot silently empty', () => {
    expect(() =>
      narrowing(page, [
        { role: 'textbox', name: 'Narrative', within: { role: 'complementary', name: 'Beat 2' } },
      ]),
    ).toThrow('no line reads textbox "Narrative" inside complementary "Beat 2"');
  });
});

describe('narrowing to a part that names a role alone', () => {
  const banner = [
    '- banner:',
    '  - heading "working-title" [level=1]',
    '  - status:',
    '    - text: A new version is ready.',
    '    - button "Reload"',
  ];

  it('keeps the unnamed line of that role, what is under it and the lines it sits in', () => {
    expect(narrowing(banner, [{ role: 'status' }])).toEqual([
      '- banner:',
      '  - status:',
      '    - text: A new version is ready.',
      '    - button "Reload"',
    ]);
  });

  it('keeps a named line of that role too, since the name is not asked for', () => {
    expect(
      narrowing(
        [...tree, '- complementary "Beat 4":', '  - heading "Beat 4" [level=2]'],
        [{ role: 'group' }],
      ),
    ).toEqual(tree);
  });

  it('keeps every line of that role where the tree holds more than one', () => {
    const two = [
      '- banner:',
      '  - heading "working-title" [level=1]',
      '  - status:',
      '    - text: A new version is ready.',
      '- main:',
      '  - status:',
      '    - text: Saved.',
    ];

    expect(narrowing(two, [{ role: 'status' }])).toEqual([
      '- banner:',
      '  - status:',
      '    - text: A new version is ready.',
      '- main:',
      '  - status:',
      '    - text: Saved.',
    ]);
  });

  it('refuses a role the tree holds no line of, so a record cannot silently empty', () => {
    expect(() => narrowing(banner, [{ role: 'toolbar' }])).toThrow('no line reads toolbar');
  });
});
