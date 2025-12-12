/**
 * UI/UX Designer Agent
 * Design interfaces, wireframes, and user experiences
 * NOW SAVES designs to docs/design/ folder
 */

import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
import { providerManager } from '../../providers/index.js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger } from '../../utils/logger.js';

export class UiUxDesignerAgent extends BaseAgent {
    constructor() {
        super({
            name: 'ui-ux-designer',
            description: 'UI/UX design - saves to docs/design/',
            category: 'creative',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, `Designing: ${ctx.currentTask}`);

        try {
            const projectCtx = this.getProjectContext();

            let additionalContext = '';
            if (teamCtx) {
                const artifacts = Array.from(teamCtx.getFullContext().artifacts.values());
                const plan = artifacts.find(a => a.type === 'plan');
                const brainstorm = artifacts.find(a => a.name === 'brainstorm-ideas');

                if (plan?.content) additionalContext += `\n\nPlan:\n${String(plan.content).slice(0, 500)}`;
                if (brainstorm?.content) additionalContext += `\n\nIdeas:\n${String(brainstorm.content).slice(0, 500)}`;
            }

            const prompt = `You are a senior UI/UX designer. Create a design spec for:

Task: ${ctx.currentTask}
${projectCtx ? `\nProject: ${projectCtx.slice(0, 500)}` : ''}
${additionalContext}

Provide:
1. **User Flow** - Interaction steps
2. **Component Structure** - React/Vue hierarchy
3. **Design Tokens** - Colors, spacing, typography
4. **Responsive Behavior** - Mobile, tablet, desktop
5. **Accessibility** - WCAG considerations
6. **CSS/Tailwind Classes** - Styling suggestions

Include ASCII wireframes where helpful.`;

            const result = await providerManager.generate([{ role: 'user', content: prompt }]);

            // Save design to file
            const designPath = await this.saveDesign(ctx.projectRoot, ctx.currentTask, result.content);
            logger.success(`Design saved: ${designPath}`);

            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'result',
                    `🎨 Design saved to ${designPath}`, { hasDesign: true, path: designPath });

                teamCtx.addArtifact('design-spec', {
                    name: 'ui-ux-design', type: 'doc', createdBy: this.name,
                    path: designPath, content: result.content.slice(0, 2000),
                });

                teamCtx.sendMessage(this.name, 'coder', 'handoff',
                    'Design ready for implementation.', { designReady: true, designPath });
            }

            return this.createOutput(true, `Design saved to ${designPath}`,
                { design: result.content, designPath }, [designPath], 'coder');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            if (teamCtx) teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ Design failed: ${message}`);
            return this.createOutput(false, message, {});
        }
    }

    private async saveDesign(projectRoot: string, topic: string, content: string): Promise<string> {
        const dir = join(projectRoot, 'docs', 'design');
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

        const filename = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
        const date = new Date().toISOString().split('T')[0];
        const path = join(dir, `${filename}-${date}.md`);

        writeFileSync(path, `# Design: ${topic}\n\n> Generated: ${new Date().toISOString()}\n\n---\n\n${content}\n`);
        return path;
    }
}

export const uiUxDesignerAgent = new UiUxDesignerAgent();

