#!/usr/bin/env node
/**
 * Gemini-Kit MCP Server
 * Provides custom tools for agent orchestration
 * 
 * Modular architecture - tools split into separate modules
 * 
 * FIX 9.3: Cross-platform compatible (no Unix shell commands)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// Import tool modules
import { registerGitTools } from './tools/git.js';
import { registerKnowledgeTools } from './tools/knowledge.js';
import { registerIntegrationTools } from './tools/integration.js';
import { safeGit, findFiles } from './tools/security.js';

const server = new McpServer({
    name: 'gemini-kit-agents',
    version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════
// REGISTER MODULAR TOOLS
// ═══════════════════════════════════════════════════════════════
registerGitTools(server);           // Tools 1, 2, 6, 11
registerKnowledgeTools(server);     // Tools 7, 8, 9, 10, 12, 13
registerIntegrationTools(server);   // Tools 14, 15, 16, 17

// ═══════════════════════════════════════════════════════════════
// TOOL 3: GET PROJECT CONTEXT (FIX 9.3 - Cross-platform)
// ═══════════════════════════════════════════════════════════════
server.tool(
    'kit_get_project_context',
    'Gather project context including structure, dependencies, and recent changes',
    { depth: z.number().optional().default(2).describe('Directory depth to scan') },
    async ({ depth = 2 }) => {
        try {
            // FIX 9.3: Use cross-platform findFiles instead of Unix shell commands
            const projectDir = process.cwd();
            const allExtensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.go', '.rs', '.java', '.json', '.md'];
            const files = findFiles(projectDir, allExtensions, 50);

            // Filter by depth (approximate)
            const structure = files.filter(f => {
                const parts = f.split(path.sep);
                return parts.length <= depth + 1;
            });

            let packageInfo = null;
            const pkgPath = path.join(projectDir, 'package.json');
            if (fs.existsSync(pkgPath)) {
                try {
                    packageInfo = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                } catch { }
            }

            let gitLog = '';
            try {
                gitLog = safeGit(['log', '--oneline', '-5']);
            } catch { }

            return {
                content: [{
                    type: 'text' as const,
                    text: JSON.stringify({
                        structure: structure,
                        package: packageInfo ? {
                            name: packageInfo.name,
                            version: packageInfo.version,
                            dependencies: Object.keys(packageInfo.dependencies || {})
                        } : null,
                        recentCommits: gitLog.split('\n').filter(Boolean),
                    }, null, 2),
                }],
            };
        } catch (error) {
            return { content: [{ type: 'text' as const, text: `Error getting context: ${error}` }] };
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// TOOL 4: HANDOFF AGENT
// ═══════════════════════════════════════════════════════════════
server.tool(
    'kit_handoff_agent',
    'Handoff context to another agent in the workflow',
    {
        fromAgent: z.string().describe('Current agent name'),
        toAgent: z.string().describe('Target agent name'),
        context: z.string().describe('Context to pass'),
        artifacts: z.array(z.string()).optional().describe('File paths of artifacts'),
    },
    async ({ fromAgent, toAgent, context, artifacts }) => {
        try {
            const handoffDir = path.join(process.cwd(), '.gemini-kit', 'handoffs');
            fs.mkdirSync(handoffDir, { recursive: true });

            const handoff = { timestamp: new Date().toISOString(), from: fromAgent, to: toAgent, context, artifacts: artifacts || [] };
            const filename = `${Date.now()}-${fromAgent}-${toAgent}.json`;
            fs.writeFileSync(path.join(handoffDir, filename), JSON.stringify(handoff, null, 2));

            return { content: [{ type: 'text' as const, text: `✅ Handoff from ${fromAgent} → ${toAgent}\n\nContext: ${context.slice(0, 200)}...` }] };
        } catch (error) {
            return { content: [{ type: 'text' as const, text: `Error in handoff: ${error}` }] };
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// TOOL 5: SAVE ARTIFACT
// ═══════════════════════════════════════════════════════════════
server.tool(
    'kit_save_artifact',
    'Save an artifact (plan, report, log) from agent work',
    {
        name: z.string().describe('Artifact name'),
        type: z.enum(['plan', 'report', 'log', 'other']).describe('Artifact type'),
        content: z.string().describe('Artifact content'),
    },
    async ({ name, type, content }) => {
        try {
            const artifactDir = path.join(process.cwd(), '.gemini-kit', 'artifacts', type);
            fs.mkdirSync(artifactDir, { recursive: true });

            const safeName = String(name).replace(/\s+/g, '-');
            const filename = `${safeName}-${Date.now()}.md`;
            const filepath = path.join(artifactDir, filename);
            fs.writeFileSync(filepath, content);

            return { content: [{ type: 'text' as const, text: `✅ Artifact saved: ${filepath}` }] };
        } catch (error) {
            return { content: [{ type: 'text' as const, text: `Error saving artifact: ${error}` }] };
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// ORCHESTRATION TOOLS (Phase 11)
// ═══════════════════════════════════════════════════════════════

import {
    initOrchestrator,
    teamStart,
    teamStatus,
    teamEnd,
    runWorkflow,
    smartRoute,
    handleStepFailure,
    getSessionHistory,
    getCollaborationPrompt,
} from './tools/orchestrator.js';

import { listWorkflows } from './tools/workflows.js';

// Initialize orchestrator
initOrchestrator({ maxRetries: 3, autoRetry: true, verbose: false });

// TOOL 18: Start Team Session
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

// TOOL 19: Get Team Status
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

// TOOL 20: End Team Session
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

// TOOL 21: Run Workflow
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

// TOOL 22: Smart Route
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

// TOOL 23: List Workflows
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

// TOOL 24: Session History
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
