/**
 * Project Manager Agent
 * Comprehensive project oversight and coordination
 * NOW SAVES reports to docs/reports/ folder
 */

import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
import { providerManager } from '../../providers/index.js';
import { readdirSync, statSync, readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger } from '../../utils/logger.js';

export class ProjectManagerAgent extends BaseAgent {
    constructor() {
        super({
            name: 'project-manager',
            description: 'Project reports - saves to docs/reports/',
            category: 'documentation',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, 'Analyzing project status...');

        try {
            const projectCtx = this.getProjectContext();

            const packageJsonPath = join(ctx.projectRoot, 'package.json');
            let packageInfo: Record<string, unknown> = {};
            if (existsSync(packageJsonPath)) {
                packageInfo = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
            }

            const srcDir = join(ctx.projectRoot, 'src');
            const fileCount = this.countFiles(srcDir);
            const issues = this.checkCommonIssues(ctx.projectRoot);

            let teamStatus = '';
            if (teamCtx) {
                const fullCtx = teamCtx.getFullContext();
                const progress = fullCtx.knowledge.taskProgress;
                const members = fullCtx.activeMembers;
                const artifacts = Array.from(fullCtx.artifacts.values());

                teamStatus = `
Team: ${members.map(m => m.name).join(', ') || 'None active'}
Progress: Planned ${progress.planned ? '✅' : '❌'}, Tested ${progress.tested ? '✅' : '❌'}, Reviewed ${progress.reviewed ? '✅' : '❌'}
Artifacts: ${artifacts.length}`;
            }

            const prompt = `You are a project manager. Status report:

Project: ${packageInfo.name || 'Unknown'}
Version: ${packageInfo.version || 'Unknown'}
Files: ${fileCount}
Task: ${ctx.currentTask}
${projectCtx ? `\nContext: ${projectCtx.slice(0, 500)}` : ''}
${teamStatus}
Issues: ${issues.join(', ') || 'None'}

Provide:
1. Health Summary (Good/Warning/Critical)
2. Key Metrics
3. Recommended Actions
4. Risk Assessment

Be concise.`;

            const result = await providerManager.generate([{ role: 'user', content: prompt }]);

            // Save report to file
            const reportPath = await this.saveReport(ctx.projectRoot, result.content, fileCount, issues);
            logger.success(`Report saved: ${reportPath}`);

            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'result',
                    `📊 Report saved to ${reportPath}`, { hasReport: true, path: reportPath });

                teamCtx.addArtifact('project-report', {
                    name: 'project-status', type: 'doc',
                    createdBy: this.name, path: reportPath,
                    content: result.content.slice(0, 2000),
                });

                teamCtx.addFinding('projectStatus', {
                    fileCount, issues,
                    health: result.content.includes('Good') ? 'good' :
                        result.content.includes('Warning') ? 'warning' : 'critical',
                });
            }

            return this.createOutput(true, `Report saved to ${reportPath}`,
                { report: result.content, reportPath, metrics: { fileCount, issues } },
                [reportPath]);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            if (teamCtx) teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ Report failed: ${message}`);
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
                if (stat.isDirectory()) count += this.countFiles(fullPath);
                else count++;
            }
        } catch { /* ignore */ }
        return count;
    }

    private checkCommonIssues(projectRoot: string): string[] {
        const issues: string[] = [];
        if (!existsSync(join(projectRoot, '.gitignore'))) issues.push('Missing .gitignore');
        if (!existsSync(join(projectRoot, 'README.md'))) issues.push('Missing README');
        if (!existsSync(join(projectRoot, 'tests'))) issues.push('No tests/');
        return issues;
    }

    private async saveReport(projectRoot: string, content: string, files: number, issues: string[]): Promise<string> {
        const dir = join(projectRoot, 'docs', 'reports');
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

        const date = new Date().toISOString().split('T')[0];
        const path = join(dir, `project-status-${date}.md`);

        writeFileSync(path, `# Project Status Report

> Generated: ${new Date().toISOString()}
> Files: ${files} | Issues: ${issues.length}

---

${content}
`);
        return path;
    }
}

export const projectManagerAgent = new ProjectManagerAgent();

