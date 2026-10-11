import { describe, expect, it } from 'vite-plus/test';
import { printScenarioFile, readScenarioFile } from './scenario-file';

describe('a scenario file', () => {
  it('prints back exactly what it read, several scenarios and an observed block included', () => {
    const files = [
      [
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
      ].join('\n'),
      [
        'Rule: A toy rule, one line of it.',
        '',
        '### Scenario: One behaviour',
        '',
        '```',
        'Given a toy',
        '```',
        '',
        '### Scenario: Another',
        '',
        '```',
        'When it runs',
        'Then it passes',
        '```',
        '',
      ].join('\n'),
    ];

    for (const file of files) {
      expect(printScenarioFile(readScenarioFile(file))).toBe(file);
    }
  });

  it('reads the rule, each scenario, its steps and what was observed', () => {
    const { rule, scenarios } = readScenarioFile(
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'Given a toy',
        'When it runs',
        'Then the writer sees',
        '- main:',
        '  - text: A toy',
        '```',
        '',
      ].join('\n'),
    );

    expect(rule).toBe('A toy rule.');
    expect(scenarios).toHaveLength(1);
    expect(scenarios[0]?.behaviour).toBe('A toy behaviour');
    expect(scenarios[0]?.steps.map((step) => step.keyword)).toEqual(['Given', 'When', 'Then']);
    expect(scenarios[0]?.observed).toEqual(['- main:', '  - text: A toy']);
  });

  it.each([
    ['nothing', [''], 'opens with "Rule: "'],
    ['a rule with no scenario', ['Rule: A toy rule.'], 'at least one scenario'],
    ['no rule line', ['A toy rule.', ''], 'opens with "Rule: "'],
    [
      'an empty rule',
      ['Rule: ', '', '### Scenario: A toy behaviour', '', '```', 'Given a toy', '```'],
      'A rule is one non-empty line',
    ],
    [
      'a step outside a block',
      ['Rule: A toy rule.', '', '### Scenario: A toy behaviour', '', 'Given a toy'],
      'outside its block',
    ],
    [
      'an unclosed block',
      ['Rule: A toy rule.', '', '### Scenario: A toy behaviour', '', '```', 'Given a toy'],
      'not closed',
    ],
    ['a line in no scenario', ['Rule: A toy rule.', '', 'stray', ''], 'outside its block'],
    [
      'steps out of order',
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'When it runs',
        'Given a toy',
        '```',
        '',
      ],
      'a Given after a When',
    ],
    [
      'a step after what was observed',
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'Given a toy',
        'Then the writer sees',
        '- main:',
        'When it runs',
        '```',
        '',
      ],
      'a step after what the runner observed',
    ],
    [
      'an "and" with nothing before it',
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        ' └ and again',
        '```',
        '',
      ],
      '"and" with no step before it',
    ],
    [
      'a scenario with no step',
      ['Rule: A toy rule.', '', '### Scenario: A toy behaviour', '', '```', '```', ''],
      'holds no step',
    ],
    [
      'a heading with no block',
      ['Rule: A toy rule.', '', '### Scenario: A toy behaviour', ''],
      'holds no step',
    ],
    [
      'a block with only observed text',
      ['Rule: A toy rule.', '', '### Scenario: A toy behaviour', '', '```', '- main:', '```', ''],
      'only a Then is followed by what the runner observed',
    ],
    [
      'a step with a typo for a keyword, after a Then',
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'Given a toy',
        'Then the writer sees',
        'Whne the writer types x',
        '```',
        '',
      ],
      'is neither a step nor what the runner prints',
    ],
    [
      'a line in what was observed that the runner would not print',
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'Given a toy',
        'Then the writer sees',
        '- main:',
        'stray',
        '```',
        '',
      ],
      'is not what the runner prints',
    ],
    [
      'a step that reads as a keyword but is not one',
      ['Rule: A toy rule.', '', '### Scenario: A toy behaviour', '', '```', 'Given', '```', ''],
      'reads as a step but is not one',
    ],
    [
      'a lowercase step',
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'given a toy',
        '```',
        '',
      ],
      'reads as a step but is not one',
    ],
    [
      'a step phrase of nothing but spaces',
      ['Rule: A toy rule.', '', '### Scenario: A toy behaviour', '', '```', 'Given   ', '```', ''],
      'A step phrase is one non-empty line',
    ],
    [
      'a blank line between steps',
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'Given a toy',
        '',
        'When it runs',
        '```',
        '',
      ],
      'is blank between steps',
    ],
    [
      'a second block with no scenario above it',
      ['Rule: A toy rule.', '', '```', 'Given a toy', '```', ''],
      'opens a block with no scenario heading above it',
    ],
    [
      'a scenario inside an open block',
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'Given a toy',
        '### Scenario: Another',
        '```',
        '',
      ],
      'inside a block that is still open',
    ],
    [
      'something after the backticks',
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```yaml',
        'Given a toy',
        '```',
        '',
      ],
      'has something after the backticks',
    ],
    [
      'carriage returns',
      [
        'Rule: A toy rule.\r',
        '',
        '### Scenario: A toy behaviour\r',
        '',
        '```\r',
        'Given a toy\r',
        '```\r',
        '',
      ],
      'holds a carriage return',
    ],
    [
      'a missing blank line after the rule',
      ['Rule: A toy rule.', '### Scenario: A toy behaviour', '', '```', 'Given a toy', '```', ''],
      'reads as it prints, and this one does not',
    ],
    [
      'a trailing blank line',
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'Given a toy',
        '```',
        '',
        '',
      ],
      'reads as it prints, and this one does not',
    ],
    [
      'no newline at the end',
      ['Rule: A toy rule.', '', '### Scenario: A toy behaviour', '', '```', 'Given a toy', '```'],
      'reads as it prints, and this one does not',
    ],
  ])('refuses %s', (_, lines, message) => {
    expect(() => readScenarioFile(lines.join('\n'))).toThrow(message);
  });
});
