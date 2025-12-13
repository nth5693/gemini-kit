/**
 * Watzup Command
 * Invokes project-manager agent for status overview
 */

import chalk from 'chalk';
import ora from 'ora';
import { projectManagerAgent } from '../agents/documentation/project-manager.js';

export async function watzupCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n📊 Project Status...\n'));

    const ctx = {
        projectRoot: process.cwd(),
        currentTask: 'project status overview',
        sharedData: {},
    };

    const spinner = ora('Analyzing project...').start();

    try {
        projectManagerAgent.initialize(ctx);
        const result = await projectManagerAgent.execute();
        projectManagerAgent.cleanup();

        if (result.success) {
            spinner.succeed('Analysis complete');
            console.log(chalk.white('\n📋 Status Report:\n'));
            console.log(result.data.report);
        } else {
            spinner.fail(result.message);
        }
    } catch (error) {
        spinner.fail(`Analysis failed: ${error}`);
    }
}
