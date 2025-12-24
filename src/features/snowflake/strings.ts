export const strings = {
  "template": {
    "snowflake": {
      "name": "The Snowflake Method",
      "description": "A fractal approach to writing: start small and expand outward."
    }
  },
  "root": {
    "actions": {
      "create_summary": "Create One Sentence Summary"
    }
  },
  "step": {
    "summary": {
      "label": "One Sentence Summary",
      "instruction": "Write a single sentence that summarizes your story. Keep it under 15 words.",
      "placeholder": "A rogue physicist travels back in time to kill the Apostle Paul.",
      "actions": {
        "expand_to_storyline": "Expand to Storyline"
      }
    },
    "storyline": {
      "label": "Storyline Paragraph",
      "instruction": "Expand your sentence into a full paragraph describing the setup, major disasters, and ending.",
      "placeholder": "The story opens with... \n\nThen, the first disaster strikes when... \n\nThen, the second disaster occurs... \n\nFinally, the story ends when...",
      "actions": {
        "add_character": "Add Character",
        "add_minor_character": "Add Minor Character",
        "add_plot_synopsis": "Add Plot Synopsis Paragraph"
      }
    },
    "char_summary": {
      "label": "Character Summary",
      "instruction": "Define name, motivation, goal, conflict, and epiphany.",
      "placeholder": "<strong>Name:</strong> \n<strong>Ambition:</strong> (What do they want abstractly?) \n<strong>Goal:</strong> (What do they want concretely?) \n<strong>Conflict:</strong> (What stops them?) \n<strong>Epiphany:</strong> (What do they learn?)",
      "actions": {
        "deep_dive_major": "Deep Dive (Major Character)",
        "create_char_chart": "Create Character Chart"
      }
    },
    "plot_synopsis": {
      "label": "Plot Synopsis (Scene-by-Scene)",
      "instruction": "Take one sentence from your storyline and expand it into a paragraph.",
      "placeholder": "Expand the specific storyline sentence here. Focus on the conflict and the result of that conflict.",
      "actions": {
        "link_pov_character": "Link POV Character",
        "expand_detailed_synopsis": "Expand to Detailed Synopsis"
      }
    },
    "major_char": {
      "label": "Major Character Profile",
      "instruction": "Write a one-page detailed summary of this character's history and arc.",
      "placeholder": "Write the character's full backstory, their role in the story, and how they change over the course of the narrative."
    },
    "minor_char": {
      "label": "Minor Character Profile",
      "instruction": "Write a brief summary of the character's role and personality.",
      "placeholder": "Brief description of role, personality tags, and how they support the protagonist."
    },
    "detailed_synopsis": {
      "label": "Detailed Synopsis",
      "instruction": "Expand the plot synopsis paragraph into a full page description.",
      "placeholder": "Detail the events of this section. Who is present? What is said? What is the setting?",
      "actions": {
        "link_major_char": "Link Major Character",
        "link_minor_char": "Link Minor Character",
        "create_scene_overview": "Create Scene Overview"
      }
    },
    "char_chart": {
      "label": "Character Chart",
      "instruction": "Fill out the detailed spec sheet (Age, Height, Traits, etc).",
      "placeholder": "<strong>Age:</strong> \n<strong>Height:</strong> \n<strong>Appearance:</strong> \n<strong>History:</strong> \n<strong>Voice/Mannerisms:</strong> "
    },
    "scene_overview": {
      "label": "Scene Overview",
      "instruction": "List the specific scenes required to tell this part of the detailed synopsis.",
      "placeholder": "1. Scene Setup: (Location, Time, Characters)\n2. Scene Action: (What happens?)\n3. Scene Sequel: (Reaction to the action)",
      "actions": {
        "link_pov": "Link POV",
        "write_scene_expansion": "Write Scene Expansion",
        "write_chapter": "Write Chapter"
      }
    },
    "scene_expansion": {
      "label": "Scene Expansion",
      "instruction": "Write the multi-paragraph description of the scene.",
      "placeholder": "Draft the full scene here...",
      "actions": {
        "write_chapter": "Write Chapter"
      }
    },
    "chapter": {
      "label": "Chapter Draft",
      "instruction": "Write the final prose for the chapter.",
      "placeholder": "Chapter Title..."
    }
  },
  "validation": {
    "detailed_synopsis": {
      "missing_major_char": "A detailed synopsis requires a Major Character perspective to be complete."
    }
  }
}
