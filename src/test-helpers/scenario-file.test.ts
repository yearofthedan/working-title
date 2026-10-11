import { describe, expect, it } from 'vite-plus/test';
import { printScenarioFile, readScenarioFile } from './scenario-file';

const toy = [
  'Rule: A toy rule, one line of it.',
  '',
  '### Scenario: A toy behaviour',
  '',
  '```',
  'Given a toy',
  'When it runs',
  ' └ and again',
  'Then the writer sees',
  '- main:',
  '  - text: A toy',
  '```',
  '',
].join('\n');

describe('a scenario file', () => {
  it('reads back exactly what it printed', () => {
    expect(printScenarioFile(readScenarioFile(toy))).toBe(toy);
  });

  it('reads the rule, each scenario, its steps and what was observed', () => {
    const { rule, scenarios } = readScenarioFile(toy);
    expect(rule).toBe('A toy rule, one line of it.');
    expect(scenarios).toHaveLength(1);
    expect(scenarios[0]?.behaviour).toBe('A toy behaviour');
    expect(scenarios[0]?.steps.map((step) => step.keyword)).toEqual([
      'Given',
      'When',
      'And',
      'Then',
    ]);
    expect(scenarios[0]?.observed).toEqual(['- main:', '  - text: A toy']);
  });

  it.each([
    ['nothing', '', 'opens with "Rule: "'],
    ['a rule with no scenario', 'Rule: A toy rule.\n', 'at least one scenario'],
    ['no rule line', 'A toy rule.\n', 'opens with "Rule: "'],
    [
      'a step outside a fenced block',
      'Rule: A toy rule.\n\n### Scenario: A toy behaviour\n\nGiven a toy\n',
      'outside its fenced block',
    ],
    [
      'an unclosed block',
      'Rule: A toy rule.\n\n### Scenario: A toy behaviour\n\n```\nGiven a toy\n',
      'not closed',
    ],
    ['a line in no scenario', 'Rule: A toy rule.\n\nstray\n', 'outside a scenario'],
    [
      'steps out of order',
      'Rule: A toy rule.\n\n### Scenario: A toy behaviour\n\n```\nWhen it runs\nGiven a toy\n```\n',
      'a Given after a When',
    ],
    [
      'a step after what was observed',
      'Rule: A toy rule.\n\n### Scenario: A toy behaviour\n\n```\nGiven a toy\n- main:\nThen it passes\n```\n',
      'a step after what the runner observed',
    ],
    [
      'an "and" with nothing before it',
      'Rule: A toy rule.\n\n### Scenario: A toy behaviour\n\n```\n └ and again\n```\n',
      '"and" with no step before it',
    ],
  ])('refuses %s', (_, text, message) => {
    expect(() => readScenarioFile(text)).toThrow(message);
  });
});
