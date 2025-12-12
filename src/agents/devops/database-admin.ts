/**
 * Database Admin Agent
 * Database optimization, query analysis, and administration
 * Shares findings with team for planning
 */

import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
import { providerManager } from '../../providers/index.js';
import { logger } from '../../utils/logger.js';

export class DatabaseAdminAgent extends BaseAgent {
    constructor() {
        super({
            name: 'database-admin',
            description: 'Database optimization, query analysis, and administration',
            category: 'devops',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, `Analyzing database: ${ctx.currentTask}`);

        try {
            // Get context from team
            let additionalContext = '';
            if (teamCtx) {
                const relevantFiles = teamCtx.getFullContext().knowledge.codebaseInfo.relevantFiles
                    .filter(f => f.includes('db') || f.includes('model') || f.includes('schema') || f.includes('migration'));
                if (relevantFiles.length > 0) {
                    additionalContext = `\n\nRelevant DB files found:\n${relevantFiles.slice(0, 5).join('\n')}`;
                }
            }

            const prompt = `You are a database administrator expert. Analyze and provide recommendations for:

Task: ${ctx.currentTask}
${additionalContext}
${ctx.sharedData.schema ? `Schema:\n${ctx.sharedData.schema}` : ''}
${ctx.sharedData.query ? `Query:\n${ctx.sharedData.query}` : ''}

Provide:
1. **Analysis** - What the current state looks like
2. **Optimizations** - Query/schema improvements
3. **Indexing Recommendations**
4. **Security Considerations**
5. **Backup Strategy**
6. **Migration Plan** (if applicable)

Support: PostgreSQL, MySQL, MongoDB, SQLite, Redis.`;

            const result = await providerManager.generate([
                { role: 'user', content: prompt },
            ]);

            logger.success('Database analysis complete');

            // Share with team
            if (teamCtx) {
                teamCtx.sendMessage(
                    this.name,
                    'all',
                    'result',
                    '🗄️ Database analysis complete',
                    { hasAnalysis: true }
                );

                teamCtx.addArtifact('db-analysis', {
                    name: 'database-recommendations',
                    type: 'analysis',
                    createdBy: this.name,
                    content: result.content.slice(0, 2000),
                });

                teamCtx.addFinding('databaseAnalysis', {
                    task: ctx.currentTask,
                    recommendations: result.content.slice(0, 1500),
                });
            }

            return this.createOutput(
                true,
                'Database analysis complete',
                { analysis: result.content },
                []
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';

            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ DB analysis failed: ${message}`);
            }

            return this.createOutput(false, message, {});
        }
    }
}

export const databaseAdminAgent = new DatabaseAdminAgent();
