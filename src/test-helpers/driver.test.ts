import { describe, expect, it } from 'vite-plus/test';
import { markingFocus, type Focus } from './driver';

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
