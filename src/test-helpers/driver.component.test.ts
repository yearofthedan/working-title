import { describe, expect, it } from 'vite-plus/test';
import { printing } from './folder';
import { aPageFocusedOnSomethingUnnamed, anEmptyNovelFolder, theEntriesIn } from './staging';
import { vitestBrowserDriver } from './vitest-browser.driver';

describe('reading a tree while something unnamed holds focus', () => {
  const theDriver = () => vitestBrowserDriver(undefined, 'page');

  it('reads it unmarked, since the step asserted no focus', async () => {
    aPageFocusedOnSomethingUnnamed();

    expect(await theDriver().tree(false)).toEqual(['- paragraph']);
  });

  it('refuses it where the tree is marked', async () => {
    aPageFocusedOnSomethingUnnamed();

    await expect(theDriver().tree(true)).rejects.toThrow(
      'the element that holds focus is one whose role or name this reader cannot read: name it in focusAndCurrentIn',
    );
  });
});

describe('printing the place the writer chose', () => {
  const wroteInto = async (
    folder: FileSystemDirectoryHandle,
    name: string,
    text: string,
  ): Promise<void> => {
    const writable = await (await folder.getFileHandle(name, { create: true })).createWritable();
    await writable.write(text);
    await writable.close();
  };

  it('prints a folder and two files nested, by name, with each file\u2019s text as it stands', async () => {
    const place = await anEmptyNovelFolder();
    await wroteInto(place, 'project.json', '{ "title": "The Ferryman" }');
    const beats = await place.getDirectoryHandle('beats', { create: true });
    await wroteInto(beats, 'Beta.md', 'Two\n\nThen she rows out\n');
    await wroteInto(
      beats,
      'Alpha.md',
      '---\nkind: beat\n---\n\n## One-sentence summary\n\nMaren rows out\n',
    );

    expect(printing(await theEntriesIn(place))).toEqual([
      '- folder "beats":',
      '  - file "Alpha.md":',
      '    ---',
      '    kind: beat',
      '    ---',
      '',
      '    ## One-sentence summary',
      '',
      '    Maren rows out',
      '  - file "Beta.md":',
      '    Two',
      '',
      '    Then she rows out',
      '- file "project.json":',
      '  { "title": "The Ferryman" }',
    ]);
  });
});
