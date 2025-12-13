/**
 * Database Admin Agent
 * Database optimization, query analysis, and administration
 * NOW SAVES analysis to docs/database/ folder
 */

import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
import { providerManager } from '../../providers/index.js';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../../utils/logger.js';

export class DatabaseAdminAgent extends BaseAgent {
    constructor() {
        super({
            name: 'database-admin',
            description: 'DB optimization - saves to docs/database/',
            category: 'devops',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, `Analyzing database: ${ctx.currentTask}`);

        try {
            const projectCtx = this.getProjectContext();

            // Find schema files
            const schemaContent = this.findSchemaFiles(ctx.projectRoot);

            let additionalContext = '';
            if (teamCtx) {
                const relevantFiles = teamCtx.getFullContext().knowledge.codebaseInfo.relevantFiles
                    .filter(f => f.includes('db') || f.includes('model') || f.includes('schema') || f.includes('migration'));
                if (relevantFiles.length > 0) {
                    additionalContext = `\n\nDB files:\n${relevantFiles.slice(0, 5).join('\n')}`;
                }
            }

            const prompt = `You are a database administrator. Analyze and recommend:

Task: ${ctx.currentTask}
${projectCtx ? `\nProject: ${projectCtx.slice(0, 500)}` : ''}
${schemaContent ? `\nSchema:\n${schemaContent}` : ''}
${additionalContext}

Provide:
1. **Analysis** - Current state
2. **Optimizations** - Query/schema improvements
3. **Indexing** - Recommended indexes
4. **Security** - Considerations
5. **Migration Plan** - If applicable

Support: PostgreSQL, MySQL, MongoDB, SQLite, Prisma.`;

            const result = await providerManager.generate([{ role: 'user', content: prompt }]);

            // Save analysis to file
            const analysisPath = await this.saveAnalysis(ctx.projectRoot, ctx.currentTask, result.content);
            logger.success(`DB analysis saved: ${analysisPath}`);

            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'result',
                    `🗄️ DB analysis saved to ${analysisPath}`, { hasAnalysis: true, path: analysisPath });

                teamCtx.addArtifact('db-analysis', {
                    name: 'database-recommendations', type: 'analysis',
                    createdBy: this.name, path: analysisPath,
                    content: result.content.slice(0, 2000),
                });
            }

            return this.createOutput(true, `Analysis saved to ${analysisPath}`,
                { analysis: result.content, analysisPath }, [analysisPath]);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            if (teamCtx) teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ DB analysis failed: ${message}`);
            return this.createOutput(false, message, {});
        }
    }

    private findSchemaFiles(projectRoot: string): string {
        const schemaPaths = [
            'prisma/schema.prisma',
            'src/db/schema.ts',
            'src/models/index.ts',
            'src/schema.sql',
        ];

        for (const schemaPath of schemaPaths) {
            const fullPath = join(projectRoot, schemaPath);
            if (existsSync(fullPath)) {
                return readFileSync(fullPath, 'utf-8').slice(0, 2000);
            }
        }
        return '';
    }

    private async saveAnalysis(projectRoot: string, topic: string, content: string): Promise<string> {
        const dir = join(projectRoot, 'docs', 'database');
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

        const filename = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
        const date = new Date().toISOString().split('T')[0];
        const path = join(dir, `${filename}-${date}.md`);

        writeFileSync(path, `# DB Analysis: ${topic}\n\n> Generated: ${new Date().toISOString()}\n\n---\n\n${content}\n`);
        return path;
    }
}

export const databaseAdminAgent = new DatabaseAdminAgent();

