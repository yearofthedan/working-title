import type { NarrativeTemplate } from '@/features/shared/storySpec'

export const template: NarrativeTemplate = {
  id: 'snowflake-method-v1',
  version: '1.0.0',
  nameText: 'template.snowflake.name',
  descriptionText: 'template.snowflake.description',

  rootActions: [
    {
      labelText: 'root.actions.create_summary',
      trigger: 'append',
      targetType: 'step-summary',
    },
    {
      labelText: 'root.actions.add_genre',
      trigger: 'append',
      targetType: 'step-genre',
    },
    {
      labelText: 'root.actions.add_theme',
      trigger: 'append',
      targetType: 'step-theme',
    },
    {
      labelText: 'root.actions.add_audience',
      trigger: 'append',
      targetType: 'step-target-audience',
    },
  ],

  steps: [
    {
      id: 'step-genre',
      category: 'context',
      labelText: 'step.genre.label',
      instructionText: 'step.genre.instruction',
      isInitial: true,
      content: {
        format: 'plain',
        placeholderText: 'step.genre.placeholder',
      },
      ui: {
        visibility: ['sidebar'],
      },
      actions: [],
    },
    {
      id: 'step-target-audience',
      category: 'context',
      labelText: 'step.target_audience.label',
      instructionText: 'step.target_audience.instruction',
      isInitial: true,
      content: {
        format: 'plain',
        placeholderText: 'step.target_audience.placeholder',
      },
      ui: {
        visibility: ['sidebar'],
      },
      actions: [],
    },
    {
      id: 'step-theme',
      category: 'context',
      labelText: 'step.theme.label',
      instructionText: 'step.theme.instruction',
      isInitial: true,
      content: {
        format: 'plain',
        placeholderText: 'step.theme.placeholder',
      },
      ui: {
        visibility: ['sidebar'],
      },
      actions: [],
    },
    {
      id: 'step-summary',
      category: 'structure',
      stage: 1,
      labelText: 'step.summary.label',
      instructionText: 'step.summary.instruction',
      content: {
        format: 'rich',
        placeholderText: 'step.summary.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [
        {
          labelText: 'step.summary.actions.expand_to_storyline',
          trigger: 'advance',
          targetType: 'step-storyline',
        },
      ],
    },
    {
      id: 'step-storyline',
      category: 'structure',
      stage: 2,
      labelText: 'step.storyline.label',
      instructionText: 'step.storyline.instruction',
      content: {
        format: 'rich',
        placeholderText: 'step.storyline.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [
        {
          labelText: 'step.storyline.actions.add_character',
          trigger: 'append',
          targetType: 'step-char-summary',
        },
        {
          labelText: 'step.storyline.actions.add_minor_character',
          trigger: 'append',
          targetType: 'step-minor-char',
        },
        {
          labelText: 'step.storyline.actions.add_plot_synopsis',
          trigger: 'append',
          targetType: 'step-plot-synopsis',
        },
      ],
    },
    {
      id: 'step-char-summary',
      category: 'character',
      stage: 3,
      labelText: 'step.char_summary.label',
      instructionText: 'step.char_summary.instruction',
      content: {
        format: 'rich',
        placeholderText: 'step.char_summary.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [
        {
          labelText: 'step.char_summary.actions.deep_dive_major',
          trigger: 'advance',
          targetType: 'step-major-char',
        },
        {
          labelText: 'step.char_summary.actions.create_char_chart',
          trigger: 'advance',
          targetType: 'step-char-chart',
        },
      ],
    },
    {
      id: 'step-plot-synopsis',
      category: 'structure',
      stage: 3,
      labelText: 'step.plot_synopsis.label',
      instructionText: 'step.plot_synopsis.instruction',
      content: {
        format: 'rich',
        placeholderText: 'step.plot_synopsis.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [
        {
          labelText: 'step.plot_synopsis.actions.link_pov_character',
          trigger: 'connect',
          targetType: 'step-char-summary',
          meta: {
            required: true,
          },
        },
        {
          labelText: 'step.plot_synopsis.actions.expand_detailed_synopsis',
          trigger: 'advance',
          targetType: 'step-detailed-synopsis',
        },
      ],
    },
    {
      id: 'step-major-char',
      category: 'character',
      stage: 4,
      labelText: 'step.major_char.label',
      instructionText: 'step.major_char.instruction',
      content: {
        format: 'rich',
        placeholderText: 'step.major_char.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [],
    },
    {
      id: 'step-minor-char',
      category: 'character',
      stage: 4,
      labelText: 'step.minor_char.label',
      instructionText: 'step.minor_char.instruction',
      content: {
        format: 'rich',
        placeholderText: 'step.minor_char.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [],
    },
    {
      id: 'step-detailed-synopsis',
      category: 'structure',
      stage: 4,
      labelText: 'step.detailed_synopsis.label',
      instructionText: 'step.detailed_synopsis.instruction',
      content: {
        format: 'rich',
        placeholderText: 'step.detailed_synopsis.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      validations: [
        {
          rule: 'has_connection',
          targetType: 'step-major-char',
          severity: 'warning',
          messageText: 'validation.detailed_synopsis.missing_major_char',
        },
      ],
      actions: [
        {
          labelText: 'step.detailed_synopsis.actions.link_major_char',
          trigger: 'connect',
          targetType: 'step-major-char',
          meta: {
            required: true,
          },
        },
        {
          labelText: 'step.detailed_synopsis.actions.link_minor_char',
          trigger: 'connect',
          targetType: 'step-minor-char',
          meta: {
            required: false,
          },
        },
        {
          labelText: 'step.detailed_synopsis.actions.create_scene_overview',
          trigger: 'advance',
          targetType: 'step-scene-overview',
        },
      ],
    },
    {
      id: 'step-char-chart',
      category: 'character',
      stage: 5,
      labelText: 'step.char_chart.label',
      instructionText: 'step.char_chart.instruction',
      content: {
        format: 'rich',
        placeholderText: 'step.char_chart.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [],
    },
    {
      id: 'step-scene-overview',
      category: 'drafting',
      stage: 5,
      labelText: 'step.scene_overview.label',
      instructionText: 'step.scene_overview.instruction',
      content: {
        format: 'rich',
        placeholderText: 'step.scene_overview.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [
        {
          labelText: 'step.scene_overview.actions.link_pov',
          trigger: 'connect',
          targetType: 'step-char-summary',
          meta: {
            required: true,
          },
        },
        {
          labelText: 'step.scene_overview.actions.write_scene_expansion',
          trigger: 'append',
          targetType: 'step-scene-expansion',
        },
        {
          labelText: 'step.scene_overview.actions.write_chapter',
          trigger: 'append',
          targetType: 'step-chapter',
        },
      ],
    },
    {
      id: 'step-scene-expansion',
      category: 'drafting',
      stage: 6,
      labelText: 'step.scene_expansion.label',
      instructionText: 'step.scene_expansion.instruction',
      content: {
        format: 'rich',
        placeholderText: 'step.scene_expansion.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [
        {
          labelText: 'step.scene_expansion.actions.write_chapter',
          trigger: 'append',
          targetType: 'step-chapter',
        },
      ],
    },
    {
      id: 'step-chapter',
      category: 'drafting',
      stage: 7,
      labelText: 'step.chapter.label',
      instructionText: 'step.chapter.instruction',
      content: {
        format: 'rich',
        placeholderText: 'step.chapter.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [],
    },
  ],

  ui: {
    tracks: {
      main: ['step-summary'],
      characters: ['step-char-summary', 'step-minor-char'],
    },
    trackOffsets: {
      characters: 1,
    },
  },
}
