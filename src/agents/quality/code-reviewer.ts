/**
 * Code Reviewer Agent
 * Comprehensive code review and quality assessment
 * Acts as Senior Code Reviewer - receives context from team
 */

import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
import { providerManager } from '../../providers/index.js';
import { logger } from '../../utils/logger.js';
import { readFileSync } from 'fs';

export class CodeReviewerAgent extends BaseAgent {
    constructor() {
        super({
            name: 'code-reviewer',
            description: 'Comprehensive code review and quality assessment',
            category: 'quality',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, 'Reviewing code...');

        try {
            // Get files from team context or previous agent
            let filesToReview: string[] = ctx.previousAgentOutput?.artifacts ?? [];

            // Also check team context for relevant files
            if (teamCtx) {
                const teamFiles = teamCtx.getFullContext().knowledge.codebaseInfo.relevantFiles;
                if (teamFiles.length > 0 && filesToReview.length === 0) {
                    filesToReview = teamFiles;
                    logger.info(`📁 Using ${teamFiles.length} files from Scout`);
                }

                // Check team progress
                const progress = teamCtx.getFullContext().knowledge.taskProgress;
                if (progress.tested) {
                    logger.info(`✅ Tests have passed - proceeding with review`);
                } else {
                    logger.warn(`⚠️ Tests haven't run yet - review may need update`);
                }
            }

            if (filesToReview.length === 0) {
                if (teamCtx) {
                    teamCtx.sendMessage(this.name, 'all', 'info', 'No files to review');
                }
                return this.createOutput(true, 'No files to review', {}, [], 'docs-manager');
            }

            const reviews: Array<{ file: string; review: string; score?: number }> = [];

            for (const file of filesToReview.slice(0, 5)) {
                try {
                    const content = readFileSync(file, 'utf-8');

                    const prompt = `You are a senior code reviewer. Review the following code:

File: ${file}
\`\`\`
${content.slice(0, 5000)}
\`\`\`

Provide:
1. **Quality Score** (1-10)
2. **Security Issues** (if any)
3. **Performance Concerns** (if any) 
4. **Best Practice Violations**
5. **Actionable Improvements** (specific suggestions)

Be concise and actionable.`;

                    const result = await providerManager.generate([
                        { role: 'user', content: prompt },
                    ]);

                    // Try to extract score
                    const scoreMatch = result.content.match(/(\d+)\s*\/?\s*10/);
                    const score = scoreMatch && scoreMatch[1] ? parseInt(scoreMatch[1], 10) : undefined;

                    reviews.push({ file, review: result.content, score });
                } catch {
                    reviews.push({ file, review: 'Could not read file' });
                }
            }

            logger.success(`Reviewed ${reviews.length} files`);

            // Share with team
            if (teamCtx) {
                teamCtx.updateProgress('reviewed', true);

                // Calculate average score
                const scores = reviews.filter(r => r.score).map(r => r.score!);
                const avgScore = scores.length > 0
                    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
                    : 'N/A';

                teamCtx.sendMessage(
                    this.name,
                    'all',
                    'result',
                    `📋 Reviewed ${reviews.length} files. Average score: ${avgScore}/10`,
                    { reviewCount: reviews.length, averageScore: avgScore }
                );

                // Add as artifact
                teamCtx.addArtifact('code-review', {
                    name: 'code-review-results',
                    type: 'analysis',
                    createdBy: this.name,
                    content: JSON.stringify(reviews.map(r => ({ file: r.file, score: r.score })), null, 2),
                });

                // Handoff to docs
                teamCtx.sendMessage(
                    this.name,
                    'docs-manager',
                    'handoff',
                    `Code review complete. Please update documentation.`,
                    { reviewComplete: true, filesReviewed: reviews.length }
                );

                teamCtx.addFinding('codeReview', { reviews, averageScore: avgScore });
            }

            return this.createOutput(
                true,
                `Reviewed ${reviews.length} files`,
                { reviews },
                [],
                'docs-manager'
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';

            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ Review failed: ${message}`);
            }

            return this.createOutput(false, `Review failed: ${message}`, {});
        }
    }
}

export const codeReviewerAgent = new CodeReviewerAgent();
