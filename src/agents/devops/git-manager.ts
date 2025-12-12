/**
 * Git Manager Agent
 * Stage, commit, and push code with professional standards
 */

import { BaseAgent, AgentOutput } from '../base-agent.js';
import { execSync } from 'child_process';
import { logger } from '../../utils/logger.js';
import { providerManager } from '../../providers/index.js';

export class GitManagerAgent extends BaseAgent {
    constructor() {
        super({
            name: 'git-manager',
            description: 'Stage, commit, and push code with professional standards',
            category: 'devops',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        logger.agent(this.name, 'Managing Git operations...');

        try {
            // Check for changes
            const status = execSync('git status --porcelain', {
                cwd: ctx.projectRoot,
                encoding: 'utf-8',
            });

            if (!status.trim()) {
                return this.createOutput(true, 'No changes to commit', {}, []);
            }

            // Get diff for commit message
            const diff = execSync('git diff --staged', {
                cwd: ctx.projectRoot,
                encoding: 'utf-8',
            }).slice(0, 3000);

            // Generate commit message using AI
            const prompt = `Generate a conventional commit message for these changes:

Task: ${ctx.currentTask}
Changes:
${status}

Diff (truncated):
${diff}

Format: <type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
Be concise and descriptive.`;

            const result = await providerManager.generate([
                { role: 'user', content: prompt },
            ]);

            const commitMessage = result.content
                .replace(/```/g, '')
                .trim()
                .split('\n')[0] || 'chore: update';

            logger.info(`Generated commit: ${commitMessage}`);

            // Stage all changes
            execSync('git add -A', { cwd: ctx.projectRoot });

            // Commit
            execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, {
                cwd: ctx.projectRoot,
            });

            logger.success('Changes committed successfully');

            return this.createOutput(
                true,
                `Committed: ${commitMessage}`,
                { commitMessage, changedFiles: status.split('\n').length },
                []
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return this.createOutput(false, `Git operation failed: ${message}`, {});
        }
    }

    /**
     * Commit and push
     */
    async commitAndPush(): Promise<AgentOutput> {
        const commitResult = await this.execute();
        if (!commitResult.success) {
            return commitResult;
        }

        const ctx = this.getContext();

        try {
            execSync('git push', { cwd: ctx.projectRoot });
            logger.success('Pushed to remote');

            return this.createOutput(
                true,
                `${commitResult.message} and pushed`,
                commitResult.data,
                []
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return this.createOutput(false, `Push failed: ${message}`, {});
        }
    }
}

export const gitManagerAgent = new GitManagerAgent();
