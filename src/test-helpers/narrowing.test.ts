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
    '- group "Scene 2":',
    '  - heading "Scene 2" [level=4]:',
    '    - button "Scene 2"',
    '  - text: List line',
    '  - textbox "List line": Maren bribes the harbourmaster',
  ];

  it('keeps a named part and what is under it, starting it at the left', () => {
    expect(narrowing(tree, [{ role: 'group', name: 'Scene 2' }])).toEqual(theSecondScene);
  });

  it('keeps what it finds in the order the page draws it, whichever order it was reported in', () => {
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
