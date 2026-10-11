import { describe, expect, it } from 'vite-plus/test';
import { stepTable } from './steps';

const step = (phrase: string) => ({ keyword: 'When' as const, phrase });

describe('a step table', () => {
  it('plays the move whose phrase it matches, with what the phrase captured', async () => {
    const played: string[] = [];
    const table = stepTable({
      'a new project': () => {
        played.push('a new project');
      },
      'the writer types {text} into {facet}': ({ text, facet }) => {
        played.push(`${facet} <- ${text}`);
      },
    });

    await table.play(step('a new project'));
    await table.play(step('the writer types "a widow hunts" into the one-sentence summary'));
    expect(played).toEqual(['a new project', 'the one-sentence summary <- "a widow hunts"']);
  });

  it('refuses a phrase no move answers', async () => {
    const table = stepTable({ 'a new project': () => {} });
    await expect(table.play(step('a reloaded app'))).rejects.toThrow('No move answers the phrase');
  });

  it('refuses a phrase two moves answer', async () => {
    const table = stepTable({
      'a new project': () => {},
      'a {what} project': () => {},
    });
    await expect(table.play(step('a new project'))).rejects.toThrow('Two moves answer the phrase');
  });
});
