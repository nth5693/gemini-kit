/**
 * Brainstormer Agent
 * Explore ideas, challenge assumptions, debate decisions
 * NOW SAVES ideas to docs/brainstorm/ folder
 */

import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
import { providerManager } from '../../providers/index.js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger } from '../../utils/logger.js';

export class BrainstormerAgent extends BaseAgent {
    constructor() {
        super({
            name: 'brainstormer',
            description: 'Explore ideas - saves to docs/brainstorm/',
            category: 'creative',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, `Brainstorming: ${ctx.currentTask}`);

        try {
            const projectCtx = this.getProjectContext();

            let additionalContext = '';
            if (teamCtx) {
                const findings = teamCtx.getFullContext().knowledge.findings;
                if (Object.keys(findings).length > 0) {
                    additionalContext = `\n\nTeam findings:\n${JSON.stringify(findings, null, 2).slice(0, 500)}`;
                }
            }

            const prompt = `You are a creative brainstorming partner. For the topic:

Topic: ${ctx.currentTask}
${projectCtx ? `\nProject: ${projectCtx.slice(0, 500)}` : ''}
${additionalContext}

Provide:
1. **Multiple Approaches** (at least 3 different ways)
2. **Pros and Cons** of each
3. **Out-of-the-box Ideas** (unconventional solutions)
4. **Potential Challenges** and solutions
5. **Recommended Approach** with justification

Be creative and thorough.`;

            const result = await providerManager.generate([{ role: 'user', content: prompt }]);

            // Save ideas to file
            const ideasPath = await this.saveIdeas(ctx.projectRoot, ctx.currentTask, result.content);
            logger.success(`Ideas saved: ${ideasPath}`);

            // Share with team
            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'result',
                    `💡 Brainstorming complete - saved to ${ideasPath}`,
                    { hasIdeas: true, path: ideasPath }
                );

                teamCtx.addArtifact('brainstorm', {
                    name: 'brainstorm-ideas',
                    type: 'analysis',
                    createdBy: this.name,
                    path: ideasPath,
                    content: result.content.slice(0, 2000),
                });

                teamCtx.sendMessage(this.name, 'planner', 'handoff',
                    'Brainstorming complete. Ideas ready for planning.',
                    { ideasReady: true, ideasPath }
                );
            }

            return this.createOutput(true, `Ideas saved to ${ideasPath}`,
                { ideas: result.content, ideasPath },
                [ideasPath], 'planner'
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ Brainstorming failed: ${message}`);
            }
            return this.createOutput(false, message, {});
        }
    }

    private async saveIdeas(projectRoot: string, topic: string, content: string): Promise<string> {
        const dir = join(projectRoot, 'docs', 'brainstorm');
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

        const filename = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
        const date = new Date().toISOString().split('T')[0];
        const path = join(dir, `${filename}-${date}.md`);

        writeFileSync(path, `# Brainstorm: ${topic}\n\n> Generated: ${new Date().toISOString()}\n\n---\n\n${content}\n`);
        return path;
    }
}

export const brainstormerAgent = new BrainstormerAgent();

