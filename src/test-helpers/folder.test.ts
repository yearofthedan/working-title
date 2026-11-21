import { describe, expect, it } from 'vite-plus/test';
import { namingIds, narrowing, printing, type Entry } from './folder';

const theFolder: readonly Entry[] = [
  {
    role: 'folder',
    name: 'The Ferryman',
    entries: [
      { role: 'file', name: 'project.json', text: ['{ "title": "The Ferryman" }'] },
      {
        role: 'folder',
        name: 'beats',
        entries: [
          {
            role: 'file',
            name: 'Beat 1.md',
            text: ['## One-sentence summary', '', 'Maren rows out before first light'],
          },
          {
            role: 'file',
            name: 'Beat 2.md',
            text: ['## One-sentence summary', '', 'Maren rows out'],
          },
        ],
      },
    ],
  },
  {
    role: 'folder',
    name: 'places',
    entries: [{ role: 'file', name: 'Harbour.md', text: ['A busy port'] }],
  },
];

describe('narrowing the folder to the entry a step reported', () => {
  it('keeps the folders from the root to the file, the file and its text, and no sibling', () => {
    expect(
      narrowing(printing(theFolder), [
        { role: 'file', name: 'Beat 2.md', within: { role: 'folder', name: 'beats' } },
      ]),
    ).toEqual([
      '- folder "The Ferryman":',
      '  - folder "beats":',
      '    - file "Beat 2.md":',
      '      ## One-sentence summary',
      '',
      '      Maren rows out',
    ]);
  });

  it('keeps the folders from the root to the folder, the folder and everything under it', () => {
    expect(narrowing(printing(theFolder), [{ role: 'folder', name: 'beats' }])).toEqual([
      '- folder "The Ferryman":',
      '  - folder "beats":',
      '    - file "Beat 1.md":',
      '      ## One-sentence summary',
      '',
      '      Maren rows out before first light',
      '    - file "Beat 2.md":',
      '      ## One-sentence summary',
      '',
      '      Maren rows out',
    ]);
  });

  it('refuses a file the folder does not hold, so a record cannot silently empty', () => {
    expect(() =>
      narrowing(printing(theFolder), [
        { role: 'file', name: 'Beat 9.md', within: { role: 'folder', name: 'beats' } },
      ]),
    ).toThrow('no line reads file "Beat 9.md" inside folder "beats"');
  });

  it('refuses a file reported within a folder above its own, not only its parent', () => {
    expect(() =>
      narrowing(printing(theFolder), [
        { role: 'file', name: 'Beat 2.md', within: { role: 'folder', name: 'The Ferryman' } },
      ]),
    ).toThrow('no line reads file "Beat 2.md" inside folder "The Ferryman"');
  });
});

describe('naming the ids in a printed block', () => {
  it('names each UUID in the order it first appears, the same UUID by the same name', () => {
    expect(
      namingIds([
        'id: 3f2b1c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
        'parent: aa11bb22-cc33-4dd4-9ee5-ff6677889900',
        'definition: beat',
        'child: 3f2b1c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
      ]),
    ).toEqual([
      'id: placeholder_id_1',
      'parent: placeholder_id_2',
      'definition: beat',
      'child: placeholder_id_1',
    ]);
  });

  it('leaves text that is not a UUID alone', () => {
    expect(
      namingIds([
        'title: The Ferryman',
        'note: 3f2b1c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5 is one hex short of an id',
        'hash: 3f2b1c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d6e is longer than an id',
        'hash: a3f2b1c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d starts a hex digit early',
        'reference: id_1',
      ]),
    ).toEqual([
      'title: The Ferryman',
      'note: 3f2b1c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5 is one hex short of an id',
      'hash: 3f2b1c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d6e is longer than an id',
      'hash: a3f2b1c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d starts a hex digit early',
      'reference: id_1',
    ]);
  });
});
