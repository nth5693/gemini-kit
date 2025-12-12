/**
 * Git Manager Agent
 * Stage, commit, and push code with professional standards
 * Acts as DevOps - uses team context for smart commit messages
 */

import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
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
        const teamCtx = getTeamContext();

        logger.agent(this.name, 'Managing Git operations...');

        try {
            // Check for changes
            const status = execSync('git status --porcelain', {
                cwd: ctx.projectRoot,
                encoding: 'utf-8',
            });

            if (!status.trim()) {
                if (teamCtx) {
                    teamCtx.sendMessage(this.name, 'all', 'info', 'No changes to commit');
                }
                return this.createOutput(true, 'No changes to commit', {}, []);
            }

            // Get diff for commit message
            let diff = '';
            try {
                diff = execSync('git diff HEAD', {
                    cwd: ctx.projectRoot,
                    encoding: 'utf-8',
                }).slice(0, 3000);
            } catch {
                // No previous commit
            }

            // Build context-aware prompt
            let teamSummary = '';
            if (teamCtx) {
                const progress = teamCtx.getFullContext().knowledge.taskProgress;
                const artifacts = Array.from(teamCtx.getFullContext().artifacts.values());

                teamSummary = `
## Team Progress
- Planned: ${progress.planned ? '✅' : '❌'}
- Tested: ${progress.tested ? '✅' : '❌'}
- Reviewed: ${progress.reviewed ? '✅' : '❌'}

## Artifacts Created
${artifacts.map(a => `- ${a.name} (${a.type}) by ${a.createdBy}`).join('\n')}
`;
            }

            // Generate commit message using AI
            const prompt = `Generate a conventional commit message for these changes:

## Task
${ctx.currentTask}
${teamSummary}
## Changed Files
${status}

## Diff (truncated)
${diff}

Format: <type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
Be concise. Return ONLY the commit message, no explanation.`;

            const result = await providerManager.generate([
                { role: 'user', content: prompt },
            ]);

            const commitMessage = result.content
                .replace(/```/g, '')
                .replace(/^["']|["']$/g, '')
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

            // Report to team
            if (teamCtx) {
                const changedCount = status.split('\n').filter(l => l.trim()).length;

                teamCtx.sendMessage(
                    this.name,
                    'all',
                    'result',
                    `📦 Committed: ${commitMessage} (${changedCount} files)`,
                    { commitMessage, changedFiles: changedCount }
                );

                teamCtx.addArtifact('git-commit', {
                    name: commitMessage,
                    type: 'doc',
                    createdBy: this.name,
                    content: status,
                });

                teamCtx.addFinding('lastCommit', {
                    message: commitMessage,
                    files: changedCount,
                    timestamp: new Date().toISOString()
                });
            }

            return this.createOutput(
                true,
                `Committed: ${commitMessage}`,
                { commitMessage, changedFiles: status.split('\n').length },
                []
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';

            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ Git failed: ${message}`);
            }

            return this.createOutput(false, `Git operation failed: ${message}`, {});
        }
    }

    /**
     * Commit and push
     */
    async commitAndPush(): Promise<AgentOutput> {
        const teamCtx = getTeamContext();
        const commitResult = await this.execute();

        if (!commitResult.success) {
            return commitResult;
        }

        const ctx = this.getContext();

        try {
            execSync('git push', { cwd: ctx.projectRoot });
            logger.success('Pushed to remote');

            if (teamCtx) {
                teamCtx.sendMessage(
                    this.name,
                    'all',
                    'result',
                    `🚀 ${commitResult.message} and pushed to remote`
                );
            }

            return this.createOutput(
                true,
                `${commitResult.message} and pushed`,
                commitResult.data,
                []
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';

            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ Push failed: ${message}`);
            }

            return this.createOutput(false, `Push failed: ${message}`, {});
        }
    }
}

export const gitManagerAgent = new GitManagerAgent();
