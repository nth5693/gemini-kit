/**
 * Copywriter Agent
 * Create high-converting marketing copy
 * NOW SAVES copy to docs/copy/ folder
 */

import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
import { providerManager } from '../../providers/index.js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger } from '../../utils/logger.js';

export class CopywriterAgent extends BaseAgent {
    constructor() {
        super({
            name: 'copywriter',
            description: 'Marketing copy - saves to docs/copy/',
            category: 'creative',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, `Writing copy: ${ctx.currentTask}`);

        try {
            const projectCtx = this.getProjectContext();

            let additionalContext = '';
            if (teamCtx) {
                const artifacts = Array.from(teamCtx.getFullContext().artifacts.values());
                const brainstorm = artifacts.find(a => a.name === 'brainstorm-ideas');
                const design = artifacts.find(a => a.name === 'ui-ux-design');

                if (brainstorm?.content) additionalContext += `\n\nIdeas:\n${String(brainstorm.content).slice(0, 500)}`;
                if (design?.content) additionalContext += `\n\nDesign:\n${String(design.content).slice(0, 500)}`;
            }

            const prompt = `You are an expert copywriter. Create compelling copy for:

Task: ${ctx.currentTask}
${projectCtx ? `\nProject: ${projectCtx.slice(0, 500)}` : ''}
${additionalContext}

Provide:
1. **Headlines** (3 options)
2. **Subheadlines** (3 options)
3. **Body Copy** (short, medium, long)
4. **Call-to-Action** (3 options)
5. **SEO Meta Description**

Focus on benefits, power words, urgency.`;

            const result = await providerManager.generate([{ role: 'user', content: prompt }]);

            // Save copy to file
            const copyPath = await this.saveCopy(ctx.projectRoot, ctx.currentTask, result.content);
            logger.success(`Copy saved: ${copyPath}`);

            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'result',
                    `✍️ Copy saved to ${copyPath}`, { hasCopy: true, path: copyPath });

                teamCtx.addArtifact('marketing-copy', {
                    name: 'copywriter-output', type: 'doc', createdBy: this.name,
                    path: copyPath, content: result.content.slice(0, 2000),
                });

                teamCtx.sendMessage(this.name, 'ui-ux-designer', 'handoff',
                    'Copy ready for design.', { copyReady: true, copyPath });
            }

            return this.createOutput(true, `Copy saved to ${copyPath}`,
                { copy: result.content, copyPath }, [copyPath], 'ui-ux-designer');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            if (teamCtx) teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ Copy failed: ${message}`);
            return this.createOutput(false, message, {});
        }
    }

    private async saveCopy(projectRoot: string, topic: string, content: string): Promise<string> {
        const dir = join(projectRoot, 'docs', 'copy');
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

        const filename = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
        const date = new Date().toISOString().split('T')[0];
        const path = join(dir, `${filename}-${date}.md`);

        writeFileSync(path, `# Copy: ${topic}\n\n> Generated: ${new Date().toISOString()}\n\n---\n\n${content}\n`);
        return path;
    }
}

export const copywriterAgent = new CopywriterAgent();

