/**
 * Ask Command
 * Ask questions about the codebase
 */

import chalk from 'chalk';
import ora from 'ora';
import { scoutAgent } from '../agents/development/scout.js';
import { providerManager } from '../providers/index.js';

export async function askCommand(question: string): Promise<void> {
    console.log(chalk.cyan.bold('\n❓ Ask About Codebase...\n'));
    console.log(chalk.gray(`Question: ${question}\n`));

    const ctx = {
        projectRoot: process.cwd(),
        currentTask: question,
        sharedData: {},
    };

    const spinner = ora('Searching codebase...').start();

    try {
        // Use scout to find relevant files
        scoutAgent.initialize(ctx);
        const scoutResult = await scoutAgent.execute();
        scoutAgent.cleanup();

        spinner.text = 'Analyzing...';

        const prompt = `You are a codebase expert. Answer this question about the codebase:

Question: ${question}

Relevant files found:
${JSON.stringify(scoutResult.data, null, 2)}

Provide:
1. **Direct Answer** to the question
2. **Relevant Code Locations** 
3. **Related Context**
4. **Suggestions** if applicable`;

        const result = await providerManager.generate([
            { role: 'user', content: prompt },
        ]);

        spinner.succeed('Answer ready');
        console.log(chalk.white('\n📋 Answer:\n'));
        console.log(result.content);
    } catch (error) {
        spinner.fail(`Ask failed: ${error}`);
    }
}
