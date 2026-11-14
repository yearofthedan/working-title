import { describe, expect, it } from 'vite-plus/test';
import { printScenarioFile, readScenarioFile, withObserved } from './scenario-file';

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
        'And again',
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
      [
        'Rule: A toy rule, one line of it.',
        '',
        '### Scenario: Two assertions',
        '',
        '```',
        'Given a toy',
        'When it runs',
        'Then it moves',
        '- group "A toy":',
        '  - text: A toy',
        'And the writer sees',
        '- main:',
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
    expect(scenarios[0]?.steps[2]?.observed).toEqual(['- main:', '  - text: A toy']);
  });

  it('reads a block as the one its step reported, and another step after it', () => {
    const { scenarios } = readScenarioFile(
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'Given a toy',
        'When it runs',
        'Then it moves',
        '- group "A toy":',
        '  - text: A toy',
        'And it stops',
        '- group "A toy":',
        '  - text: Stopped',
        '```',
        '',
      ].join('\n'),
    );

    const [given, when, then, and] = scenarios[0]?.steps ?? [];
    expect(given?.observed).toBeUndefined();
    expect(when?.observed).toBeUndefined();
    expect(then?.observed).toEqual(['- group "A toy":', '  - text: A toy']);
    expect(and?.observed).toEqual(['- group "A toy":', '  - text: Stopped']);
  });

  it('reads "And the writer sees" under a Then as a step of the file', () => {
    const file = [
      'Rule: A toy rule.',
      '',
      '### Scenario: A toy behaviour',
      '',
      '```',
      'Given a toy',
      'Then it moves',
      'And the writer sees',
      '- main:',
      '```',
      '',
    ].join('\n');

    const { scenarios } = readScenarioFile(file);
    expect(scenarios[0]?.steps.map((step) => step.keyword)).toEqual(['Given', 'Then', 'And']);
    expect(scenarios[0]?.steps[2]?.observed).toEqual(['- main:']);
    expect(printScenarioFile(readScenarioFile(file))).toBe(file);
  });

  it('reads a file that sees the app as the app, and prints it back unchanged', () => {
    const file = [
      'Rule: A toy rule.',
      'Sees: the app',
      '',
      '### Scenario: A toy behaviour',
      '',
      '```',
      'Given a toy',
      '```',
      '',
    ].join('\n');

    expect(readScenarioFile(file).sees).toBe('the app');
    expect(printScenarioFile(readScenarioFile(file))).toBe(file);
  });

  it('reads a file that serves a private build, and prints it back unchanged', () => {
    const file = [
      'Rule: A toy rule.',
      'Sees: the app',
      'Serves: a private build',
      '',
      '### Scenario: A toy behaviour',
      '',
      '```',
      'Given a toy',
      '```',
      '',
    ].join('\n');

    expect(readScenarioFile(file).serves).toBe('a private build');
    expect(printScenarioFile(readScenarioFile(file))).toBe(file);
  });

  it('reads the rule with a private build, and no Sees, as a file of its own', () => {
    const file = [
      'Rule: A toy rule.',
      'Serves: a private build',
      '',
      '### Scenario: A toy behaviour',
      '',
      '```',
      'Given a toy',
      '```',
      '',
    ].join('\n');

    expect(readScenarioFile(file).sees).toBeUndefined();
    expect(printScenarioFile(readScenarioFile(file))).toBe(file);
  });

  it('reads a But after a Then as one more outcome', () => {
    const { scenarios } = readScenarioFile(
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'Given a toy',
        'When it runs',
        'Then it moves',
        'But it stays a toy',
        '```',
        '',
      ].join('\n'),
    );

    expect(scenarios[0]?.steps.map((step) => step.keyword)).toEqual([
      'Given',
      'When',
      'Then',
      'But',
    ]);
  });

  it('reads what was observed after a scenario that ends on a But', () => {
    const { scenarios } = readScenarioFile(
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'Given a toy',
        'When it runs',
        'Then it moves',
        'But it stays a toy',
        '- main:',
        '  - text: A toy',
        '```',
        '',
      ].join('\n'),
    );

    expect(scenarios[0]?.steps[3]?.observed).toEqual(['- main:', '  - text: A toy']);
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
      'a file that sees anything but the app',
      [
        'Rule: A toy rule.',
        'Sees: the moon',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'Given a toy',
        '```',
        '',
      ],
      'sees "the app" or names nothing',
    ],
    [
      'a file that serves anything but a private build',
      [
        'Rule: A toy rule.',
        'Serves: a public build',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'Given a toy',
        '```',
        '',
      ],
      'serves "a private build" or names nothing',
    ],
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
      'a But before any Then',
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'Given a toy',
        'But it stays a toy',
        'When it runs',
        '```',
        '',
      ],
      'a "but" follows a Then',
    ],
    [
      'an action after a Then',
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
      'a When after a Then',
    ],
    [
      'an "and" with nothing before it',
      ['Rule: A toy rule.', '', '### Scenario: A toy behaviour', '', '```', 'And again', '```', ''],
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
      'a line under a Then that the runner would not print',
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
      'is neither a step nor what the runner prints',
    ],
    [
      'a block under a Given',
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'Given a toy',
        '- main:',
        'Then it moves',
        '```',
        '',
      ],
      'a Given is followed by no block, and only a Then is followed by what the runner observed',
    ],
    [
      'a block under a When',
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'When it runs',
        '- main:',
        '```',
        '',
      ],
      'a When is followed by no block, and only a Then is followed by what the runner observed',
    ],
    [
      'a block under an And under a When',
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'Given a toy',
        'When it runs',
        'And it keeps running',
        '- main:',
        '```',
        '',
      ],
      'a When is followed by no block, and only a Then is followed by what the runner observed',
    ],
    [
      'an And that reads as a Then but is not under one',
      [
        'Rule: A toy rule.',
        '',
        '### Scenario: A toy behaviour',
        '',
        '```',
        'Given a toy',
        'And it moves',
        '- main:',
        '```',
        '',
      ],
      'a Given is followed by no block, and only a Then is followed by what the runner observed',
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

describe('replacing what one scenario observed', () => {
  const two = [
    'Rule: A toy rule.',
    '',
    '### Scenario: One',
    '',
    '```',
    'Given a toy',
    'Then the writer sees',
    '- main:',
    '```',
    '',
    '### Scenario: Two',
    '',
    '```',
    'Given a toy',
    'Then the writer sees',
    '- main:',
    '  - text: As it was',
    '```',
    '',
  ].join('\n');

  const twoAssertions = [
    'Rule: A toy rule.',
    '',
    '### Scenario: Two assertions',
    '',
    '```',
    'Given a toy',
    'When it runs',
    'Then it moves',
    '- group "A toy":',
    'And it stops',
    '- group "A toy":',
    '```',
    '',
  ].join('\n');

  it('replaces one scenario, leaving the other and the steps as they were', () => {
    expect(withObserved(two, 'Two', [['- main:', '  - text: As it is now']])).toBe(
      two.replace('  - text: As it was', '  - text: As it is now'),
    );
  });

  it('gives a scenario observed text where it had none', () => {
    const withoutObserved = withObserved(two, 'One', [['- main:', '  - text: New']]);
    expect(withoutObserved).toContain('Then the writer sees\n- main:\n  - text: New');
  });

  it('gives each Then the block it was handed, in the order they are written', () => {
    expect(
      withObserved(twoAssertions, 'Two assertions', [
        ['- group "A toy":', '  - text: Moved'],
        ['- group "A toy":', '  - text: Stopped'],
      ]),
    ).toBe(
      twoAssertions
        .replace(
          '- group "A toy":\nAnd it stops',
          '- group "A toy":\n  - text: Moved\nAnd it stops',
        )
        .replace('- group "A toy":\n```', '- group "A toy":\n  - text: Stopped\n```'),
    );
  });

  it('refuses a number of blocks the scenario has no Thens for', () => {
    expect(() => withObserved(twoAssertions, 'Two assertions', [['- main:']])).toThrow(
      'Two assertions holds 2 Then-kind steps and was handed 1 block',
    );
  });

  it('keeps the line that says what the file sees', () => {
    const appRooted = two.replace('Rule: A toy rule.\n', 'Rule: A toy rule.\nSees: the app\n');

    expect(withObserved(appRooted, 'Two', [['- main:', '  - text: As it is now']])).toBe(
      appRooted.replace('  - text: As it was', '  - text: As it is now'),
    );
  });

  it('refuses a scenario the file does not hold', () => {
    expect(() => withObserved(two, 'Three', [['- main:']])).toThrow(
      'holds no scenario named "Three"',
    );
  });
});
