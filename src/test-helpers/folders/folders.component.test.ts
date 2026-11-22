import { afterEach, describe, expect, it } from 'vite-plus/test';
import { printing } from './folder';
import { anEmptyFolderNamed, theEntriesIn } from './folders';

describe('reading the folder the writer chose', () => {
  afterEach(async () => {
    await anEmptyFolderNamed('a folder the writer chose');
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
    const folder = await anEmptyFolderNamed('a folder the writer chose');
    await wroteInto(folder, 'project.json', '{ "title": "The Ferryman" }');
    const beats = await folder.getDirectoryHandle('beats', { create: true });
    await wroteInto(beats, 'Beta.md', 'Two\n\nThen she rows out\n');
    await wroteInto(
      beats,
      'Alpha.md',
      '---\ndefinition: beat\n---\n\n## One-sentence summary\n\nMaren rows out\n',
    );

    expect(printing(await theEntriesIn(folder))).toEqual([
      '- folder "beats":',
      '  - file "Alpha.md":',
      '    ---',
      '    definition: beat',
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

  it('empties the folder, nested folders included', async () => {
    const folder = await anEmptyFolderNamed('a folder the writer chose');
    await wroteInto(folder, 'project.json', '{}');
    const beats = await folder.getDirectoryHandle('beats', { create: true });
    await wroteInto(beats, 'Beat 1.md', 'Maren rows out');

    expect(await theEntriesIn(await anEmptyFolderNamed('a folder the writer chose'))).toEqual([]);
  });
});
