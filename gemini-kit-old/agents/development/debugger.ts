/**
 * Debugger Agent
 * Investigate issues, analyze logs, diagnose and AUTO-FIX problems
 * NOW APPLIES FIXES automatically for simple errors!
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
import { providerManager } from '../../providers/index.js';
import { logger } from '../../utils/logger.js';

interface Fix {
    file: string;
    type: 'replace' | 'insert' | 'delete';
    search?: string;
    replace?: string;
    line?: number;
    content?: string;
}

interface FixResult {
    simple: Fix[];
    complex: Array<{ file: string; issue: string; suggestion: string }>;
}

export class DebuggerAgent extends BaseAgent {
    constructor() {
        super({
            name: 'debugger',
            description: 'Investigate issues, analyze logs, diagnose and AUTO-FIX problems',
            category: 'development',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, `Debugging: ${ctx.currentTask}`);

        try {
            // Get context from team (especially from tester)
            let testFailures = '';
            let testOutput = '';
            let relevantFiles: string[] = [];

            if (teamCtx) {
                const messages = teamCtx.getMessages(this.name);
                const testerRequest = messages.find(m => m.from === 'tester' && m.type === 'request');

                if (testerRequest) {
                    logger.info(`📨 Received from Tester: ${testerRequest.content}`);
                    const data = testerRequest.data as {
                        failures?: Array<{ test: string; error: string }>;
                        testOutput?: string;
                    } | undefined;

                    if (data?.failures) {
                        testFailures = data.failures.map(f => `- ${f.test}: ${f.error}`).join('\n');
                    }
                    if (data?.testOutput) {
                        testOutput = data.testOutput;
                    }
                }

                relevantFiles = teamCtx.getFullContext().knowledge.codebaseInfo.relevantFiles;
            }

            // Step 1: Analyze and get fix suggestions
            const prompt = this.buildDebugPrompt(ctx.currentTask, testFailures, testOutput, relevantFiles, ctx.projectRoot);
            const result = await providerManager.generate([{ role: 'user', content: prompt }]);

            logger.success('Debug analysis complete');

            // Step 2: Parse and apply fixes
            const fixes = this.parseFixSuggestions(result.content);
            const appliedFixes: string[] = [];
            const failedFixes: string[] = [];

            // Apply simple fixes automatically
            for (const fix of fixes.simple) {
                try {
                    const success = await this.applyFix(fix, ctx.projectRoot);
                    if (success) {
                        appliedFixes.push(`${fix.file}: ${fix.type}`);
                        logger.success(`✅ Applied fix: ${fix.file}`);
                    } else {
                        failedFixes.push(fix.file);
                    }
                } catch (error) {
                    logger.warn(`Failed to apply fix to ${fix.file}: ${error}`);
                    failedFixes.push(fix.file);
                }
            }

            // Report complex issues that need manual review
            if (fixes.complex.length > 0) {
                logger.warn(`⚠️ ${fixes.complex.length} issues require manual review`);
            }

            // Report to team
            if (teamCtx) {
                teamCtx.sendMessage(
                    this.name,
                    'all',
                    'result',
                    `🔧 Debug complete. Applied ${appliedFixes.length} fixes. ${fixes.complex.length} need review.`,
                    { appliedFixes, complexIssues: fixes.complex.length }
                );

                teamCtx.addArtifact('debug-analysis', {
                    name: 'debug-analysis',
                    type: 'analysis',
                    createdBy: this.name,
                    content: result.content,
                });

                teamCtx.addFinding('debugAnalysis', {
                    analysis: result.content,
                    appliedFixes,
                    complexIssues: fixes.complex,
                    timestamp: new Date().toISOString(),
                });

                // Handoff back to tester
                teamCtx.sendMessage(
                    this.name,
                    'tester',
                    'handoff',
                    `Applied ${appliedFixes.length} fixes. Please re-run tests.`,
                    { fixesApplied: appliedFixes.length, needsRetest: true }
                );
            }

            const success = appliedFixes.length > 0 || fixes.complex.length === 0;

            return this.createOutput(
                success,
                `Applied ${appliedFixes.length} fixes. ${fixes.complex.length} issues need manual review.`,
                {
                    analysis: result.content,
                    appliedFixes,
                    failedFixes,
                    complexIssues: fixes.complex,
                    tokensUsed: result.usage,
                },
                appliedFixes,
                'tester'
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Debugging failed: ${message}`);

            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ Debug failed: ${message}`);
            }

            return this.createOutput(false, `Debugging failed: ${message}`, { error: message });
        }
    }

    /**
     * Build debug prompt requesting structured fix output
     */
    private buildDebugPrompt(
        task: string,
        testFailures: string,
        testOutput: string,
        relevantFiles: string[],
        projectRoot: string
    ): string {
        // Read content of relevant files
        const fileContents: string[] = [];
        for (const file of relevantFiles.slice(0, 5)) {
            try {
                const fullPath = file.startsWith('/') ? file : join(projectRoot, file);
                if (existsSync(fullPath)) {
                    const content = readFileSync(fullPath, 'utf-8').slice(0, 2000);
                    fileContents.push(`## File: ${file}\n\`\`\`\n${content}\n\`\`\``);
                }
            } catch {
                // Skip unreadable files
            }
        }

        return `You are an expert debugger. Analyze and provide SPECIFIC fixes.

## Issue
${task}

${testFailures ? `## Test Failures\n${testFailures}` : ''}

${testOutput ? `## Test Output\n${testOutput.slice(0, 2000)}` : ''}

${fileContents.length > 0 ? `## Relevant Files\n${fileContents.join('\n\n')}` : ''}

## IMPORTANT: Output Format

For fixes I can auto-apply, use this format:

### AUTO-FIX: [filename]
\`\`\`
SEARCH:
[exact text to find]
---
REPLACE:
[exact replacement text]
\`\`\`

For complex issues requiring manual review:

### MANUAL-FIX: [filename]
**Issue**: [description]
**Suggestion**: [how to fix]

Provide your analysis and fixes:`;
    }

    /**
     * Parse AI response for fix suggestions
     */
    private parseFixSuggestions(content: string): FixResult {
        const result: FixResult = { simple: [], complex: [] };

        // Parse AUTO-FIX blocks
        const autoFixPattern = /###\s*AUTO-FIX:\s*([^\n]+)\n```[^\n]*\nSEARCH:\n([\s\S]*?)---\nREPLACE:\n([\s\S]*?)```/gi;
        let match;
        while ((match = autoFixPattern.exec(content)) !== null) {
            if (match[1] && match[2] && match[3]) {
                result.simple.push({
                    file: match[1].trim(),
                    type: 'replace',
                    search: match[2].trim(),
                    replace: match[3].trim(),
                });
            }
        }

        // Parse MANUAL-FIX blocks
        const manualFixPattern = /###\s*MANUAL-FIX:\s*([^\n]+)\n\*\*Issue\*\*:\s*([^\n]+)\n\*\*Suggestion\*\*:\s*([^\n]+)/gi;
        while ((match = manualFixPattern.exec(content)) !== null) {
            if (match[1] && match[2] && match[3]) {
                result.complex.push({
                    file: match[1].trim(),
                    issue: match[2].trim(),
                    suggestion: match[3].trim(),
                });
            }
        }

        return result;
    }

    /**
     * Apply a single fix to a file
     */
    private async applyFix(fix: Fix, projectRoot: string): Promise<boolean> {
        const fullPath = fix.file.startsWith('/') ? fix.file : join(projectRoot, fix.file);

        if (!existsSync(fullPath)) {
            logger.warn(`File not found: ${fullPath}`);
            return false;
        }

        try {
            const content = readFileSync(fullPath, 'utf-8');

            if (fix.type === 'replace' && fix.search && fix.replace !== undefined) {
                if (!content.includes(fix.search)) {
                    logger.warn(`Search text not found in ${fix.file}`);
                    return false;
                }

                const newContent = content.replace(fix.search, fix.replace);
                writeFileSync(fullPath, newContent);
                return true;
            }

            return false;
        } catch (error) {
            logger.warn(`Failed to apply fix: ${error}`);
            return false;
        }
    }
}

export const debuggerAgent = new DebuggerAgent();
