# Domain Concepts

## Application Purpose

This application is a narrative development tool that helps writers plan and structure
stories using established creative writing methodologies. The primary implementation
is the Snowflake Method, a step-by-step approach to novel writing.

## Core Concepts

### Project

A writer's story being developed. Contains:

- **Steps**: Individual writing tasks (sentence summary, character descriptions, scenes)
- **Connections**: Relationships showing narrative flow between steps
- **Template**: The methodology being followed (e.g., Snowflake v1)

### Template

A structured writing methodology defining the process. Contains:

- **Step Definitions**: All possible writing tasks in this methodology
- **Actions**: What the writer can do from each step (append, advance, connect)
- **Tracks**: Vertical groupings for visual organization
- **Validations**: Rules ensuring the story structure is complete

### Step

An individual writing task with editable content. Properties:

- **stepId**: References a step definition in the template
- **content**: HTML/Markdown text from the editor
- **connections**: Links to other steps showing narrative relationships

### Canvas vs Sidebar

The same project data is displayed in two ways:

- **Canvas**: Visual graph showing step relationships and narrative flow
- **Sidebar**: Text-focused interface for detailed content editing

Both views are synchronized and update the same underlying project data.

## Terminology Guide

To avoid confusion, note these domain-specific meanings:

| Term           | Domain Meaning                       | Common Tech Meaning                |
| -------------- | ------------------------------------ | ---------------------------------- |
| **Step**       | A writing task                       | Wizard step, build step            |
| **Stage**      | Progress indicator (1, 2, 3)         | Deployment environment             |
| **Track**      | Vertical column in layout            | Audio track, tracking pixel        |
| **Node**       | Visual representation of a step      | Server node, tree node             |
| **Connection** | Narrative relationship between steps | Network connection, API connection |
| **Template**   | Writing methodology                  | Code template, HTML template       |
| **Canvas**     | Visual graph editor                  | HTML5 Canvas element               |
