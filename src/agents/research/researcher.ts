/**
 * Researcher Agent
 * Multi-source research with documentation analysis
 * NOW SAVES research to docs/research/ folder
 */

import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
import { providerManager } from '../../providers/index.js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger } from '../../utils/logger.js';

export class ResearcherAgent extends BaseAgent {
    constructor() {
        super({
            name: 'researcher',
            description: 'Multi-source research - saves to docs/research/',
            category: 'research',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, `Researching: ${ctx.currentTask}`);

        try {
            // Get project context
            const projectCtx = this.getProjectContext();

            // Get team context
            let additionalContext = '';
            if (teamCtx) {
                const codebaseFiles = teamCtx.getFullContext().knowledge.codebaseInfo.relevantFiles;
                if (codebaseFiles.length > 0) {
                    additionalContext = `\n\nProject files:\n${codebaseFiles.slice(0, 5).join('\n')}`;
                }
            }

            const prompt = `You are a technical researcher. Research the following:

Topic: ${ctx.currentTask}
${projectCtx ? `\n\nProject Context:\n${projectCtx.slice(0, 1000)}` : ''}
${additionalContext}

Provide:
1. **Overview** - What is it and why important
2. **Best Practices** - Industry standards
3. **Common Patterns** - How others solve this
4. **Potential Pitfalls** - What to avoid
5. **Recommended Libraries/Tools** - With pros/cons
6. **Implementation Example** - Code snippet if applicable
7. **References** - Where to learn more

Be thorough but concise.`;

            const result = await providerManager.generate([{ role: 'user', content: prompt }]);

            // Save research to file
            const researchPath = await this.saveResearch(ctx.projectRoot, ctx.currentTask, result.content);

            logger.success(`Research saved: ${researchPath}`);

            // Share with team
            if (teamCtx) {
                teamCtx.sendMessage(
                    this.name,
                    'all',
                    'result',
                    `🔍 Research complete - saved to ${researchPath}`,
                    { hasResearch: true, path: researchPath }
                );

                teamCtx.addArtifact('research', {
                    name: 'research-findings',
                    type: 'analysis',
                    createdBy: this.name,
                    path: researchPath,
                    content: result.content.slice(0, 2000),
                });

                teamCtx.addFinding('researchResults', {
                    topic: ctx.currentTask,
                    path: researchPath,
                });

                teamCtx.sendMessage(
                    this.name,
                    'planner',
                    'handoff',
                    'Research complete. Findings ready for planning.',
                    { researchReady: true, researchPath }
                );
            }

            return this.createOutput(
                true,
                `Research saved to ${researchPath}`,
                { research: result.content, researchPath },
                [researchPath],
                'planner'
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';

            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ Research failed: ${message}`);
            }

            return this.createOutput(false, message, {});
        }
    }

    /**
     * Save research to docs/research/ folder
     */
    private async saveResearch(projectRoot: string, topic: string, content: string): Promise<string> {
        const researchDir = join(projectRoot, 'docs', 'research');
        if (!existsSync(researchDir)) {
            mkdirSync(researchDir, { recursive: true });
        }

        const filename = topic
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .slice(0, 40);
        const date = new Date().toISOString().split('T')[0];
        const researchPath = join(researchDir, `${filename}-${date}.md`);

        const fileContent = `# Research: ${topic}

> Generated: ${new Date().toISOString()}
> Agent: Researcher

---

${content}
`;

        writeFileSync(researchPath, fileContent);
        return researchPath;
    }
}

export const researcherAgent = new ResearcherAgent();

