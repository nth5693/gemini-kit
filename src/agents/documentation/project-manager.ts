/**
 * Project Manager Agent
 * Comprehensive project oversight and coordination
 * Has full view of team context and progress
 */

import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
import { providerManager } from '../../providers/index.js';
import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from '../../utils/logger.js';

export class ProjectManagerAgent extends BaseAgent {
    constructor() {
        super({
            name: 'project-manager',
            description: 'Comprehensive project oversight and coordination',
            category: 'documentation',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, 'Analyzing project status...');

        try {
            // Gather project info
            const packageJsonPath = join(ctx.projectRoot, 'package.json');
            let packageInfo = {};
            if (existsSync(packageJsonPath)) {
                packageInfo = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
            }

            // Count files
            const srcDir = join(ctx.projectRoot, 'src');
            const fileCount = this.countFiles(srcDir);

            // Check for common issues
            const issues = this.checkCommonIssues(ctx.projectRoot);

            // Get team context
            let teamStatus = '';
            if (teamCtx) {
                const fullCtx = teamCtx.getFullContext();
                const progress = fullCtx.knowledge.taskProgress;
                const members = fullCtx.activeMembers;
                const artifacts = Array.from(fullCtx.artifacts.values());

                teamStatus = `
Team Status:
- Active Members: ${members.map(m => m.name).join(', ') || 'None'}
- Progress: Planned ${progress.planned ? '✅' : '❌'}, Tested ${progress.tested ? '✅' : '❌'}, Reviewed ${progress.reviewed ? '✅' : '❌'}
- Artifacts: ${artifacts.length} created
- Messages: ${fullCtx.messageLog.length} exchanged`;
            }

            const prompt = `You are a project manager. Provide a project status report:

Project: ${(packageInfo as { name?: string }).name ?? 'Unknown'}
Version: ${(packageInfo as { version?: string }).version ?? 'Unknown'}
Source Files: ${fileCount}
Current Task: ${ctx.currentTask}
${teamStatus}

Issues Found: ${issues.join(', ') || 'None'}

Provide:
1. Project Health Summary (Good/Warning/Critical)
2. Key Metrics
3. Team Progress Assessment
4. Recommended Actions
5. Risk Assessment

Be concise.`;

            const result = await providerManager.generate([
                { role: 'user', content: prompt },
            ]);

            logger.success('Project status report generated');

            // Share with team
            if (teamCtx) {
                teamCtx.sendMessage(
                    this.name,
                    'all',
                    'result',
                    '📊 Project status report generated',
                    { hasReport: true, fileCount, issues }
                );

                teamCtx.addArtifact('project-report', {
                    name: 'project-status',
                    type: 'doc',
                    createdBy: this.name,
                    content: result.content.slice(0, 2000),
                });

                teamCtx.addFinding('projectStatus', {
                    fileCount,
                    issues,
                    health: result.content.includes('Good') ? 'good' :
                        result.content.includes('Warning') ? 'warning' : 'critical',
                });
            }

            return this.createOutput(
                true,
                'Project status report generated',
                {
                    report: result.content,
                    metrics: { fileCount, issues },
                },
                []
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';

            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ Project analysis failed: ${message}`);
            }

            return this.createOutput(false, message, {});
        }
    }

    private countFiles(dir: string): number {
        let count = 0;
        try {
            const entries = readdirSync(dir);
            for (const entry of entries) {
                const fullPath = join(dir, entry);
                const stat = statSync(fullPath);
                if (stat.isDirectory()) {
                    count += this.countFiles(fullPath);
                } else {
                    count++;
                }
            }
        } catch {
            // Ignore errors
        }
        return count;
    }

    private checkCommonIssues(projectRoot: string): string[] {
        const issues: string[] = [];

        if (!existsSync(join(projectRoot, '.gitignore'))) {
            issues.push('Missing .gitignore');
        }
        if (!existsSync(join(projectRoot, 'README.md'))) {
            issues.push('Missing README.md');
        }
        if (!existsSync(join(projectRoot, 'tests'))) {
            issues.push('No tests directory');
        }

        return issues;
    }
}

export const projectManagerAgent = new ProjectManagerAgent();
