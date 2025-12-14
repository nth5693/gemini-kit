/**
 * Orchestrator Engine
 * Coordinates agents, manages workflows, handles retries and parallel execution
 */

import {
    TeamSession,
    AgentResult,
    startSession,
    getCurrentSession,
    addAgentResult,
    updateContext,
    getContext,
    incrementRetry,
    canRetry,
    endSession,
    getSessionSummary,
    listSessions,
    initTeamState,
} from './team-state.js';

import {
    Workflow,
    WorkflowStep,
    getWorkflow,
    listWorkflows,
    autoSelectWorkflow,
    getStepPrompt,
} from './workflows.js';

export interface OrchestratorConfig {
    maxRetries: number;
    parallelEnabled: boolean;
    autoRetry: boolean;
    verbose: boolean;
}

const DEFAULT_CONFIG: OrchestratorConfig = {
    maxRetries: 3,
    parallelEnabled: true,
    autoRetry: true,
    verbose: false,
};

let config: OrchestratorConfig = DEFAULT_CONFIG;

/**
 * Initialize orchestrator
 */
export function initOrchestrator(customConfig?: Partial<OrchestratorConfig>): void {
    config = { ...DEFAULT_CONFIG, ...customConfig };
    initTeamState({ maxRetries: config.maxRetries });
}

/**
 * Start a new team session with a goal
 */
export function teamStart(goal: string, sessionName?: string): {
    success: boolean;
    session: TeamSession;
    suggestedWorkflow: string;
    allWorkflows: Array<{ name: string; description: string }>;
} {
    const session = startSession(goal, sessionName);
    const suggested = autoSelectWorkflow(goal);

    return {
        success: true,
        session,
        suggestedWorkflow: suggested.name,
        allWorkflows: listWorkflows(),
    };
}

/**
 * Get current session status
 */
export function teamStatus(): {
    hasSession: boolean;
    summary: string;
    session: TeamSession | null;
} {
    const session = getCurrentSession();

    return {
        hasSession: session !== null,
        summary: getSessionSummary(),
        session,
    };
}

/**
 * End current session
 */
export function teamEnd(status: 'completed' | 'failed' = 'completed'): {
    success: boolean;
    summary: string;
    session: TeamSession | null;
} {
    const session = endSession(status);

    return {
        success: session !== null,
        summary: session ? getSessionSummary() : 'No active session to end',
        session,
    };
}

/**
 * Execute a single workflow step
 */
export function executeStep(
    step: WorkflowStep,
    task: string
): AgentResult {
    const startTime = Date.now();
    const context = getCurrentSession()?.context || {};

    // Generate prompt for this step
    const prompt = getStepPrompt(step, task, context);

    // Create result (actual execution would be done by Gemini CLI)
    const result: AgentResult = {
        agent: step.agent,
        status: 'pending',
        output: prompt,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
    };

    // Add to session
    addAgentResult(result);

    return result;
}

/**
 * Run a complete workflow
 */
export function runWorkflow(
    workflowName: string,
    task: string
): {
    success: boolean;
    workflow: Workflow | undefined;
    steps: Array<{ step: WorkflowStep; prompt: string }>;
    message: string;
} {
    const workflow = getWorkflow(workflowName);

    if (!workflow) {
        return {
            success: false,
            workflow: undefined,
            steps: [],
            message: `Workflow '${workflowName}' not found. Available: ${listWorkflows().map(w => w.name).join(', ')}`,
        };
    }

    // Ensure session exists
    let session = getCurrentSession();
    if (!session) {
        session = startSession(task, `${workflow.name} - ${task.slice(0, 50)}`);
    }

    // Update session with workflow type
    updateContext('workflowType', workflow.name);
    updateContext('task', task);

    // Generate step prompts
    const steps = workflow.steps.map(step => ({
        step,
        prompt: getStepPrompt(step, task, session?.context || {}),
    }));

    return {
        success: true,
        workflow,
        steps,
        message: `Workflow '${workflow.name}' ready with ${steps.length} steps:\n${steps.map((s, i) => `${i + 1}. ${s.step.agent}: ${s.step.description}`).join('\n')}`,
    };
}

/**
 * Handle step failure with retry logic
 */
export function handleStepFailure(
    step: WorkflowStep,
    error: string
): {
    action: 'retry' | 'skip' | 'abort' | 'fallback';
    canRetry: boolean;
    retryCount: number;
    message: string;
} {
    const session = getCurrentSession();

    if (!session) {
        return {
            action: 'abort',
            canRetry: false,
            retryCount: 0,
            message: 'No active session',
        };
    }

    // Record failure
    addAgentResult({
        agent: step.agent,
        status: 'failure',
        output: error,
        timestamp: new Date().toISOString(),
    });

    const onFailure = step.onFailure || 'abort';

    if (onFailure === 'retry' && canRetry()) {
        const count = incrementRetry();
        return {
            action: 'retry',
            canRetry: true,
            retryCount: count,
            message: `Retrying ${step.agent} (attempt ${count}/${session.maxRetries})`,
        };
    }

    if (onFailure === 'fallback' && step.fallbackAgent) {
        return {
            action: 'fallback',
            canRetry: false,
            retryCount: session.retryCount,
            message: `Falling back to ${step.fallbackAgent}`,
        };
    }

    if (onFailure === 'skip' || !step.required) {
        return {
            action: 'skip',
            canRetry: false,
            retryCount: session.retryCount,
            message: `Skipping optional step: ${step.agent}`,
        };
    }

    return {
        action: 'abort',
        canRetry: false,
        retryCount: session.retryCount,
        message: `Aborting workflow: ${step.agent} failed`,
    };
}

/**
 * Smart routing: analyze task and return recommended workflow
 */
export function smartRoute(task: string): {
    workflow: Workflow;
    confidence: number;
    reasoning: string;
    alternativeWorkflows: string[];
} {
    const workflow = autoSelectWorkflow(task);
    const allWorkflows = listWorkflows();

    // Simple confidence based on keyword matching
    let confidence = 0.5;
    const taskLower = task.toLowerCase();

    const patterns: Record<string, RegExp> = {
        quickfix: /\b(bug|fix|error|issue|crash|broken)\b/,
        feature: /\b(feature|add|implement|create|new|build)\b/,
        refactor: /\b(refactor|clean|improve|optimize)\b/,
        review: /\b(review|check|analyze|audit)\b/,
        tdd: /\b(test|tdd|coverage|spec)\b/,
        docs: /\b(doc|document|readme|comment)\b/,
    };

    for (const [name, pattern] of Object.entries(patterns)) {
        if (pattern.test(taskLower) && workflow.name === name) {
            confidence = 0.9;
            break;
        }
    }

    return {
        workflow,
        confidence,
        reasoning: `Selected '${workflow.name}' workflow based on task analysis`,
        alternativeWorkflows: allWorkflows.filter(w => w.name !== workflow.name).map(w => w.name),
    };
}

/**
 * Get collaboration prompt for agent to consult another agent
 */
export function getCollaborationPrompt(
    fromAgent: string,
    toAgent: string,
    question: string,
    context: Record<string, unknown>
): string {
    return `
## Agent Collaboration Request

**From:** ${fromAgent}
**To:** ${toAgent}
**Question:** ${question}

### Context
${JSON.stringify(context, null, 2)}

Please provide your expert opinion on this matter.
`.trim();
}

/**
 * List past sessions
 */
export function getSessionHistory(): TeamSession[] {
    return listSessions();
}

// Export types
export type { TeamSession, AgentResult, Workflow, WorkflowStep };
