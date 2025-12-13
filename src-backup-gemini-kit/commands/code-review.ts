/**
 * Code Review Command
 * Invokes code-reviewer agent for comprehensive review
 */

import chalk from 'chalk';
import ora from 'ora';
import { codeReviewerAgent } from '../agents/quality/code-reviewer.js';
import { execSync } from 'child_process';

export async function codeReviewCommand(target?: string): Promise<void> {
    console.log(chalk.cyan.bold('\n🔍 Code Review...\n'));

    const filesToReview = target || 'staged changes';
    console.log(chalk.gray(`Target: ${filesToReview}\n`));

    const ctx = {
        projectRoot: process.cwd(),
        currentTask: `code review: ${filesToReview}`,
        sharedData: {} as Record<string, string>,
    };

    const spinner = ora('Analyzing code...').start();

    try {
        // Get diff or file content
        let codeContent = '';

        if (!target) {
            // Review staged changes
            try {
                codeContent = execSync('git diff --cached', { encoding: 'utf-8' });
                if (!codeContent) {
                    codeContent = execSync('git diff', { encoding: 'utf-8' });
                }
            } catch {
                codeContent = 'No git changes found';
            }
        } else {
            // Review specific file
            try {
                codeContent = execSync(`cat ${target}`, { encoding: 'utf-8' });
            } catch {
                spinner.fail(`Cannot read file: ${target}`);
                return;
            }
        }

        ctx.sharedData.codeToReview = codeContent.slice(0, 5000);

        codeReviewerAgent.initialize(ctx);
        const result = await codeReviewerAgent.execute();
        codeReviewerAgent.cleanup();

        if (result.success) {
            spinner.succeed('Code review complete');
            console.log(chalk.white('\n📋 Review Results:\n'));
            console.log(result.data.review);
        } else {
            spinner.fail(result.message);
        }
    } catch (error) {
        spinner.fail(`Review failed: ${error}`);
    }
}
