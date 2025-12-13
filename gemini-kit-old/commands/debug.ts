/**
 * Debug Command
 * Invokes debugger agent
 */

import chalk from 'chalk';
import ora from 'ora';
import { debuggerAgent } from '../agents/development/debugger.js';

export async function debugCommand(issue: string): Promise<void> {
    console.log(chalk.cyan.bold('\n🐛 Debugging...\n'));
    console.log(chalk.gray(`Issue: ${issue}\n`));

    const ctx = {
        projectRoot: process.cwd(),
        currentTask: issue,
        sharedData: {},
    };

    const spinner = ora('Analyzing issue...').start();

    try {
        debuggerAgent.initialize(ctx);
        const result = await debuggerAgent.execute();
        debuggerAgent.cleanup();

        if (result.success) {
            spinner.succeed('Analysis complete');
            console.log(chalk.white('\n📋 Analysis:\n'));
            console.log(result.data.analysis);
        } else {
            spinner.fail(result.message);
        }
    } catch (error) {
        spinner.fail(`Debug failed: ${error}`);
    }
}
