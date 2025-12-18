#!/usr/bin/env node
/**
 * Gemini-Kit MCP Server
 * Provides custom tools for agent orchestration
 * 
 * Modular architecture - tools split into separate modules
 * Refactored: Core tools moved to tools/core.ts
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Import modular tool registrations
import { registerGitTools } from './tools/git.js';
import { registerKnowledgeTools } from './tools/knowledge.js';
import { registerIntegrationTools } from './tools/integration.js';
import { registerCoreTools } from './tools/core.js';

// Orchestration imports
import {
    initOrchestrator,
    teamStart,
    teamStatus,
    teamEnd,
    runWorkflow,
    smartRoute,
    getSessionHistory,
} from './tools/orchestrator.js';

import { listWorkflows } from './tools/workflows.js';

const server = new McpServer({
    name: 'gemini-kit-agents',
    version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════
// REGISTER MODULAR TOOLS
// ═══════════════════════════════════════════════════════════════
registerGitTools(server);           // Checkpoint, restore, list, rollback
registerKnowledgeTools(server);     // Learning, diff, search tools
registerIntegrationTools(server);   // GitHub, Jira tools
registerCoreTools(server);          // Project context, handoff, artifact

// Initialize orchestrator
initOrchestrator({ maxRetries: 3, autoRetry: true, verbose: false });

// ═══════════════════════════════════════════════════════════════
// ORCHESTRATION TOOLS
// ═══════════════════════════════════════════════════════════════

// TOOL: Start Team Session
server.tool(
    'kit_team_start',
    'Start a new team session with a goal. AI will suggest best workflow.',
    {
        goal: z.string().describe('The goal/task for the team session'),
        sessionName: z.string().optional().describe('Optional session name'),
    },
    async ({ goal, sessionName }) => {
        try {
            const result = teamStart(goal, sessionName);
            return {
                content: [{
                    type: 'text' as const,
                    text: `## 🚀 Team Session Started

**Session:** ${result.session.name}
**Goal:** ${goal}
**Suggested Workflow:** ${result.suggestedWorkflow}

### Available Workflows:
${result.allWorkflows.map(w => `- **${w.name}**: ${w.description}`).join('\n')}

Use \`kit_run_workflow\` to start the workflow or \`kit_team_status\` to check progress.`,
                }],
            };
        } catch (error) {
            return { content: [{ type: 'text' as const, text: `Error starting session: ${error}` }] };
        }
    }
);

// TOOL: Get Team Status
server.tool(
    'kit_team_status',
    'Get current team session status and progress',
    {},
    async () => {
        try {
            const result = teamStatus();
            return {
                content: [{
                    type: 'text' as const,
                    text: result.hasSession
                        ? result.summary
                        : '❌ No active team session. Use `kit_team_start` to begin.',
                }],
            };
        } catch (error) {
            return { content: [{ type: 'text' as const, text: `Error getting status: ${error}` }] };
        }
    }
);

// TOOL: End Team Session
server.tool(
    'kit_team_end',
    'End current team session and get summary',
    {
        status: z.enum(['completed', 'failed']).optional().default('completed'),
    },
    async ({ status }) => {
        try {
            const result = teamEnd(status);
            return {
                content: [{
                    type: 'text' as const,
                    text: result.success
                        ? `## ✅ Team Session Ended\n\n${result.summary}`
                        : '❌ No active session to end.',
                }],
            };
        } catch (error) {
            return { content: [{ type: 'text' as const, text: `Error ending session: ${error}` }] };
        }
    }
);

// TOOL: Run Workflow
server.tool(
    'kit_run_workflow',
    'Execute a complete workflow (cook, quickfix, feature, refactor, review, tdd, docs)',
    {
        workflow: z.string().describe('Workflow name: cook, quickfix, feature, refactor, review, tdd, docs'),
        task: z.string().describe('Task description'),
    },
    async ({ workflow, task }) => {
        try {
            const result = runWorkflow(workflow, task);
            if (!result.success) {
                return { content: [{ type: 'text' as const, text: `❌ ${result.message}` }] };
            }

            return {
                content: [{
                    type: 'text' as const,
                    text: `## 🎯 Workflow: ${result.workflow?.name}

${result.workflow?.description}

### Steps to Execute:
${result.steps.map((s, i) => `
**Step ${i + 1}: ${s.step.agent}** (${s.step.required ? 'Required' : 'Optional'})
${s.step.description}
\`\`\`
${s.prompt.slice(0, 300)}...
\`\`\`
`).join('\n')}

Execute each step in order. Use \`kit_team_status\` to track progress.`,
                }],
            };
        } catch (error) {
            return { content: [{ type: 'text' as const, text: `Error running workflow: ${error}` }] };
        }
    }
);

// TOOL: Smart Route
server.tool(
    'kit_smart_route',
    'Analyze task and auto-select best workflow',
    {
        task: z.string().describe('Task description to analyze'),
    },
    async ({ task }) => {
        try {
            const result = smartRoute(task);
            return {
                content: [{
                    type: 'text' as const,
                    text: `## 🧭 Smart Routing Result

**Recommended Workflow:** ${result.workflow.name}
**Confidence:** ${Math.round(result.confidence * 100)}%
**Reasoning:** ${result.reasoning}

### Workflow Steps:
${result.workflow.steps.map((s, i) => `${i + 1}. **${s.agent}**: ${s.description}`).join('\n')}

### Alternative Workflows:
${result.alternativeWorkflows.join(', ')}

Use \`kit_run_workflow\` with workflow="${result.workflow.name}" to start.`,
                }],
            };
        } catch (error) {
            return { content: [{ type: 'text' as const, text: `Error in smart routing: ${error}` }] };
        }
    }
);

// TOOL: List Workflows
server.tool(
    'kit_list_workflows',
    'List all available workflows',
    {},
    async () => {
        try {
            const workflows = listWorkflows();
            return {
                content: [{
                    type: 'text' as const,
                    text: `## 📋 Available Workflows

${workflows.map(w => `- **${w.name}**: ${w.description}`).join('\n')}

Use \`kit_run_workflow\` with the workflow name to execute.`,
                }],
            };
        } catch (error) {
            return { content: [{ type: 'text' as const, text: `Error listing workflows: ${error}` }] };
        }
    }
);

// TOOL: Session History
server.tool(
    'kit_session_history',
    'Get history of past team sessions',
    {
        limit: z.number().optional().default(10),
    },
    async ({ limit }) => {
        try {
            const sessions = getSessionHistory().slice(0, limit);
            if (sessions.length === 0) {
                return { content: [{ type: 'text' as const, text: 'No sessions found.' }] };
            }

            return {
                content: [{
                    type: 'text' as const,
                    text: `## 📜 Session History (Last ${limit})

${sessions.map(s => `- **${s.name}** (${s.status})
  Goal: ${s.goal.slice(0, 50)}...
  Started: ${s.startTime}
  Agents: ${s.agents.length}`).join('\n\n')}`,
                }],
            };
        } catch (error) {
            return { content: [{ type: 'text' as const, text: `Error getting history: ${error}` }] };
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════
const transport = new StdioServerTransport();
await server.connect(transport);
