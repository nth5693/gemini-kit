/**
 * Git Commands
 * Invokes git-manager agent
 */

import chalk from 'chalk';
import ora from 'ora';
import { gitManagerAgent } from '../agents/devops/git-manager.js';

export async function gitCommitCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n📦 Git Commit...\n'));

    const ctx = {
        projectRoot: process.cwd(),
        currentTask: 'commit changes',
        sharedData: {},
    };

    const spinner = ora('Staging and committing...').start();

    try {
        gitManagerAgent.initialize(ctx);
        const result = await gitManagerAgent.execute();
        gitManagerAgent.cleanup();

        if (result.success) {
            spinner.succeed(result.message);
        } else {
            spinner.fail(result.message);
        }
    } catch (error) {
        spinner.fail(`Commit failed: ${error}`);
    }
}

export async function gitCommitPushCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n🚀 Git Commit & Push...\n'));

    const ctx = {
        projectRoot: process.cwd(),
        currentTask: 'commit and push changes',
        sharedData: {},
    };

    const spinner = ora('Committing and pushing...').start();

    try {
        gitManagerAgent.initialize(ctx);
        const result = await gitManagerAgent.commitAndPush();
        gitManagerAgent.cleanup();

        if (result.success) {
            spinner.succeed(result.message);
        } else {
            spinner.fail(result.message);
        }
    } catch (error) {
        spinner.fail(`Push failed: ${error}`);
    }
}
