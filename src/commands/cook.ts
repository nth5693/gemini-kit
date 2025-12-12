/**
 * Cook Command
 * All-in-one development workflow
 * Orchestrates: planner → scout → code → tester → reviewer → docs → git
 */

import chalk from 'chalk';
import ora from 'ora';
import { orchestrator } from '../agents/orchestrator.js';
import { plannerAgent } from '../agents/development/planner.js';
import { scoutAgent } from '../agents/development/scout.js';
import { testerAgent } from '../agents/quality/tester.js';
import { codeReviewerAgent } from '../agents/quality/code-reviewer.js';
import { docsManagerAgent } from '../agents/documentation/docs-manager.js';
import { gitManagerAgent } from '../agents/devops/git-manager.js';
import { logger } from '../utils/logger.js';

export async function cookCommand(task: string): Promise<void> {
    console.log(chalk.cyan.bold('\n🍳 Cook Workflow Starting...\n'));
    console.log(chalk.gray(`Task: ${task}\n`));

    // Register agents
    orchestrator.register(plannerAgent);
    orchestrator.register(scoutAgent);
    orchestrator.register(testerAgent);
    orchestrator.register(codeReviewerAgent);
    orchestrator.register(docsManagerAgent);
    orchestrator.register(gitManagerAgent);

    // Initialize team session with auto-resume from previous
    const { previousSummary } = orchestrator.resumeSession(process.cwd(), task);

    // Show previous session info if exists
    if (previousSummary) {
        console.log(chalk.blue('📂 Resuming from previous session:'));
        console.log(chalk.gray(`   Last task: ${previousSummary.lastTask}`));
        console.log(chalk.gray(`   Completed: ${previousSummary.completedSteps.join(', ') || 'None'}`));
        console.log('');
    }

    // Step 1: Planner
    const spinner = ora('Step 1/6: Planning...').start();
    try {
        const planResult = await runAgent('planner');
        if (!planResult?.success) {
            spinner.fail('Planning failed');
            return;
        }
        spinner.succeed('Plan created');
    } catch (error) {
        spinner.fail(`Planning failed: ${error}`);
        return;
    }

    // Step 2: Scout
    spinner.start('Step 2/6: Scouting codebase...');
    try {
        const scoutResult = await runAgent('scout');
        spinner.succeed(`Found ${(scoutResult?.data as { results?: unknown[] })?.results?.length ?? 0} relevant files`);
    } catch (error) {
        spinner.warn(`Scouting skipped: ${error}`);
    }

    // Step 3: Implementation (manual for now)
    spinner.info('Step 3/6: Implementation - (manual step)');

    // Step 4: Tester
    spinner.start('Step 4/6: Running tests...');
    try {
        const testResult = await runAgent('tester');
        if (testResult?.success) {
            spinner.succeed('Tests passed');
        } else {
            spinner.warn('Some tests failed');
        }
    } catch (error) {
        spinner.warn(`Testing skipped: ${error}`);
    }

    // Step 5: Code Review
    spinner.start('Step 5/6: Code review...');
    try {
        await runAgent('code-reviewer');
        spinner.succeed('Code reviewed');
    } catch (error) {
        spinner.warn(`Review skipped: ${error}`);
    }

    // Step 6: Docs
    spinner.start('Step 6/6: Updating docs...');
    try {
        await runAgent('docs-manager');
        spinner.succeed('Documentation updated');
    } catch (error) {
        spinner.warn(`Docs update skipped: ${error}`);
    }

    // Save session context for next time
    orchestrator.endSession();

    console.log(chalk.green.bold('\n✅ Cook workflow complete!'));
    console.log(chalk.gray('   Session saved - context will be available next time'));
    logger.info('Use `gk git:cm` to commit changes');
}

async function runAgent(name: string) {
    const agent = orchestrator.getAgent(name);
    if (!agent) {
        throw new Error(`Agent ${name} not found`);
    }

    const ctx = {
        projectRoot: process.cwd(),
        currentTask: 'cook workflow',
        sharedData: {},
    };

    agent.initialize(ctx);
    const result = await agent.execute();
    agent.cleanup();

    return result;
}

