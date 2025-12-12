/**
 * Docs Manager Agent
 * Manage technical documentation and standards
 * Acts as Tech Writer - documents team progress
 */

import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
import { providerManager } from '../../providers/index.js';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../../utils/logger.js';

export class DocsManagerAgent extends BaseAgent {
    constructor() {
        super({
            name: 'docs-manager',
            description: 'Manage technical documentation and standards',
            category: 'documentation',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, 'Updating documentation...');

        try {
            const docsDir = join(ctx.projectRoot, 'docs');
            if (!existsSync(docsDir)) {
                mkdirSync(docsDir, { recursive: true });
            }

            // Gather team context for better docs
            let teamSummary = '';
            let artifacts: string[] = [];

            if (teamCtx) {
                const fullCtx = teamCtx.getFullContext();
                const progress = fullCtx.knowledge.taskProgress;

                // Get team artifacts
                artifacts = Array.from(fullCtx.artifacts.values())
                    .map(a => `- **${a.name}** (${a.type}) by ${a.createdBy}`)
                    .slice(0, 10);

                // Get key findings
                const findings = fullCtx.knowledge.findings;

                teamSummary = `
## Team Work Summary
- Planned: ${progress.planned ? '✅' : '❌'}
- Tested: ${progress.tested ? '✅' : '❌'}
- Reviewed: ${progress.reviewed ? '✅' : '❌'}

## Artifacts Created
${artifacts.join('\n')}

## Key Findings
${Object.entries(findings).slice(0, 5).map(([k, v]) =>
                    `- **${k}**: ${typeof v === 'object' ? JSON.stringify(v).slice(0, 100) : v}`
                ).join('\n')}
`;
            }

            // Generate documentation
            const prompt = `You are a technical writer. Generate a brief documentation update:

## Task
${ctx.currentTask}

${teamSummary}

## Previous Agent Results
${JSON.stringify(ctx.previousAgentOutput?.data, null, 2).slice(0, 1500)}

Provide a concise markdown section documenting:
1. What was changed
2. Key decisions made
3. Any important notes

Be brief and factual.`;

            const result = await providerManager.generate([
                { role: 'user', content: prompt },
            ]);

            // Update changelog
            const changelogPath = join(docsDir, 'CHANGELOG.md');
            const date = new Date().toISOString().split('T')[0];
            const entry = `
## ${date}

### ${ctx.currentTask}

${result.content}

---
`;

            writeFileSync(changelogPath, entry, { flag: 'a' });
            logger.success('Documentation updated');

            // Report to team
            if (teamCtx) {
                teamCtx.updateProgress('documented', true);

                teamCtx.sendMessage(
                    this.name,
                    'all',
                    'result',
                    `📝 Documentation updated: ${changelogPath}`,
                    { changelogPath, date }
                );

                teamCtx.addArtifact('documentation', {
                    name: 'changelog-entry',
                    type: 'doc',
                    createdBy: this.name,
                    path: changelogPath,
                    content: entry,
                });

                // Handoff to git
                teamCtx.sendMessage(
                    this.name,
                    'git-manager',
                    'handoff',
                    'Documentation complete. Ready for commit.',
                    { docsUpdated: true, changelogPath }
                );
            }

            return this.createOutput(
                true,
                'Documentation updated',
                { changelogPath },
                [changelogPath],
                'git-manager'
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';

            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ Docs failed: ${message}`);
            }

            return this.createOutput(false, `Docs update failed: ${message}`, {});
        }
    }
}

export const docsManagerAgent = new DocsManagerAgent();
