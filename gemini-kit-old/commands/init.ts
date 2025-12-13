/**
 * Init Command
 * Initialize gemini-kit in a project
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { saveConfig, GeminiKitConfig } from '../utils/config.js';

export async function initCommand(projectRoot: string = process.cwd()): Promise<void> {
    console.log(chalk.cyan.bold('\n🚀 Initializing Gemini-Kit...\n'));

    // Check if already initialized
    const configDir = join(projectRoot, '.gemini-kit');
    if (existsSync(configDir)) {
        console.log(chalk.yellow('⚠️  .gemini-kit already exists. Skipping initialization.'));
        return;
    }

    // Create directory structure
    const dirs = [
        '.gemini-kit',
        '.gemini-kit/agents',
        '.gemini-kit/commands',
        'plans',
        'docs',
        'journals',
    ];

    for (const dir of dirs) {
        const path = join(projectRoot, dir);
        if (!existsSync(path)) {
            mkdirSync(path, { recursive: true });
            console.log(chalk.gray(`  Created ${dir}/`));
        }
    }

    // Interactive setup
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'provider',
            message: 'Select default AI provider:',
            choices: [
                { name: 'Gemini (Google)', value: 'gemini' },
                { name: 'Claude (Anthropic)', value: 'claude' },
                { name: 'OpenAI (GPT)', value: 'openai' },
            ],
            default: 'gemini',
        },
        {
            type: 'confirm',
            name: 'autoCommit',
            message: 'Auto-commit after fixes?',
            default: false,
        },
        {
            type: 'confirm',
            name: 'autoTest',
            message: 'Auto-run tests after code changes?',
            default: true,
        },
        {
            type: 'confirm',
            name: 'planApproval',
            message: 'Require approval before implementing plans?',
            default: true,
        },
    ]);

    // Create config
    const config: GeminiKitConfig = {
        defaultProvider: answers.provider,
        providers: {},
        autoCommit: answers.autoCommit,
        autoTest: answers.autoTest,
        planApproval: answers.planApproval,
    };

    saveConfig(config, projectRoot);

    // Create CLAUDE.md style project file
    const projectMd = `# Project Instructions

> This file provides guidance for AI assistants working on this project.

## Project Overview

[Describe your project here]

## Architecture

[Describe the architecture]

## Key Files

| File | Purpose |
|------|---------|
| \`src/\` | Source code |
| \`tests/\` | Test files |

## Workflow

Use these commands:

\`\`\`bash
gk cook "implement feature"     # Full workflow
gk plan "design API"            # Planning only
gk scout "find auth files"      # Search codebase
gk test                         # Run tests
\`\`\`

## Rules

1. Follow existing code patterns
2. Write tests for new features
3. Keep documentation updated
`;

    writeFileSync(join(projectRoot, 'GEMINI-KIT.md'), projectMd);
    console.log(chalk.gray('  Created GEMINI-KIT.md'));

    console.log(chalk.green.bold('\n✅ Gemini-Kit initialized successfully!\n'));
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.white('  1. Set API keys: gk config set providers.gemini.apiKey YOUR_KEY'));
    console.log(chalk.white('  2. Start working: gk cook "your first task"'));
    console.log('');
}
