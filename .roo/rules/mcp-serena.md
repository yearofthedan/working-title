# Serena MCP Toolbox

## Core Principles

1.  **LSP First**: Prefer Serena MCP tools over `search_files` or `grep` for finding references, definitions, and symbols.
2.  **Surgical Edits**: Use symbol-based insertion/replacement (`insert_after_symbol`, `replace_symbol_body`) or line-specific tools (`replace_lines`, `delete_lines`) rather than overwriting whole files.
3.  **Semantic Renaming**: ALWAYS use `rename_symbol` for refactors to ensure cross-file consistency.
4.  **Verification**: Use `restart_language_server` if edits made outside of Serena are not being reflected in symbol searches.

## Key Navigation Tools

- `find_symbol`: Global search for symbols using the language server.
- `find_referencing_symbols`: Find all usages of a symbol.
- `get_symbols_overview`: Map the top-level structure of a file.

## Key Implementation Tools

- `replace_symbol_body`: Replace a full function or class definition safely.
- `insert_after_symbol` / `insert_before_symbol`: Add code relative to existing declarations.
- `replace_content`: Regex-based search and replace.
- `replace_lines` / `delete_lines`: Precise line-range operations.

## Project Management

- `onboarding`: Run on new projects to identify structure and core tasks.
- `write_memory` / `read_memory`: Store and retrieve project-specific context (architectural notes, todo state).
- `think_about_task_adherence`: Use during complex tasks to verify alignment with objectives.


