/**
 * Brainstorm Command
 * Invokes brainstormer agent
 */

import chalk from 'chalk';
import ora from 'ora';
import { brainstormerAgent } from '../agents/creative/brainstormer.js';

export async function brainstormCommand(topic: string): Promise<void> {
    console.log(chalk.cyan.bold('\n💡 Brainstorming...\n'));
    console.log(chalk.gray(`Topic: ${topic}\n`));

    const ctx = {
        projectRoot: process.cwd(),
        currentTask: topic,
        sharedData: {},
    };

    const spinner = ora('Generating ideas...').start();

    try {
        brainstormerAgent.initialize(ctx);
        const result = await brainstormerAgent.execute();
        brainstormerAgent.cleanup();

        if (result.success) {
            spinner.succeed('Ideas generated');
            console.log(chalk.white('\n💭 Ideas:\n'));
            console.log(result.data.ideas);
        } else {
            spinner.fail(result.message);
        }
    } catch (error) {
        spinner.fail(`Brainstorming failed: ${error}`);
    }
}
