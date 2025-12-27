export const template: NarrativeTemplate = {
  "id": "snowflake-method-v1",
  "version": "1.0.0",
  "nameText": "template.snowflake.name",
  "descriptionText": "template.snowflake.description",
  "rootActions": [
    {
      "labelText": "root.actions.create_summary",
      "trigger": "append",
      "targetType": "step-summary"
    },
    {
      "labelText": "root.actions.add_genre",
      "trigger": "append",
      "targetType": "step-genre"
    },
    {
      "labelText": "root.actions.add_theme",
      "trigger": "append",
      "targetType": "step-theme"
    },
    {
      "labelText": "root.actions.add_audience",
      "trigger": "append",
      "targetType": "step-target-audience"
    }
  ],
  "steps": {
    "step-genre": {
      "id": "step-genre",
      "category": "context",
      "labelText": "step.genre.label",
      "instructionText": "step.genre.instruction",
      "content": {
        "contentType": "plainText",
        "placeholderText": "step.genre.placeholder"
      },
      "actions": []
    },
    "step-target-audience": {
      "id": "step-target-audience",
      "category": "context",
      "labelText": "step.target_audience.label",
      "instructionText": "step.target_audience.instruction",
      "content": {
        "contentType": "plainText",
        "placeholderText": "step.target_audience.placeholder"
      },
      "actions": []
    },
    "step-theme": {
      "id": "step-theme",
      "category": "context",
      "labelText": "step.theme.label",
      "instructionText": "step.theme.instruction",
      "content": {
        "contentType": "plainText",
        "placeholderText": "step.theme.placeholder"
      },
      "actions": []
    },
    "step-summary": {
      "id": "step-summary",
      "category": "structure",
      "labelText": "step.summary.label",
      "instructionText": "step.summary.instruction",
      "content": {
        "contentType": "plainText",
        "placeholderText": "step.summary.placeholder"
      },
      "actions": [
        {
          "labelText": "step.summary.actions.expand_to_storyline",
          "trigger": "advance",
          "targetType": "step-storyline"
        }
      ]
    },
    "step-storyline": {
      "id": "step-storyline",
      "category": "structure",
      "labelText": "step.storyline.label",
      "instructionText": "step.storyline.instruction",
      "content": {
        "contentType": "richText",
        "placeholderText": "step.storyline.placeholder"
      },
      "actions": [
        {
          "labelText": "step.storyline.actions.add_character",
          "trigger": "append",
          "targetType": "step-char-summary"
        },
        {
          "labelText": "step.storyline.actions.add_minor_character",
          "trigger": "append",
          "targetType": "step-minor-char"
        },
        {
          "labelText": "step.storyline.actions.add_plot_synopsis",
          "trigger": "append",
          "targetType": "step-plot-synopsis"
        }
      ]
    },
    "step-char-summary": {
      "id": "step-char-summary",
      "category": "character",
      "labelText": "step.char_summary.label",
      "instructionText": "step.char_summary.instruction",
      "content": {
        "contentType": "richText",
        "placeholderText": "step.char_summary.placeholder"
      },
      "actions": [
        {
          "labelText": "step.char_summary.actions.deep_dive_major",
          "trigger": "advance",
          "targetType": "step-major-char"
        },
        {
          "labelText": "step.char_summary.actions.create_char_chart",
          "trigger": "advance",
          "targetType": "step-char-chart"
        }
      ]
    },
    "step-plot-synopsis": {
      "id": "step-plot-synopsis",
      "category": "structure",
      "labelText": "step.plot_synopsis.label",
      "instructionText": "step.plot_synopsis.instruction",
      "content": {
        "contentType": "richText",
        "placeholderText": "step.plot_synopsis.placeholder"
      },
      "actions": [
        {
          "labelText": "step.plot_synopsis.actions.link_pov_character",
          "trigger": "connect",
          "targetType": "step-char-summary",
          "meta": {
            "required": true
          }
        },
        {
          "labelText": "step.plot_synopsis.actions.expand_detailed_synopsis",
          "trigger": "advance",
          "targetType": "step-detailed-synopsis"
        }
      ]
    },
    "step-major-char": {
      "id": "step-major-char",
      "category": "character",
      "labelText": "step.major_char.label",
      "instructionText": "step.major_char.instruction",
      "content": {
        "contentType": "richText",
        "placeholderText": "step.major_char.placeholder"
      },
      "actions": []
    },
    "step-minor-char": {
      "id": "step-minor-char",
      "category": "character",
      "labelText": "step.minor_char.label",
      "instructionText": "step.minor_char.instruction",
      "content": {
        "contentType": "richText",
        "placeholderText": "step.minor_char.placeholder"
      },
      "actions": []
    },
    "step-detailed-synopsis": {
      "id": "step-detailed-synopsis",
      "category": "structure",
      "labelText": "step.detailed_synopsis.label",
      "instructionText": "step.detailed_synopsis.instruction",
      "content": {
        "contentType": "richText",
        "placeholderText": "step.detailed_synopsis.placeholder"
      },
      "validations": [
        {
          "rule": "has_connection",
          "targetType": "step-major-char",
          "severity": "warning",
          "messageText": "validation.detailed_synopsis.missing_major_char"
        }
      ],
      "actions": [
        {
          "labelText": "step.detailed_synopsis.actions.link_major_char",
          "trigger": "connect",
          "targetType": "step-major-char",
          "meta": {
            "required": true
          }
        },
        {
          "labelText": "step.detailed_synopsis.actions.link_minor_char",
          "trigger": "connect",
          "targetType": "step-minor-char",
          "meta": {
            "required": false
          }
        },
        {
          "labelText": "step.detailed_synopsis.actions.create_scene_overview",
          "trigger": "advance",
          "targetType": "step-scene-overview"
        }
      ]
    },
    "step-char-chart": {
      "id": "step-char-chart",
      "category": "character",
      "labelText": "step.char_chart.label",
      "instructionText": "step.char_chart.instruction",
      "content": {
        "contentType": "richText",
        "placeholderText": "step.char_chart.placeholder"
      },
      "actions": []
    },
    "step-scene-overview": {
      "id": "step-scene-overview",
      "category": "drafting",
      "labelText": "step.scene_overview.label",
      "instructionText": "step.scene_overview.instruction",
      "content": {
        "contentType": "richText",
        "placeholderText": "step.scene_overview.placeholder"
      },
      "actions": [
        {
          "labelText": "step.scene_overview.actions.link_pov",
          "trigger": "connect",
          "targetType": "step-char-summary",
          "meta": {
            "required": true
          }
        },
        {
          "labelText": "step.scene_overview.actions.write_scene_expansion",
          "trigger": "append",
          "targetType": "step-scene-expansion"
        },
        {
          "labelText": "step.scene_overview.actions.write_chapter",
          "trigger": "append",
          "targetType": "step-chapter"
        }
      ]
    },
    "step-scene-expansion": {
      "id": "step-scene-expansion",
      "category": "drafting",
      "labelText": "step.scene_expansion.label",
      "instructionText": "step.scene_expansion.instruction",
      "content": {
        "contentType": "richText",
        "placeholderText": "step.scene_expansion.placeholder"
      },
      "actions": [
        {
          "labelText": "step.scene_expansion.actions.write_chapter",
          "trigger": "append",
          "targetType": "step-chapter"
        }
      ]
    },
    "step-chapter": {
      "id": "step-chapter",
      "category": "drafting",
      "labelText": "step.chapter.label",
      "instructionText": "step.chapter.instruction",
      "content": {
        "contentType": "richText",
        "placeholderText": "step.chapter.placeholder"
      },
      "actions": []
    }
  }
}


/**
 * NARRATIVE TEMPLATE SPECIFICATION (v1.0)
 * * This file defines the schema for any process template (Snowflake, Hero's Journey, etc.)
 * that runs on the Narrative Engine.
 */

export interface NarrativeTemplate {
  /** Unique identifier for the template (e.g., 'snowflake-v1') */
  id: string;
  /** Semantic versioning for the logic (e.g., '1.0.0') */
  version: string;
  /** i18n key for the display name */
  nameText: string;
  /** i18n key for the description */
  descriptionText: string;
  
  /** * The entry points for the template. 
   * These are the actions available when the graph is empty.
   */
  rootActions: RootAction[];

  /**
   * The dictionary of all possible steps in this process.
   * Keys should be unique IDs (e.g., 'step-storyline').
   */
  steps: Record<string, StepDefinition>;
}

export interface RootAction {
  labelText: string;
  trigger: 'append';
  targetType: string; // Must match a key in the 'steps' record
}

export interface StepDefinition {
  id: string;
  /** High-level grouping for UI styling (e.g., 'structure', 'character') */
  category: StepCategory;
  
  /** i18n key for the node title */
  labelText: string;
  /** i18n key for the sidebar help text */
  instructionText: string;
  
  /** Configuration for the node's editor area */
  content: StepContent;
  
  /** * Optional quality control rules. 
   * These do not block saving, but show warnings in the UI.
   */
  validations?: ValidationRule[];
  
  /** * The available operations a user can perform from this node.
   * Defines the 'out-bound' edges.
   */
  actions: StepAction[];
}

export type StepCategory = 'structure' | 'character' | 'context' | 'drafting' | string;

export interface StepContent {
  /** Determines which editor component to render */
  contentType: 'plainText' | 'richText';
  /** i18n key for the empty state text */
  placeholderText: string;
}

export interface ValidationRule {
  /** The logic check to run */
  rule: 'has_connection'; 
  /** The specific type of node looked for */
  targetType: string;
  /** How loud the alert should be */
  severity: 'warning' | 'error';
  /** i18n key for the alert message */
  messageText: string;
}

export interface StepAction {
  /** i18n key for the button label */
  labelText: string;
  
  /** * The mechanism of the action:
   * - 'append': Adds a new child node (One-to-Many).
   * - 'advance': Moves this node to the next stage (One-to-One).
   * - 'connect': Draws a line to an existing node.
   */
  trigger: 'append' | 'advance' | 'connect';
  
  /** The ID of the step definition to create or link to */
  targetType: string;
  
  /** Metadata for UI behavior or constraints */
  meta?: {
    /** If true, this link is structural/mandatory */
    required?: boolean;
    /** Any other custom flags for the engine */
    [key: string]: unknown;
  };
}