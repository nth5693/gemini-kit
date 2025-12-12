/**
 * Team Orchestrator
 * Coordinates agents like a real development team
 */

import { BaseAgent, AgentContext, AgentOutput } from './base-agent.js';
import { TeamContextManager, initTeamContext, getTeamContext } from '../context/team-context.js';
import { logger } from '../utils/logger.js';

export type OrchestrationPattern = 'sequential' | 'parallel' | 'hybrid';

export interface TeamWorkflow {
    name: string;
    description: string;
    steps: WorkflowStep[];
}

export interface WorkflowStep {
    agent: string;
    action: string;
    dependsOn?: string[];
    optional?: boolean;
}

export class TeamOrchestrator {
    private agents: Map<string, BaseAgent> = new Map();
    private teamContext: TeamContextManager | null = null;

    /**
     * Register an agent to the team
     */
    register(agent: BaseAgent): void {
        this.agents.set(agent.name, agent);
        logger.info(`👤 ${agent.name} joined the team as ${agent.category}`);
    }

    /**
     * Get agent by name
     */
    getAgent(name: string): BaseAgent | undefined {
        return this.agents.get(name);
    }

    /**
     * List all team members
     */
    listTeam(): string[] {
        return Array.from(this.agents.keys());
    }

    /**
     * Start a team session for a task
     */
    startSession(projectRoot: string, task: string): TeamContextManager {
        this.teamContext = initTeamContext(projectRoot, task);
        logger.info(`\n🚀 Team Session Started: "${task}"\n`);
        return this.teamContext;
    }

    /**
     * Get current team context
     */
    getTeamContext(): TeamContextManager | null {
        return this.teamContext || getTeamContext();
    }

    /**
     * Execute a single agent with team context
     */
    async executeAgent(agentName: string, customTask?: string): Promise<AgentOutput> {
        const agent = this.agents.get(agentName);
        if (!agent) {
            throw new Error(`Agent ${agentName} not found in team`);
        }

        const teamCtx = this.getTeamContext();
        if (!teamCtx) {
            throw new Error('No active team session. Call startSession() first.');
        }

        // Agent joins the team
        teamCtx.memberJoins(agent.name, agent.category);
        teamCtx.memberUpdate(agent.name, 'starting work');

        // Get context summary for agent
        const contextSummary = teamCtx.getSummaryForAgent(agent.name);

        // Create agent context with team info
        const ctx: AgentContext = {
            projectRoot: teamCtx.getFullContext().projectRoot,
            currentTask: customTask || teamCtx.getFullContext().currentTask,
            sharedData: {
                teamContext: contextSummary,
                relevantFiles: teamCtx.getFullContext().knowledge.codebaseInfo.relevantFiles,
                previousFindings: teamCtx.getFullContext().knowledge.findings,
            },
        };

        // Execute agent
        logger.info(`🔧 ${agent.name} is working...`);
        agent.initialize(ctx);
        const result = await agent.execute();
        agent.cleanup();

        // Update team context with results
        teamCtx.memberUpdate(agent.name, result.success ? 'completed' : 'failed');

        // Share results with team
        teamCtx.sendMessage(
            agent.name,
            'all',
            'result',
            result.message,
            result.data
        );

        // Add any artifacts
        if (result.artifacts.length > 0) {
            result.artifacts.forEach(path => {
                teamCtx.addArtifact(path, {
                    name: path,
                    type: this.inferArtifactType(agent.name),
                    createdBy: agent.name,
                    path,
                });
            });
        }

        // Send handoff if there's a next agent
        if (result.nextAgent) {
            teamCtx.sendMessage(
                agent.name,
                result.nextAgent,
                'handoff',
                `Completed ${result.message}. Please continue.`,
                result.data
            );
        }

        return result;
    }

    /**
     * Execute agent with auto-retry on failure
     * Implements: Tester → (fail) → Debugger → Retry Tester
     */
    async executeAgentWithRetry(
        agentName: string,
        maxRetries: number = 2,
        customTask?: string
    ): Promise<AgentOutput> {
        let result = await this.executeAgent(agentName, customTask);
        let retries = 0;

        // If agent suggests next agent on failure, execute that and retry
        while (!result.success && result.nextAgent && retries < maxRetries) {
            const nextAgentName = result.nextAgent;
            const nextAgent = this.agents.get(nextAgentName);

            if (!nextAgent) {
                logger.warn(`⚠️ Suggested agent ${nextAgentName} not available`);
                break;
            }

            logger.info(`\n🔄 Retry Loop ${retries + 1}/${maxRetries}`);
            logger.info(`   ${agentName} → ${nextAgentName} → ${agentName}`);

            // Execute the helper agent (e.g., debugger)
            const helperResult = await this.executeAgent(nextAgentName);

            if (!helperResult.success) {
                logger.error(`   ${nextAgentName} could not help`);
                break;
            }

            logger.info(`   ${nextAgentName}: ${helperResult.message}`);

            // Retry the original agent
            logger.info(`   Retrying ${agentName}...`);
            result = await this.executeAgent(agentName, customTask);
            retries++;

            if (result.success) {
                logger.success(`   ✅ ${agentName} passed on retry ${retries}!`);
            }
        }

        if (!result.success && retries >= maxRetries) {
            logger.warn(`⚠️ Max retries (${maxRetries}) reached for ${agentName}`);
        }

        return result;
    }

    /**
     * Execute the full cook workflow (like standup + work)
     */
    async executeCookWorkflow(task: string): Promise<AgentOutput[]> {
        const projectRoot = process.cwd();
        this.startSession(projectRoot, task);

        const workflow: WorkflowStep[] = [
            { agent: 'planner', action: 'Create implementation plan' },
            { agent: 'scout', action: 'Find relevant files' },
            { agent: 'coder', action: 'Implement the solution', optional: true },
            { agent: 'tester', action: 'Validate the implementation' },
            { agent: 'code-reviewer', action: 'Review code quality' },
            { agent: 'docs-manager', action: 'Update documentation', optional: true },
            { agent: 'git-manager', action: 'Commit changes', optional: true },
        ];

        const results: AgentOutput[] = [];
        const teamCtx = this.getTeamContext()!;

        logger.info('📋 Workflow Steps:');
        workflow.forEach((step, i) => {
            logger.info(`   ${i + 1}. ${step.agent}: ${step.action}`);
        });
        logger.info('');

        for (const step of workflow) {
            const agent = this.agents.get(step.agent);

            if (!agent) {
                if (!step.optional) {
                    logger.warn(`⚠️ Required agent ${step.agent} not available, skipping...`);
                }
                continue;
            }

            try {
                // Announce what we're doing
                teamCtx.sendMessage(
                    'orchestrator',
                    step.agent,
                    'request',
                    step.action
                );

                // Use retry for tester (auto debug→retest loop)
                const result = step.agent === 'tester'
                    ? await this.executeAgentWithRetry(step.agent, 2)
                    : await this.executeAgent(step.agent);
                results.push(result);

                // Update progress
                this.updateProgressFromAgent(step.agent, result.success);

                if (!result.success && !step.optional) {
                    logger.error(`❌ ${step.agent} failed: ${result.message}`);
                    teamCtx.sendMessage(
                        step.agent,
                        'all',
                        'info',
                        `⚠️ Workflow stopped: ${result.message}`
                    );
                    break;
                }

                logger.success(`✅ ${step.agent}: ${result.message}`);

            } catch (error) {
                logger.error(`❌ ${step.agent} error: ${error}`);
                if (!step.optional) break;
            }
        }

        // Final summary
        logger.info('\n📊 Team Session Complete');
        logger.info(`   Tasks completed: ${results.filter(r => r.success).length}/${results.length}`);

        return results;
    }

    /**
     * Execute agents in parallel (e.g., multiple scouts)
     */
    async executeParallel(agentNames: string[]): Promise<AgentOutput[]> {
        const promises = agentNames.map(name => this.executeAgent(name));
        return Promise.all(promises);
    }

    /**
     * Update progress tracking based on which agent completed
     */
    private updateProgressFromAgent(agentName: string, success: boolean): void {
        const teamCtx = this.getTeamContext();
        if (!teamCtx || !success) return;

        const progressMap: Record<string, keyof TeamContextManager extends never ? never : 'planned' | 'implemented' | 'tested' | 'reviewed' | 'documented'> = {
            'planner': 'planned',
            'coder': 'implemented',
            'tester': 'tested',
            'code-reviewer': 'reviewed',
            'docs-manager': 'documented',
        };

        const step = progressMap[agentName];
        if (step) {
            teamCtx.updateProgress(step as 'planned' | 'implemented' | 'tested' | 'reviewed' | 'documented', true);
        }
    }

    /**
     * Infer artifact type from agent name
     */
    private inferArtifactType(agentName: string): 'plan' | 'code' | 'test' | 'doc' | 'analysis' {
        const typeMap: Record<string, 'plan' | 'code' | 'test' | 'doc' | 'analysis'> = {
            'planner': 'plan',
            'coder': 'code',
            'tester': 'test',
            'docs-manager': 'doc',
            'scout': 'analysis',
            'debugger': 'analysis',
            'researcher': 'analysis',
        };
        return typeMap[agentName] || 'analysis';
    }
}

// Singleton instance
export const teamOrchestrator = new TeamOrchestrator();

// Re-export old orchestrator for backward compatibility
export { teamOrchestrator as orchestrator };
