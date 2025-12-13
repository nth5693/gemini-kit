/**
 * Journal Command
 * Invokes journal-writer agent
 */

import chalk from 'chalk';
import ora from 'ora';
import { journalWriterAgent } from '../agents/research/journal-writer.js';

export async function journalCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n📓 Writing Journal Entry...\n'));

    const ctx = {
        projectRoot: process.cwd(),
        currentTask: 'write development journal',
        sharedData: {},
    };

    const spinner = ora('Writing journal...').start();

    try {
        journalWriterAgent.initialize(ctx);
        const result = await journalWriterAgent.execute();
        journalWriterAgent.cleanup();

        if (result.success) {
            spinner.succeed('Journal entry created');
            console.log(chalk.green(`\n📁 Saved to: ${result.data.journalPath}`));
        } else {
            spinner.fail(result.message);
        }
    } catch (error) {
        spinner.fail(`Journal failed: ${error}`);
    }
}
