/**
 * AI Router - Auto Agent Selection
 * Analyzes task and automatically selects best agents + skills
 * Like ClaudeKit's intelligent routing
 */

import { providerManager } from '../providers/index.js';
import { logger } from '../utils/logger.js';

export interface RouteDecision {
    agents: string[];
    skills: string[];
    reasoning: string;
    confidence: number;
}

export interface AgentInfo {
    name: string;
    description: string;
    skills: string[];
    category: string;
}

// Registry of all agents and their skills
const AGENT_REGISTRY: AgentInfo[] = [
    { name: 'planner', category: 'development', description: 'Create implementation plans', skills: ['savePlan', 'research'] },
    { name: 'scout', category: 'development', description: 'Find files and dependencies', skills: ['searchFiles', 'buildDependencyGraph', 'extractSymbols'] },
    { name: 'coder', category: 'development', description: 'Write and modify code', skills: ['writeFiles', 'extractCodeBlocks'] },
    { name: 'debugger', category: 'development', description: 'Fix bugs automatically', skills: ['applyFix', 'parseErrors'] },
    { name: 'tester', category: 'quality', description: 'Generate and run tests', skills: ['generateTests', 'runTests'] },
    { name: 'code-reviewer', category: 'quality', description: 'Review code and lint', skills: ['runEslintFix', 'securityScan'] },
    { name: 'git-manager', category: 'devops', description: 'Git operations', skills: ['createBranch', 'commitAndPush', 'createPR'] },
    { name: 'database-admin', category: 'devops', description: 'Database operations', skills: ['analyzeSchema', 'generateMigration'] },
    { name: 'docs-manager', category: 'documentation', description: 'Update docs', skills: ['updateReadme', 'updateChangelog', 'generateApiDocs'] },
    { name: 'project-manager', category: 'documentation', description: 'Project reports', skills: ['generateReport', 'checkHealth'] },
    { name: 'journal-writer', category: 'research', description: 'Write journals', skills: ['saveEntry'] },
    { name: 'researcher', category: 'research', description: 'Research topics', skills: ['saveResearch', 'fetchUrl'] },
    { name: 'brainstormer', category: 'creative', description: 'Generate ideas', skills: ['saveIdeas'] },
    { name: 'ui-ux-designer', category: 'creative', description: 'Design UI/UX', skills: ['saveDesign', 'generateComponent'] },
    { name: 'copywriter', category: 'creative', description: 'Marketing copy', skills: ['saveCopy', 'seoAnalysis'] },
];

class AIRouter {
    /**
     * Analyze task and return recommended agents + skills
     */
    async route(task: string, projectContext?: string): Promise<RouteDecision> {
        logger.info('🧠 AI Router analyzing task...');

        const agentList = AGENT_REGISTRY.map(a =>
            `- ${a.name} (${a.category}): ${a.description}. Skills: ${a.skills.join(', ')}`
        ).join('\n');

        const prompt = `You are an AI router that selects the best agents for a task.

## Available Agents:
${agentList}

## Task:
${task}

${projectContext ? `## Project Context:\n${projectContext.slice(0, 500)}` : ''}

## Instructions:
Select 1-4 agents that should handle this task, in order of execution.
For each agent, specify which skills should be used.

Respond in this exact JSON format:
{
  "agents": ["agent1", "agent2"],
  "skills": ["agent1.skill1", "agent2.skill2"],
  "reasoning": "Brief explanation",
  "confidence": 0.9
}

Common patterns:
- New feature: planner → scout → coder → tester
- Bug fix: debugger → tester
- Refactor: scout → coder → code-reviewer
- Documentation: docs-manager
- Research: researcher → brainstormer → planner`;

        try {
            const result = await providerManager.generate([{ role: 'user', content: prompt }]);

            // Parse JSON from response
            const jsonMatch = result.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const decision = JSON.parse(jsonMatch[0]) as RouteDecision;
                logger.success(`🎯 Selected: ${decision.agents.join(' → ')}`);
                return decision;
            }
        } catch {
            logger.warn('AI Router fallback to default');
        }

        // Fallback: simple keyword matching
        return this.fallbackRoute(task);
    }

    /**
     * Fallback routing based on keywords
     */
    private fallbackRoute(task: string): RouteDecision {
        const lower = task.toLowerCase();
        const agents: string[] = [];
        const skills: string[] = [];

        // Keyword-based selection
        if (lower.includes('bug') || lower.includes('fix') || lower.includes('error')) {
            agents.push('debugger', 'tester');
            skills.push('debugger.applyFix', 'tester.runTests');
        } else if (lower.includes('test')) {
            agents.push('tester');
            skills.push('tester.generateTests', 'tester.runTests');
        } else if (lower.includes('document') || lower.includes('readme') || lower.includes('docs')) {
            agents.push('docs-manager');
            skills.push('docs-manager.updateReadme');
        } else if (lower.includes('design') || lower.includes('ui') || lower.includes('component')) {
            agents.push('ui-ux-designer', 'coder');
            skills.push('ui-ux-designer.saveDesign', 'coder.writeFiles');
        } else if (lower.includes('research') || lower.includes('learn')) {
            agents.push('researcher', 'planner');
            skills.push('researcher.saveResearch', 'planner.savePlan');
        } else if (lower.includes('git') || lower.includes('commit') || lower.includes('branch')) {
            agents.push('git-manager');
            skills.push('git-manager.createBranch', 'git-manager.commitAndPush');
        } else if (lower.includes('database') || lower.includes('schema') || lower.includes('migration')) {
            agents.push('database-admin');
            skills.push('database-admin.analyzeSchema');
        } else {
            // Default: full development flow
            agents.push('planner', 'scout', 'coder');
            skills.push('planner.savePlan', 'scout.searchFiles', 'coder.writeFiles');
        }

        return {
            agents,
            skills,
            reasoning: 'Fallback keyword matching',
            confidence: 0.6,
        };
    }

    /**
     * Get agent info
     */
    getAgentInfo(name: string): AgentInfo | undefined {
        return AGENT_REGISTRY.find(a => a.name === name);
    }

    /**
     * List all agents
     */
    listAgents(): AgentInfo[] {
        return AGENT_REGISTRY;
    }
}

export const aiRouter = new AIRouter();
