/**
 * Coder Agent
 * Writes code following implementation plans and team context
 * Actually WRITES FILES to disk like ClaudeKit
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join, isAbsolute } from 'path';
import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
import { providerManager } from '../../providers/index.js';
import { logger } from '../../utils/logger.js';

interface CodeBlock {
    filePath: string;
    language: string;
    content: string;
}

class CoderAgent extends BaseAgent {
    constructor() {
        super({
            name: 'coder',
            description: 'Writes code following implementation plans - ACTUALLY WRITES FILES',
            category: 'development',
        });
    }

    /**
     * Extract code blocks from AI response
     * Supports multiple formats:
     * 1. ## File: path/to/file.ext \n ```lang \n code \n ```
     * 2. **path/to/file.ext** \n ```lang \n code \n ```
     * 3. `path/to/file.ext`: \n ```lang \n code \n ```
     * 4. Single code block with filename in first comment
     */
    private extractCodeBlocks(text: string): CodeBlock[] {
        const blocks: CodeBlock[] = [];

        // Pattern 1: ## File: path/to/file.ext
        const pattern1 = /##\s*File:\s*([^\n]+)\n```(\w+)?\n([\s\S]*?)```/gi;

        // Pattern 2: **path/to/file.ext** or ### path/to/file.ext
        const pattern2 = /(?:\*\*|###?\s+)([^\s*#]+\.\w+)\*?\*?\s*\n```(\w+)?\n([\s\S]*?)```/gi;

        // Pattern 3: `filename.ext`:
        const pattern3 = /`([^\s`]+\.\w+)`[:\s]*\n```(\w+)?\n([\s\S]*?)```/gi;

        // Try all patterns
        const patterns = [pattern1, pattern2, pattern3];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const filePath = match[1]?.trim() ?? '';
                const language = match[2] ?? 'text';
                const content = match[3]?.trim() ?? '';

                if (filePath && content && !blocks.some(b => b.filePath === filePath)) {
                    blocks.push({ filePath, language, content });
                }
            }
        }

        // Fallback: if no blocks found but has code block, try to extract filename from content
        if (blocks.length === 0) {
            const singleBlock = /```(\w+)?\n([\s\S]*?)```/gi;
            let match;
            while ((match = singleBlock.exec(text)) !== null) {
                const lang = match[1] ?? 'text';
                const content = match[2]?.trim() ?? '';

                // Try to find filename in first line comment
                const firstLineMatch = content.match(/^(?:\/\/|\/\*|#|<!--)\s*(?:File:|filename:)?\s*([^\s*\/]+\.\w+)/i);
                if (firstLineMatch && firstLineMatch[1]) {
                    blocks.push({
                        filePath: firstLineMatch[1],
                        language: lang,
                        content: content,
                    });
                }
            }
        }

        return blocks;
    }

    /**
     * Write code blocks to files
     */
    private writeFiles(blocks: CodeBlock[], projectRoot: string): string[] {
        const writtenFiles: string[] = [];

        for (const block of blocks) {
            try {
                // Resolve path
                const fullPath = isAbsolute(block.filePath)
                    ? block.filePath
                    : join(projectRoot, block.filePath);

                // Create directory if needed
                const dir = dirname(fullPath);
                if (!existsSync(dir)) {
                    mkdirSync(dir, { recursive: true });
                }

                // Write file
                writeFileSync(fullPath, block.content, 'utf-8');
                writtenFiles.push(fullPath);
                logger.success(`📝 Written: ${block.filePath}`);
            } catch (error) {
                logger.error(`Failed to write ${block.filePath}: ${error}`);
            }
        }

        return writtenFiles;
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, `Writing code for: ${ctx.currentTask}`);

        try {
            // Get context from team
            let planContent = ctx.sharedData.planContent || '';
            let relevantFiles: string[] = [];

            if (teamCtx) {
                // Get plan from planner artifact
                const artifacts = Array.from(teamCtx.getFullContext().artifacts.values());
                const planArtifact = artifacts.find(a => a.type === 'plan');
                if (planArtifact && planArtifact.content) {
                    planContent = String(planArtifact.content);
                    logger.info(`📋 Received plan from Planner`);
                }

                // Get relevant files from scout
                relevantFiles = teamCtx.getFullContext().knowledge.codebaseInfo.relevantFiles;
                if (relevantFiles.length > 0) {
                    logger.info(`📁 Scout found ${relevantFiles.length} relevant files`);
                }
            }

            const prompt = `You are an expert software engineer. Write COMPLETE, WORKING code for:

## Task
${ctx.currentTask}

## Implementation Plan
${planContent || 'No plan provided - use best judgment'}

## Project Root
${ctx.projectRoot}

## IMPORTANT REQUIREMENTS
1. Write COMPLETE code files - no placeholders, no "// TODO"
2. Include ALL imports, ALL functions, EVERYTHING needed
3. Follow best practices and coding standards
4. Add helpful comments
5. Make it production-ready

## OUTPUT FORMAT
For EACH file, use this EXACT format:

## File: relative/path/to/filename.ext
\`\`\`language
// Complete code here
\`\`\`

Write ALL files needed to make the app work completely.`;

            const result = await providerManager.generate([
                { role: 'user', content: prompt },
            ]);

            // Extract and write code blocks
            const codeBlocks = this.extractCodeBlocks(result.content);

            if (codeBlocks.length === 0) {
                logger.warn('No code blocks found in response');
                return this.createOutput(
                    false,
                    'AI did not generate proper code blocks',
                    { rawResponse: result.content.slice(0, 500) },
                    []
                );
            }

            logger.info(`📦 Found ${codeBlocks.length} code blocks`);

            // Write files to disk
            const writtenFiles = this.writeFiles(codeBlocks, ctx.projectRoot);

            logger.success(`✅ Written ${writtenFiles.length} files`);

            // Report to team
            if (teamCtx) {
                teamCtx.updateProgress('implemented', true);
                teamCtx.addRelevantFiles(writtenFiles);

                teamCtx.sendMessage(
                    this.name,
                    'all',
                    'result',
                    `💻 Written ${writtenFiles.length} files`,
                    { filesWritten: writtenFiles }
                );

                teamCtx.addArtifact('generated-code', {
                    name: 'coder-output',
                    type: 'code',
                    createdBy: this.name,
                    content: writtenFiles.join('\n'),
                });

                // Handoff to tester
                teamCtx.sendMessage(
                    this.name,
                    'tester',
                    'handoff',
                    'Code is ready. Please test the implementation.',
                    { filesWritten: writtenFiles }
                );
            }

            return this.createOutput(
                true,
                `Written ${writtenFiles.length} files successfully`,
                {
                    filesWritten: writtenFiles,
                    codeBlocksCount: codeBlocks.length,
                },
                writtenFiles,
                'tester'
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            logger.error(`Code generation failed: ${message}`);

            if (teamCtx) {
                teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ Coder failed: ${message}`);
            }

            return this.createOutput(
                false,
                `Code generation failed: ${message}`,
                {},
                []
            );
        }
    }
}

export const coderAgent = new CoderAgent();
