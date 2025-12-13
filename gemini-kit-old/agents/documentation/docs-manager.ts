/**
 * Docs Manager Agent
 * Manage technical documentation - AUTO-UPDATES README and CHANGELOG
 * NOW can update project README with new features
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
            description: 'Auto-update README, CHANGELOG, and technical docs',
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

            // Gather team context
            let teamSummary = '';
            let artifacts: string[] = [];
            const newFeatures: string[] = [];

            if (teamCtx) {
                const fullCtx = teamCtx.getFullContext();
                const progress = fullCtx.knowledge.taskProgress;

                artifacts = Array.from(fullCtx.artifacts.values())
                    .map(a => `- **${a.name}** (${a.type}) by ${a.createdBy}`)
                    .slice(0, 10);

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
                // Extract new features from task
                if (ctx.currentTask.toLowerCase().includes('add') ||
                    ctx.currentTask.toLowerCase().includes('create') ||
                    ctx.currentTask.toLowerCase().includes('implement')) {
                    newFeatures.push(ctx.currentTask);
                }
            }

            // Update CHANGELOG
            const changelogPath = await this.updateChangelog(ctx.projectRoot, ctx.currentTask, teamSummary);

            // Check if README should be updated
            let readmeUpdated = false;
            if (newFeatures.length > 0 && newFeatures[0]) {
                readmeUpdated = await this.updateReadme(ctx.projectRoot, newFeatures[0]);
            }

            logger.success('Documentation updated');

            // Report to team
            if (teamCtx) {
                teamCtx.updateProgress('documented', true);

                teamCtx.sendMessage(
                    this.name,
                    'all',
                    'result',
                    `📝 Docs updated: CHANGELOG${readmeUpdated ? ', README' : ''}`,
                    { changelogPath, readmeUpdated }
                );

                teamCtx.addArtifact('documentation', {
                    name: 'docs-update',
                    type: 'doc',
                    createdBy: this.name,
                    path: changelogPath,
                    content: `CHANGELOG updated${readmeUpdated ? ', README updated' : ''}`,
                });

                teamCtx.sendMessage(
                    this.name,
                    'git-manager',
                    'handoff',
                    'Documentation complete. Ready for commit.',
                    { docsUpdated: true, changelogPath, readmeUpdated }
                );
            }

            return this.createOutput(
                true,
                `Documentation updated${readmeUpdated ? ' (README included)' : ''}`,
                { changelogPath, readmeUpdated },
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

    /**
     * Update CHANGELOG.md with new entry
     */
    private async updateChangelog(projectRoot: string, task: string, teamSummary: string): Promise<string> {
        const docsDir = join(projectRoot, 'docs');
        const changelogPath = join(docsDir, 'CHANGELOG.md');
        const date = new Date().toISOString().split('T')[0];

        const prompt = `Generate a brief changelog entry for:

Task: ${task}
${teamSummary}

Format:
- **What changed**: Brief description
- **Files affected**: List key files

Be concise - max 50 words.`;

        const result = await providerManager.generate([{ role: 'user', content: prompt }]);

        const entry = `
## ${date}

### ${task}

${result.content}

---
`;

        writeFileSync(changelogPath, entry, { flag: 'a' });
        return changelogPath;
    }

    /**
     * Update README.md with new feature (if significant)
     */
    private async updateReadme(projectRoot: string, feature: string): Promise<boolean> {
        const readmePath = join(projectRoot, 'README.md');

        if (!existsSync(readmePath)) {
            return false;
        }

        try {
            const content = readFileSync(readmePath, 'utf-8');

            // Only update if README is not too large and doesn't already mention this
            if (content.length > 50000 || content.toLowerCase().includes(feature.toLowerCase().slice(0, 30))) {
                return false;
            }

            // Find features section or similar
            const featuresMatch = content.match(/##\s*(Features|New Features|What's New)[^\n]*\n/i);
            if (!featuresMatch) {
                return false; // No features section to update
            }

            const prompt = `Generate a single bullet point for README "Features" section:

Feature: ${feature}

Format: - **[Feature Name]** - Brief description (max 15 words)

Return ONLY the bullet point, nothing else.`;

            const result = await providerManager.generate([{ role: 'user', content: prompt }]);
            const bulletPoint = result.content.trim().split('\n')[0];

            // Insert after features header
            const insertIndex = featuresMatch.index! + featuresMatch[0].length;
            const newContent = content.slice(0, insertIndex) + bulletPoint + '\n' + content.slice(insertIndex);

            writeFileSync(readmePath, newContent);
            logger.success('README updated with new feature');
            return true;
        } catch (error) {
            logger.warn(`README update failed: ${error}`);
            return false;
        }
    }
}

export const docsManagerAgent = new DocsManagerAgent();
