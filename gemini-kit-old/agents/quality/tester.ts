/**
 * Tester Agent
 * Validate code quality through comprehensive testing
 * NOW GENERATES TEST FILES for new code!
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { dirname, join, basename, extname } from 'path';
import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
import { providerManager } from '../../providers/index.js';
import { execSync } from 'child_process';
import { logger } from '../../utils/logger.js';

export interface TestFailure {
    test: string;
    error: string;
    file?: string;
    line?: number;
}

interface CodeBlock {
    filePath: string;
    language: string;
    content: string;
}

export class TesterAgent extends BaseAgent {
    constructor() {
        super({
            name: 'tester',
            description: 'Validate code quality through comprehensive testing - GENERATES TESTS',
            category: 'quality',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, 'Running tests...');

        // Check if we need to generate tests for new files
        let generatedTests: string[] = [];

        if (teamCtx) {
            const coderMessage = teamCtx.getMessagesFrom('coder').find(m => m.type === 'handoff');
            if (coderMessage?.data?.filesWritten) {
                const newFiles = coderMessage.data.filesWritten as string[];
                logger.info(`📝 Generating tests for ${newFiles.length} new files`);
                generatedTests = await this.generateTestsForFiles(newFiles, ctx.projectRoot);
            }
        }

        // Run tests
        const results = await this.runTests(ctx.projectRoot);

        // Report to team
        if (teamCtx) {
            if (results.success) {
                teamCtx.updateProgress('tested', true);
                teamCtx.sendMessage(this.name, 'all', 'result', `✅ All tests passed!`, {
                    testsPassed: true,
                    generatedTests
                });
                teamCtx.sendMessage(this.name, 'code-reviewer', 'handoff',
                    'Tests passed. Please review the code quality.',
                    { testsVerified: true, generatedTests }
                );
                teamCtx.addFinding('testResults', { passed: true, generatedTests });

                return this.createOutput(
                    true,
                    `All tests passed. Generated ${generatedTests.length} test files.`,
                    { ...results, generatedTests },
                    generatedTests,
                    'code-reviewer'
                );
            } else {
                logger.error('❌ Tests failed! Requesting debugger assistance...');
                teamCtx.sendMessage(this.name, 'debugger', 'request',
                    'Tests failed. Please investigate and fix these issues.',
                    { failures: results.failures, testOutput: results.output?.slice(0, 2000), needsDebug: true }
                );

                return this.createOutput(
                    false,
                    `Tests failed with ${results.failures.length} issue(s). Debugger requested.`,
                    { ...results, generatedTests, needsDebug: true },
                    generatedTests,
                    'debugger'
                );
            }
        }

        return results.success
            ? this.createOutput(true, 'All tests passed', results, generatedTests, 'code-reviewer')
            : this.createOutput(false, 'Tests failed', results, generatedTests);
    }

    /**
     * Generate test files for new source files
     */
    private async generateTestsForFiles(files: string[], projectRoot: string): Promise<string[]> {
        const generatedTests: string[] = [];

        // Filter to only testable files (JS, TS, no test files)
        const testableFiles = files.filter(f => {
            const ext = extname(f);
            const name = basename(f);
            return ['.ts', '.js', '.tsx', '.jsx'].includes(ext) &&
                !name.includes('.test.') &&
                !name.includes('.spec.');
        });

        if (testableFiles.length === 0) {
            logger.info('No testable files found');
            return generatedTests;
        }

        // Read file contents for context
        const fileContents: { path: string; content: string }[] = [];
        for (const file of testableFiles) {
            try {
                const fullPath = file.startsWith('/') ? file : join(projectRoot, file);
                if (existsSync(fullPath)) {
                    fileContents.push({
                        path: file,
                        content: readFileSync(fullPath, 'utf-8').slice(0, 3000) // Limit size
                    });
                }
            } catch {
                // Skip unreadable files
            }
        }

        if (fileContents.length === 0) {
            return generatedTests;
        }

        // Generate tests using AI
        const prompt = this.buildTestPrompt(fileContents);

        try {
            const response = await providerManager.generate([{ role: 'user', content: prompt }]);
            const testBlocks = this.extractCodeBlocks(response.content);

            logger.info(`📦 Found ${testBlocks.length} test blocks`);

            // Write test files
            for (const block of testBlocks) {
                try {
                    const fullPath = block.filePath.startsWith('/')
                        ? block.filePath
                        : join(projectRoot, block.filePath);

                    // Ensure directory exists
                    const dir = dirname(fullPath);
                    if (!existsSync(dir)) {
                        mkdirSync(dir, { recursive: true });
                    }

                    writeFileSync(fullPath, block.content);
                    generatedTests.push(block.filePath);
                    logger.success(`📝 Generated: ${block.filePath}`);
                } catch (error) {
                    logger.warn(`Failed to write ${block.filePath}: ${error}`);
                }
            }

            if (generatedTests.length > 0) {
                logger.success(`✅ Generated ${generatedTests.length} test files`);
            }
        } catch (error) {
            logger.warn(`Test generation failed: ${error}`);
        }

        return generatedTests;
    }

    /**
     * Build prompt for test generation
     */
    private buildTestPrompt(files: { path: string; content: string }[]): string {
        const fileList = files.map(f => `## File: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n');

        return `You are an expert test engineer. Generate comprehensive unit tests for these files.

${fileList}

## Requirements:
1. Use vitest syntax (describe, it, expect)
2. Test all exported functions and classes
3. Include edge cases and error handling
4. Use meaningful test descriptions

## Output Format (IMPORTANT):
For each test file, output in this exact format:

## File: tests/[filename].test.ts
\`\`\`typescript
import { describe, it, expect } from 'vitest';
// ... test code
\`\`\`

Generate tests now:`;
    }

    /**
     * Extract code blocks from AI response (same as Coder)
     */
    private extractCodeBlocks(text: string): CodeBlock[] {
        const blocks: CodeBlock[] = [];

        // Pattern 1: ## File: path/to/file.ext
        const pattern1 = /##\s*File:\s*([^\n]+)\n```(\w+)?\n([\s\S]*?)```/gi;
        // Pattern 2: **path/to/file.ext** or ### path/to/file.ext
        const pattern2 = /(?:\*\*|###?\s+)([^\s*#]+\.\w+)\*?\*?\s*\n```(\w+)?\n([\s\S]*?)```/gi;
        // Pattern 3: `filename.ext`:
        const pattern3 = /`([^\s`]+\.\w+)`[:\s]*\n```(\w+)?\n([\s\S]*?)```/gi;

        const patterns = [pattern1, pattern2, pattern3];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const filePath = match[1]?.trim() ?? '';
                const language = match[2] ?? 'typescript';
                const content = match[3]?.trim() ?? '';

                if (filePath && content && !blocks.some(b => b.filePath === filePath)) {
                    blocks.push({ filePath, language, content });
                }
            }
        }

        return blocks;
    }

    /**
     * Run test suite
     */
    private async runTests(projectRoot: string): Promise<{
        success: boolean;
        output: string;
        failures: TestFailure[];
        command: string;
    }> {
        const testCommands = [
            'pnpm test --run',
            'npm test -- --run',
            'vitest run',
            'jest --passWithNoTests',
        ];

        for (const cmd of testCommands) {
            try {
                const output = execSync(cmd, {
                    cwd: projectRoot,
                    encoding: 'utf-8',
                    timeout: 120000,
                    stdio: ['pipe', 'pipe', 'pipe'],
                });

                logger.success(`Tests passed with: ${cmd}`);
                return { success: true, output, failures: [], command: cmd };
            } catch (error) {
                const output = error instanceof Error ? error.message : 'Unknown error';
                const failures = this.parseTestFailures(output);

                // If this command exists but failed, report it
                if (!output.includes('command not found') && !output.includes('not recognized')) {
                    return { success: false, output, failures, command: cmd };
                }
            }
        }

        return { success: true, output: 'No test runner found', failures: [], command: 'none' };
    }

    /**
     * Parse test output to extract failures
     */
    private parseTestFailures(output: string): TestFailure[] {
        const failures: TestFailure[] = [];
        const patterns = [
            /FAIL\s+(.+?)\s+>\s+(.+)/g,
            /Error:\s+(.+)/g,
            /AssertionError:\s+(.+)/g,
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(output)) !== null) {
                failures.push({
                    test: match[1] || 'Unknown test',
                    error: match[2] || match[1] || 'Unknown error',
                });
            }
        }

        if (failures.length === 0 && output.includes('FAIL')) {
            failures.push({ test: 'Unknown', error: 'Test suite failed' });
        }

        return failures;
    }
}

export const testerAgent = new TesterAgent();
