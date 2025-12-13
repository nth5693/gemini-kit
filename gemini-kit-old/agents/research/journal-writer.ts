/**
 * Journal Writer Agent
 * Document technical difficulties and project journey
 * Documents team activities and progress
 */

import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
import { providerManager } from '../../providers/index.js';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../../utils/logger.js';

export class JournalWriterAgent extends BaseAgent {
    constructor() {
        super({
            name: 'journal-writer',
            description: 'Document technical difficulties and project journey',
            category: 'research',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, 'Writing journal entry...');

        try {
            const journalsDir = join(ctx.projectRoot, 'journals');
            if (!existsSync(journalsDir)) {
                mkdirSync(journalsDir, { recursive: true });
            }

            const today = new Date().toISOString().split('T')[0];
            const journalPath = join(journalsDir, `${today}.md`);

            // Read existing journal if exists
            let existingContent = '';
            if (existsSync(journalPath)) {
                existingContent = readFileSync(journalPath, 'utf-8');
            }

            // Get team context
            let teamSummary = '';
            if (teamCtx) {
                const fullCtx = teamCtx.getFullContext();
                const progress = fullCtx.knowledge.taskProgress;
                const artifacts = Array.from(fullCtx.artifacts.values());
                const recentMessages = fullCtx.messageLog.slice(-5);

                teamSummary = `
## Team Activity Summary
- Task: ${fullCtx.currentTask}
- Progress: Planned ${progress.planned ? '✅' : '❌'}, Tested ${progress.tested ? '✅' : '❌'}, Reviewed ${progress.reviewed ? '✅' : '❌'}
- Artifacts Created: ${artifacts.map(a => a.name).join(', ') || 'None'}
- Recent Team Messages:
${recentMessages.map(m => `  - ${m.from} → ${m.to}: ${m.content.slice(0, 50)}...`).join('\n')}`;
            }

            const prompt = `You are a technical journal writer. Write a journal entry for:

Task: ${ctx.currentTask}
${teamSummary}

Previous Agent Output: ${JSON.stringify(ctx.previousAgentOutput?.data, null, 2).slice(0, 1000)}

Existing journal today:
${existingContent.slice(0, 500)}

Write a brief journal entry covering:
1. What was done
2. Team collaboration notes
3. Challenges encountered
4. Solutions applied
5. Lessons learned
6. Next steps

Keep it concise but informative.`;

            const result = await providerManager.generate([
                { role: 'user', content: prompt },
            ]);

            const entry = `
## ${new Date().toLocaleTimeString()}

${result.content}

---
`;

            writeFileSync(journalPath, existingContent + entry);
            logger.success(`Journal entry saved: ${journalPath}`);

            // Share with team
            if (teamCtx) {
                teamCtx.sendMessage(
                    this.name,
                    'all',
                    'result',
                    '📓 Journal entry created',
                    { journalPath, date: today }
                );

                teamCtx.addArtifact('journal-entry', {
                    name: `journal-${today}`,
                    type: 'doc',
                    createdBy: this.name,
                    path: journalPath,
                    content: entry,
                });

                teamCtx.addFinding('journalEntry', {
                    date: today,
                    path: journalPath,
                });
            }

            return this.createOutput(
                true,
                'Journal entry created',
                { journalPath },
                [journalPath]
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';

            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ Journal failed: ${message}`);
            }

            return this.createOutput(false, message, {});
        }
    }
}

export const journalWriterAgent = new JournalWriterAgent();
