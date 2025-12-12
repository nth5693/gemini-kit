/**
 * Planner Agent
 * Research, analyze, and create implementation plans
 * Acts as the Tech Lead of the team
 */

import { BaseAgent, AgentOutput } from '../base-agent.js';
import { providerManager } from '../../providers/index.js';
import { getTeamContext } from '../../context/team-context.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { logger } from '../../utils/logger.js';

export class PlannerAgent extends BaseAgent {
    constructor() {
        super({
            name: 'planner',
            description: 'Research, analyze, and create implementation plans',
            category: 'development',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, `Planning: ${ctx.currentTask}`);

        try {
            // Team context is available via teamCtx for future use

            // Generate plan using AI - SIMPLIFIED PROMPT FOR TESTING
            const prompt = `Create a simple implementation plan for: ${ctx.currentTask}

Please provide:
1. Overview
2. Files to create
3. Implementation steps

Format in Markdown.`;

            const result = await providerManager.generate([
                { role: 'user', content: prompt },
            ]);

            // Save plan to file
            const planName = ctx.currentTask
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .slice(0, 50);
            const planPath = join(ctx.projectRoot, 'plans', `${planName}.md`);
            const planDir = dirname(planPath);

            if (!existsSync(planDir)) {
                mkdirSync(planDir, { recursive: true });
            }

            const planContent = `# Implementation Plan: ${ctx.currentTask}

Generated: ${new Date().toISOString()}
Model: ${result.model} (${result.provider})

---

${result.content}
`;

            writeFileSync(planPath, planContent);
            logger.success(`Plan saved to: ${planPath}`);

            // Share with team
            if (teamCtx) {
                // Add plan as artifact
                teamCtx.addArtifact('implementation-plan', {
                    name: planName,
                    type: 'plan',
                    createdBy: this.name,
                    path: planPath,
                    content: result.content,
                });

                // Update progress
                teamCtx.updateProgress('planned', true);

                // Send handoff to scout
                teamCtx.sendMessage(
                    this.name,
                    'scout',
                    'handoff',
                    `I created an implementation plan. Please find the relevant files we need to work with.`,
                    { planPath, planSummary: result.content.slice(0, 500) }
                );
            }

            return this.createOutput(
                true,
                `Implementation plan created successfully`,
                {
                    planPath,
                    planContent: result.content,
                    tokensUsed: result.usage,
                },
                [planPath],
                'scout' // Next agent
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Planning failed: ${message}`);

            // Notify team of failure
            if (teamCtx) {
                teamCtx.sendMessage(
                    this.name,
                    'all',
                    'info',
                    `⚠️ Planning failed: ${message}`
                );
            }

            return this.createOutput(false, `Planning failed: ${message}`, {
                error: message,
            });
        }
    }
}

export const plannerAgent = new PlannerAgent();
