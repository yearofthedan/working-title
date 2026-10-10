import { describe, expect, test } from 'vite-plus/test';
import { Scenario, printScenarios } from './scenario';

describe('printScenarios', () => {
  test('prints the rule, then each scenario under its heading in a fenced block', () => {
    const passes = new Scenario('A matching scenario passes')
      .Given('a scenario test whose printed scenario matches its .approved.md')
      .When('the tests run')
      .Then('it passes');
    const fails = new Scenario('A new scenario fails until approved')
      .Given('a scenario test with no .approved.md')
      .When('the tests run')
      .Then('it fails')
      .And('writes no .approved.md');

    expect(printScenarios('A scenario test passes only when it matches.', [passes, fails])).toBe(
      [
        'Rule: A scenario test passes only when it matches.',
        '',
        '### Scenario: A matching scenario passes',
        '',
        '```',
        'Given a scenario test whose printed scenario matches its .approved.md',
        'When the tests run',
        'Then it passes',
        '```',
        '',
        '### Scenario: A new scenario fails until approved',
        '',
        '```',
        'Given a scenario test with no .approved.md',
        'When the tests run',
        'Then it fails',
        ' └ and writes no .approved.md',
        '```',
        '',
      ].join('\n'),
    );
  });

  test('ends every line with LF alone', () => {
    const printed = printScenarios('A rule.', [new Scenario('One').Given('a thing')]);
    expect(printed).not.toContain('\r');
    expect(printed.endsWith('```\n')).toBe(true);
  });
});

describe('Scenario', () => {
  test.each([
    ['a line break', 'two\nlines'],
    ['a carriage return', 'two\rlines'],
    ['nothing', '  '],
  ])('refuses a phrase holding %s', (_, phrase) => {
    expect(() => new Scenario('One').Given(phrase)).toThrow('one non-empty line');
    expect(() => new Scenario(phrase)).toThrow('one non-empty line');
    expect(() => printScenarios(phrase, [])).toThrow('one non-empty line');
    expect(() => new Scenario('One').Given('a thing').And(phrase)).toThrow('one non-empty line');
  });

  test('refuses an "and" with no step before it', () => {
    expect(() => new Scenario('One').And('something')).toThrow('needs a Given, When or Then');
  });
});
