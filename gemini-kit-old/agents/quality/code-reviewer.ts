/**
 * Code Reviewer Agent
 * Comprehensive code review with ESLint AUTO-FIX
 * NOW runs ESLint --fix and provides AI review
 */

import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
import { providerManager } from '../../providers/index.js';
import { logger } from '../../utils/logger.js';
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

interface LintIssue {
    file: string;
    line: number;
    column: number;
    severity: 'error' | 'warning';
    message: string;
    ruleId: string;
}

export class CodeReviewerAgent extends BaseAgent {
    constructor() {
        super({
            name: 'code-reviewer',
            description: 'Comprehensive code review with ESLint auto-fix',
            category: 'quality',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, 'Reviewing code...');

        try {
            // Get files from team context
            let filesToReview: string[] = ctx.previousAgentOutput?.artifacts ?? [];

            if (teamCtx) {
                const teamFiles = teamCtx.getFullContext().knowledge.codebaseInfo.relevantFiles;
                if (teamFiles.length > 0 && filesToReview.length === 0) {
                    filesToReview = teamFiles;
                    logger.info(`📁 Using ${teamFiles.length} files from Scout`);
                }

                const progress = teamCtx.getFullContext().knowledge.taskProgress;
                if (progress.tested) {
                    logger.info(`✅ Tests have passed - proceeding with review`);
                } else {
                    logger.warn(`⚠️ Tests haven't run yet - review may need update`);
                }
            }

            if (filesToReview.length === 0) {
                if (teamCtx) {
                    teamCtx.sendMessage(this.name, 'all', 'info', 'No files to review');
                }
                return this.createOutput(true, 'No files to review', {}, [], 'docs-manager');
            }

            // Step 1: Run ESLint with auto-fix
            const lintResult = await this.runEslintFix(ctx.projectRoot, filesToReview);

            // Step 2: AI review remaining issues and code quality
            const reviews: Array<{ file: string; review: string; score?: number }> = [];

            for (const file of filesToReview.slice(0, 5)) {
                try {
                    if (!existsSync(file)) continue;

                    const content = readFileSync(file, 'utf-8');
                    const fileIssues = lintResult.issues.filter(i => i.file.includes(file.split('/').pop()!));

                    const prompt = `You are a senior code reviewer. Review the following code:

File: ${file}
\`\`\`
${content.slice(0, 4000)}
\`\`\`

${fileIssues.length > 0 ? `ESLint Issues:\n${fileIssues.map(i => `- L${i.line}: ${i.message} (${i.ruleId})`).join('\n')}` : 'ESLint: Clean ✅'}

Provide brief review:
1. **Quality Score** (1-10)
2. **Security Issues** (if any)
3. **Top 3 Improvements**

Be concise - max 200 words.`;

                    const result = await providerManager.generate([{ role: 'user', content: prompt }]);
                    const scoreMatch = result.content.match(/(\d+)\s*\/?10/);
                    const score = scoreMatch?.[1] ? parseInt(scoreMatch[1], 10) : undefined;

                    reviews.push({ file, review: result.content, score });
                } catch {
                    reviews.push({ file, review: 'Could not read file' });
                }
            }

            logger.success(`Reviewed ${reviews.length} files`);

            // Report to team
            if (teamCtx) {
                teamCtx.updateProgress('reviewed', true);

                const scores = reviews.filter(r => r.score).map(r => r.score!);
                const avgScore = scores.length > 0
                    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
                    : 'N/A';

                teamCtx.sendMessage(
                    this.name,
                    'all',
                    'result',
                    `📋 Reviewed ${reviews.length} files. Score: ${avgScore}/10. ESLint fixed ${lintResult.fixedCount} issues.`,
                    { reviewCount: reviews.length, averageScore: avgScore, eslintFixed: lintResult.fixedCount }
                );

                teamCtx.addArtifact('code-review', {
                    name: 'code-review-results',
                    type: 'analysis',
                    createdBy: this.name,
                    content: JSON.stringify({
                        reviews: reviews.map(r => ({ file: r.file, score: r.score })),
                        eslint: { fixed: lintResult.fixedCount, remaining: lintResult.issues.length }
                    }, null, 2),
                });

                teamCtx.sendMessage(
                    this.name,
                    'docs-manager',
                    'handoff',
                    `Code review complete. Fixed ${lintResult.fixedCount} ESLint issues.`,
                    { reviewComplete: true, filesReviewed: reviews.length }
                );

                teamCtx.addFinding('codeReview', {
                    reviews,
                    averageScore: avgScore,
                    eslint: lintResult
                });
            }

            return this.createOutput(
                true,
                `Reviewed ${reviews.length} files. ESLint fixed ${lintResult.fixedCount} issues.`,
                { reviews, lintResult },
                [],
                'docs-manager'
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';

            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ Review failed: ${message}`);
            }

            return this.createOutput(false, `Review failed: ${message}`, {});
        }
    }

    /**
     * Run ESLint with auto-fix on files
     */
    private async runEslintFix(projectRoot: string, files: string[]): Promise<{
        fixedCount: number;
        issues: LintIssue[];
    }> {
        const issues: LintIssue[] = [];
        let fixedCount = 0;

        try {
            // Check if ESLint is available
            const hasEslint = existsSync(`${projectRoot}/node_modules/.bin/eslint`) ||
                existsSync(`${projectRoot}/eslint.config.js`) ||
                existsSync(`${projectRoot}/.eslintrc.js`);

            if (!hasEslint) {
                logger.info('ESLint not configured - skipping auto-fix');
                return { fixedCount: 0, issues: [] };
            }

            // Filter to only TypeScript/JavaScript files
            const lintableFiles = files.filter(f =>
                f.endsWith('.ts') || f.endsWith('.tsx') ||
                f.endsWith('.js') || f.endsWith('.jsx')
            ).slice(0, 10);

            if (lintableFiles.length === 0) {
                return { fixedCount: 0, issues: [] };
            }

            // Run ESLint with --fix
            try {
                execSync(`npx eslint --fix ${lintableFiles.join(' ')} 2>/dev/null`, {
                    cwd: projectRoot,
                    encoding: 'utf-8',
                    timeout: 60000,
                });
                logger.success('ESLint auto-fix applied');
            } catch {
                // ESLint may exit with error if issues remain - that's OK
            }

            // Get remaining issues in JSON format
            try {
                const output = execSync(
                    `npx eslint --format json ${lintableFiles.join(' ')} 2>/dev/null || true`,
                    { cwd: projectRoot, encoding: 'utf-8', timeout: 60000 }
                );

                const results = JSON.parse(output || '[]');
                for (const result of results) {
                    if (result.messages) {
                        for (const msg of result.messages) {
                            issues.push({
                                file: result.filePath,
                                line: msg.line || 0,
                                column: msg.column || 0,
                                severity: msg.severity === 2 ? 'error' : 'warning',
                                message: msg.message,
                                ruleId: msg.ruleId || 'unknown',
                            });
                        }
                    }
                    fixedCount += result.fixableErrorCount || 0;
                    fixedCount += result.fixableWarningCount || 0;
                }
            } catch {
                // JSON parsing failed - ESLint might not be properly configured
            }
        } catch (error) {
            logger.warn(`ESLint check failed: ${error}`);
        }

        return { fixedCount, issues };
    }

    /**
     * Run npm audit for security vulnerabilities
     */
    async runSecurityScan(projectRoot: string): Promise<{ vulnerabilities: number; details: string }> {
        logger.info('🔒 Running security scan (npm audit)...');

        try {
            const output = execSync('npm audit --json 2>/dev/null || true', {
                cwd: projectRoot,
                encoding: 'utf-8',
                timeout: 60000,
            });

            try {
                const audit = JSON.parse(output);
                const vulns = audit.metadata?.vulnerabilities || {};
                const total = (vulns.low || 0) + (vulns.moderate || 0) + (vulns.high || 0) + (vulns.critical || 0);

                logger.info(`🛡️ Found ${total} vulnerabilities: ${vulns.critical || 0} critical, ${vulns.high || 0} high`);

                return {
                    vulnerabilities: total,
                    details: `Critical: ${vulns.critical || 0}, High: ${vulns.high || 0}, Moderate: ${vulns.moderate || 0}, Low: ${vulns.low || 0}`,
                };
            } catch {
                return { vulnerabilities: 0, details: 'Could not parse audit output' };
            }
        } catch {
            return { vulnerabilities: 0, details: 'npm audit not available' };
        }
    }
}

export const codeReviewerAgent = new CodeReviewerAgent();

