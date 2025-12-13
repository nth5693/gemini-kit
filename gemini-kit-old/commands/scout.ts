/**
 * Scout Command
 * Search codebase for relevant files
 */

import chalk from 'chalk';
import ora from 'ora';
import { scoutAgent, ScoutResult } from '../agents/development/scout.js';

export async function scoutCommand(query: string): Promise<void> {
    console.log(chalk.cyan.bold('\n🔍 Scouting codebase...\n'));
    console.log(chalk.gray(`Query: ${query}\n`));

    const ctx = {
        projectRoot: process.cwd(),
        currentTask: query,
        sharedData: {},
    };

    const spinner = ora('Searching...').start();

    try {
        scoutAgent.initialize(ctx);
        const result = await scoutAgent.execute();
        scoutAgent.cleanup();

        if (result.success) {
            spinner.succeed(`Found ${(result.data.results as ScoutResult[]).length} results`);

            const results = result.data.results as ScoutResult[];

            // Display high relevance
            const high = results.filter((r) => r.relevance === 'high');
            if (high.length > 0) {
                console.log(chalk.green.bold('\n🎯 High Relevance:'));
                high.forEach((r) => {
                    console.log(chalk.green(`  ${r.type === 'file' ? '📄' : '📁'} ${r.path}`));
                });
            }

            // Display medium relevance
            const medium = results.filter((r) => r.relevance === 'medium');
            if (medium.length > 0) {
                console.log(chalk.yellow.bold('\n📌 Medium Relevance:'));
                medium.slice(0, 10).forEach((r) => {
                    console.log(chalk.yellow(`  ${r.type === 'file' ? '📄' : '📁'} ${r.path}`));
                });
                if (medium.length > 10) {
                    console.log(chalk.gray(`  ... and ${medium.length - 10} more`));
                }
            }
        } else {
            spinner.fail(result.message);
        }
    } catch (error) {
        spinner.fail(`Scouting failed: ${error}`);
    }
}
