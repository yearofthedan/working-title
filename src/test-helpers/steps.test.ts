import { describe, expect, it } from 'vite-plus/test';
import { stepTable } from './steps';

const step = (phrase: string) => ({ keyword: 'When' as const, phrase });

describe('a step table', () => {
  it('plays the action whose phrase it matches, with what the phrase captured', async () => {
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

  it('refuses a phrase nothing plays', async () => {
    const table = stepTable({ 'a new project': () => {} });
    await expect(table.play(step('a reloaded app'))).rejects.toThrow('Nothing plays the phrase');
  });

  it('refuses a phrase two actions play', async () => {
    const table = stepTable({
      'a new project': () => {},
      'a {what} project': () => {},
    });
    await expect(table.play(step('a new project'))).rejects.toThrow('2 actions play the phrase');
  });

  it.each([
    ['a repeated placeholder', { 'types {text} into {text}': () => {} }, 'uses {text} twice'],
    ['a placeholder that is not a name', { 'types {1x}': () => {} }, 'placeholder reads {name}'],
    ['a placeholder holding a dash', { 'types {some-text}': () => {} }, 'placeholder reads {name}'],
    ['a stray brace', { 'types {text': () => {} }, 'placeholder reads {name}'],
  ])('refuses %s', (_, actions, message) => {
    expect(() => stepTable(actions)).toThrow(message);
  });
});
