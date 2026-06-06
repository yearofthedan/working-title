# Project Structure
## Overview
Provides guidance of the project structure
```
project-root/
├── .devcontainer/          # 
├── .github/                # 
├── .husky/                 # 
├── .claude/                # Claude Code: skills, agents, settings, memory
├── .storybook/             # 
├── .vscode/                # 
├── docs  /                 # 
├── e2e/                    #
├── docs/                   # 
    ├── decisions/          #
        ├── active/         #
        ├── archive/        #
    ├── planning/           #
        ├── active/         #
        ├── archive/        #
        ├── templates/      #
├── scripts/                # 
└── src/                    #
    ├── __testHelpers__/        # 
    ├── config/                 # 
    ├── features/               # 
    │   ├── __testHelpers__/    #
    │   ├── common/             #
    │   │   ├── dialogs/        #
    │   │   ├── error-handling/ #
    │   │   ├── feedback/       #
    │   └── fields/         #
    │   ├── demo/               #
    │   ├── home/               #
    │   │   └── components/     #          
    │   ├── page-errors/        #
    │   ├── process-templates/          #
    │   │   ├── __testHelpers__/        #
    │   │   └── snowflake/              #
    │   │       └── locales/            #
    │   ├── project-storage/            #
    │   │   ├── __testHelpers__/        #
    │   │   └── composables             #
    │   │       └── __testHelpers__/    #
    │   └── writing-project/            #
    │       ├── __testHelpers__/        #
    │       ├── components/             #
    │       ├── composables/            #
    │       ├── canvas/                 #
    │       │   ├── __testHelpers__/    #
    │       │   ├── step/               #
    │       │   │   └── __testHelpers__/    #
    │       │   ├── composables/            #
    │       │   └── utils/                  #
    │       ├── sidebar/                #
    │       │   ├── __testHelpers__/    #
    │       │   └── composables/        #
    │       └── step-panel/             #
    │           └── __testHelpers__/    #
    ├── i18n/                           # 
    │   └── __testHelpers__/            #
    ├── infra/              # 
    ├── router/             # 
    ├── styles/             # 
    └── utils/              # 

```