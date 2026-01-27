import type { ProcessTemplate } from '@/features/process-templates/processTemplate'

export const template: ProcessTemplate = {
  id: 'snowflake-method-v1',
  version: '1.0.0',
  nameText: 'template.name',
  descriptionText: 'template.description',

  rootActions: [
    {
      id: 'root-action-add-summary',
      labelText: 'template.root.actions.create_summary',
      trigger: 'append',
      targetType: 'step-summary',
    },
    {
      id: 'root-action-add-genre',
      labelText: 'template.root.actions.add_genre',
      trigger: 'append',
      targetType: 'step-genre',
    },
    {
      id: 'root-action-add-theme',
      labelText: 'template.root.actions.add_theme',
      trigger: 'append',
      targetType: 'step-theme',
    },
    {
      id: 'root-action-add-audience',
      labelText: 'template.root.actions.add_audience',
      trigger: 'append',
      targetType: 'step-target-audience',
    },
  ],

  stepDefinitions: [
    {
      id: 'step-genre',
      category: 'context',
      labelText: 'template.step.genre.label',
      instructionText: 'template.step.genre.instruction',
      isInitial: true,
      editorConfig: {
        format: 'plain',
        placeholderText: 'template.step.genre.placeholder',
      },
      ui: {
        visibility: ['sidebar'],
      },
      actions: [],
    },
    {
      id: 'step-target-audience',
      category: 'context',
      labelText: 'template.step.target_audience.label',
      instructionText: 'template.step.target_audience.instruction',
      isInitial: true,
      editorConfig: {
        format: 'plain',
        placeholderText: 'template.step.target_audience.placeholder',
      },
      ui: {
        visibility: ['sidebar'],
      },
      actions: [],
    },
    {
      id: 'step-theme',
      category: 'context',
      labelText: 'template.step.theme.label',
      instructionText: 'template.step.theme.instruction',
      isInitial: true,
      editorConfig: {
        format: 'plain',
        placeholderText: 'template.step.theme.placeholder',
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
      labelText: 'template.step.summary.label',
      instructionText: 'template.step.summary.instruction',
      editorConfig: {
        format: 'rich',
        placeholderText: 'template.step.summary.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [
        {
          id: 'step-action-expand-to-storyline',
          labelText: 'template.step.summary.actions.expand_to_storyline',
          trigger: 'advance',
          targetType: 'step-storyline',
        },
      ],
    },
    {
      id: 'step-storyline',
      category: 'structure',
      stage: 2,
      labelText: 'template.step.storyline.label',
      instructionText: 'template.step.storyline.instruction',
      editorConfig: {
        format: 'rich',
        placeholderText: 'template.step.storyline.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [
        {
          id: 'step-action-add-character',
          labelText: 'template.step.storyline.actions.add_character',
          trigger: 'append',
          targetType: 'step-char-summary',
        },
        {
          id: 'step-action-add-minor-character',
          labelText: 'template.step.storyline.actions.add_minor_character',
          trigger: 'append',
          targetType: 'step-minor-char',
        },
        {
          id: 'step-action-add-plot-synposis',
          labelText: 'template.step.storyline.actions.add_plot_synopsis',
          trigger: 'append',
          targetType: 'step-plot-synopsis',
        },
      ],
    },
    {
      id: 'step-char-summary',
      category: 'character',
      stage: 3,
      labelText: 'template.step.char_summary.label',
      instructionText: 'template.step.char_summary.instruction',
      editorConfig: {
        format: 'rich',
        placeholderText: 'template.step.char_summary.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [
        {
          id: 'step-action-extend-to-char-deep-dive',
          labelText: 'template.step.char_summary.actions.deep_dive_major',
          trigger: 'advance',
          targetType: 'step-major-char',
        },
        {
          id: 'step-action-extend-to-char-chart',
          labelText: 'template.step.char_summary.actions.create_char_chart',
          trigger: 'advance',
          targetType: 'step-char-chart',
        },
      ],
    },
    {
      id: 'step-plot-synopsis',
      category: 'structure',
      stage: 3,
      labelText: 'template.step.plot_synopsis.label',
      instructionText: 'template.step.plot_synopsis.instruction',
      editorConfig: {
        format: 'rich',
        placeholderText: 'template.step.plot_synopsis.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [
        {
          id: 'step-action-extend-to-detailed-synopsis',
          labelText: 'template.step.plot_synopsis.actions.expand_detailed_synopsis',
          trigger: 'advance',
          targetType: 'step-detailed-synopsis',
        },
      ],
    },
    {
      id: 'step-major-char',
      category: 'character',
      stage: 4,
      labelText: 'template.step.major_char.label',
      instructionText: 'template.step.major_char.instruction',
      editorConfig: {
        format: 'rich',
        placeholderText: 'template.step.major_char.placeholder',
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
      labelText: 'template.step.minor_char.label',
      instructionText: 'template.step.minor_char.instruction',
      editorConfig: {
        format: 'rich',
        placeholderText: 'template.step.minor_char.placeholder',
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
      labelText: 'template.step.detailed_synopsis.label',
      instructionText: 'template.step.detailed_synopsis.instruction',
      editorConfig: {
        format: 'rich',
        placeholderText: 'template.step.detailed_synopsis.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      validations: [
        {
          rule: 'has_connection',
          targetType: 'step-major-char',
          severity: 'warning',
          messageText: 'template.validation.detailed_synopsis.missing_major_char',
        },
      ],
      actions: [
        {
          id: 'step-action-extend-to-scene-overview',
          labelText: 'template.step.detailed_synopsis.actions.create_scene_overview',
          trigger: 'advance',
          targetType: 'step-scene-overview',
        },
      ],
    },
    {
      id: 'step-char-chart',
      category: 'character',
      stage: 5,
      labelText: 'template.step.char_chart.label',
      instructionText: 'template.step.char_chart.instruction',
      editorConfig: {
        format: 'rich',
        placeholderText: 'template.step.char_chart.placeholder',
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
      labelText: 'template.step.scene_overview.label',
      instructionText: 'template.step.scene_overview.instruction',
      editorConfig: {
        format: 'rich',
        placeholderText: 'template.step.scene_overview.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [
        {
          id: 'step-action-add-scene-expansion',
          labelText: 'template.step.scene_overview.actions.write_scene_expansion',
          trigger: 'append',
          targetType: 'step-scene-expansion',
        },
        {
          id: 'step-action-add-chapter',
          labelText: 'template.step.scene_overview.actions.write_chapter',
          trigger: 'append',
          targetType: 'step-chapter',
        },
      ],
    },
    {
      id: 'step-scene-expansion',
      category: 'drafting',
      stage: 6,
      labelText: 'template.step.scene_expansion.label',
      instructionText: 'template.step.scene_expansion.instruction',
      editorConfig: {
        format: 'rich',
        placeholderText: 'template.step.scene_expansion.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [
        {
          id: 'step-action-add-chapter',
          labelText: 'template.step.scene_expansion.actions.write_chapter',
          trigger: 'append',
          targetType: 'step-chapter',
        },
      ],
    },
    {
      id: 'step-chapter',
      category: 'drafting',
      stage: 7,
      labelText: 'template.step.chapter.label',
      instructionText: 'template.step.chapter.instruction',
      editorConfig: {
        format: 'rich',
        placeholderText: 'template.step.chapter.placeholder',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [],
    },
  ],

  ui: {
    tracks: [
      { id: 'main', rootStepIds: ['step-summary'] },
      { id: 'characters', rootStepIds: ['step-char-summary', 'step-minor-char'], layerOffset: 1 },
    ],
  },
}
