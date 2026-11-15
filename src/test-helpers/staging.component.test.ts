import { afterEach, describe, expect, it } from 'vite-plus/test';
import { printing } from './folder';
import { anEmptyChosenPlace, theEntriesIn } from './staging';

describe('reading the place the writer chose', () => {
  afterEach(async () => {
    await anEmptyChosenPlace();
  });

  const wroteInto = async (
    folder: FileSystemDirectoryHandle,
    name: string,
    text: string,
  ): Promise<void> => {
    const writable = await (await folder.getFileHandle(name, { create: true })).createWritable();
    await writable.write(text);
    await writable.close();
  };

  it('reads a folder and two files nested, by name, with each file\u2019s text as it stands', async () => {
    const place = await anEmptyChosenPlace();
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

  it('empties the place, nested folders included', async () => {
    const place = await anEmptyChosenPlace();
    await wroteInto(place, 'project.json', '{}');
    const beats = await place.getDirectoryHandle('beats', { create: true });
    await wroteInto(beats, 'Beat 1.md', 'Maren rows out');

    expect(await theEntriesIn(await anEmptyChosenPlace())).toEqual([]);
  });
});
