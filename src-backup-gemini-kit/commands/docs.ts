/**
 * Docs Commands
 * Invokes docs-manager agent with Project Context
 */

import chalk from 'chalk';
import ora from 'ora';
import { docsManagerAgent } from '../agents/documentation/docs-manager.js';
import { projectContext } from '../context/project-context.js';
import { existsSync, writeFileSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { providerManager } from '../providers/index.js';

export async function docsInitCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n📚 Initializing Documentation (ClaudeKit Style)...\n'));

    const spinner = ora('Scanning project...').start();

    try {
        // Use ProjectContextManager to scan and generate summary
        const context = await projectContext.init(process.cwd());
        spinner.text = `Found ${context.files.length} code files. Generating summary...`;

        // Generate AI summary
        await projectContext.generateSummary();
        spinner.text = 'Creating docs...';

        // Save to docs folder
        const summaryPath = await projectContext.saveDocsInit();

        // Also create code-standards.md if not exists
        const docsDir = join(process.cwd(), 'docs');
        const standardsPath = join(docsDir, 'code-standards.md');
        if (!existsSync(standardsPath)) {
            writeFileSync(standardsPath, `# Code Standards

## Naming Conventions
- camelCase for variables and functions
- PascalCase for classes and types
- UPPER_CASE for constants

## Best Practices
- Write tests for all new features
- Document public APIs
- Use TypeScript strict mode
- Follow ESLint rules

## Git Commits
- Use conventional commits: feat, fix, docs, chore
- Keep commits small and focused
`);
            console.log(chalk.green('  ✓ Created code-standards.md'));
        }

        spinner.succeed('Documentation initialized!');
        console.log(chalk.gray(`\n  📁 Files: ${context.files.length}`));
        console.log(chalk.gray(`  📦 Framework: ${context.framework}`));
        console.log(chalk.green(`  📝 Summary: ${summaryPath}\n`));

        console.log(chalk.cyan('💡 Tip: Agents will now use this context for better understanding.\n'));
    } catch (error) {
        spinner.fail(`Failed: ${error}`);
    }
}

export async function docsUpdateCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n📝 Updating Documentation...\n'));
    const ctx = { projectRoot: process.cwd(), currentTask: 'update documentation', sharedData: {} };
    const spinner = ora('Updating...').start();
    try {
        docsManagerAgent.initialize(ctx);
        const result = await docsManagerAgent.execute();
        docsManagerAgent.cleanup();
        if (result.success) { spinner.succeed('Updated'); } else { spinner.fail(result.message); }
    } catch (e) { spinner.fail(`Failed: ${e}`); }
}

export async function docsSummarizeCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n📄 Summarizing Documentation...\n'));
    const spinner = ora('Reading docs...').start();
    try {
        const docsDir = join(process.cwd(), 'docs');
        let docsContent = '';

        if (existsSync(docsDir)) {
            const files = readdirSync(docsDir).filter(f => f.endsWith('.md'));
            for (const file of files.slice(0, 5)) {
                const content = readFileSync(join(docsDir, file), 'utf-8');
                docsContent += `\n## ${file}\n${content.slice(0, 1000)}\n`;
            }
        }

        spinner.text = 'Summarizing...';
        const prompt = `Summarize this project documentation concisely:
${docsContent || 'No docs found'}

Provide:
1. **Project Overview** - What it does
2. **Key Features** - Main capabilities
3. **Architecture** - High-level structure
4. **Getting Started** - Quick start steps`;

        const result = await providerManager.generate([{ role: 'user', content: prompt }]);
        spinner.succeed('Summary created');
        console.log(result.content);
    } catch (e) { spinner.fail(`Failed: ${e}`); }
}

