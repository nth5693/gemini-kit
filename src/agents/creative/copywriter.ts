/**
 * Copywriter Agent
 * Create high-converting marketing copy
 * Shares copy with team for design and implementation
 */

import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
import { providerManager } from '../../providers/index.js';
import { logger } from '../../utils/logger.js';

export class CopywriterAgent extends BaseAgent {
    constructor() {
        super({
            name: 'copywriter',
            description: 'Create high-converting marketing copy',
            category: 'creative',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, `Writing copy: ${ctx.currentTask}`);

        try {
            // Get context from team
            let additionalContext = '';
            if (teamCtx) {
                const artifacts = Array.from(teamCtx.getFullContext().artifacts.values());
                const brainstormArtifact = artifacts.find(a => a.name === 'brainstorm-ideas');
                const designArtifact = artifacts.find(a => a.name === 'ui-ux-design');

                if (brainstormArtifact && brainstormArtifact.content) {
                    additionalContext += `\n\nBrainstorm Ideas:\n${String(brainstormArtifact.content).slice(0, 500)}`;
                }
                if (designArtifact && designArtifact.content) {
                    additionalContext += `\n\nDesign Context:\n${String(designArtifact.content).slice(0, 500)}`;
                }
            }

            const prompt = `You are an expert copywriter. Create compelling copy for:

Task: ${ctx.currentTask}
${additionalContext}

Provide multiple versions:
1. **Headlines** (3 options)
2. **Subheadlines** (3 options)
3. **Body Copy** (short, medium, long versions)
4. **Call-to-Action** (3 options)
5. **SEO Meta Description**

Focus on benefits, use power words, create urgency.`;

            const result = await providerManager.generate([
                { role: 'user', content: prompt },
            ]);

            logger.success('Copy created');

            // Share with team
            if (teamCtx) {
                teamCtx.sendMessage(
                    this.name,
                    'all',
                    'result',
                    '✍️ Marketing copy created',
                    { hasCopy: true }
                );

                teamCtx.addArtifact('marketing-copy', {
                    name: 'copywriter-output',
                    type: 'doc',
                    createdBy: this.name,
                    content: result.content.slice(0, 2000),
                });

                teamCtx.addFinding('marketingCopy', {
                    task: ctx.currentTask,
                    copy: result.content.slice(0, 1500),
                });

                // Handoff to UI designer
                teamCtx.sendMessage(
                    this.name,
                    'ui-ux-designer',
                    'handoff',
                    'Copy is ready. Use these texts for the design.',
                    { copyReady: true }
                );
            }

            return this.createOutput(
                true,
                'Copy created',
                { copy: result.content },
                [],
                'ui-ux-designer'
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';

            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ Copywriting failed: ${message}`);
            }

            return this.createOutput(false, message, {});
        }
    }
}

export const copywriterAgent = new CopywriterAgent();
