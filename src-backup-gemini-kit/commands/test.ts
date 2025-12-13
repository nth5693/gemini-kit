/**
 * Test Command
 * Invokes tester agent
 */

import chalk from 'chalk';
import ora from 'ora';
import { testerAgent } from '../agents/quality/tester.js';

export async function testCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n🧪 Running Tests...\n'));

    const ctx = {
        projectRoot: process.cwd(),
        currentTask: 'run tests',
        sharedData: {},
    };

    const spinner = ora('Running test suite...').start();

    try {
        testerAgent.initialize(ctx);
        const result = await testerAgent.execute();
        testerAgent.cleanup();

        if (result.success) {
            spinner.succeed('All tests passed');
        } else {
            spinner.fail(result.message);
        }
    } catch (error) {
        spinner.fail(`Testing failed: ${error}`);
    }
}
