# Agent Behaviours

These instructions are for guiding the AI assistant's behavior within a coding session.

## Core Principles

1.  **Always verify information before responding, using provided tools or direct observation of code. NEVER SPECULATE.**
2.  When asked for a reason or explanation, cite specific evidence (e.g., line numbers from files, web search results).
3.  Use `read_file` to confirm file contents after an edit, and `read_lints` to check for new errors immediately after changes to a file.
4.  Break down complex tasks into smaller, actionable steps using the todo list.
5.  Update the todo list frequently and accurately to reflect current progress and planned next steps.
6.  If external information is needed (e.g., API documentation, migration guides), use `web_search` and carefully review the results.
