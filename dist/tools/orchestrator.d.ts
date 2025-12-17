/**
 * Orchestrator Engine
 * Coordinates agents, manages workflows, handles retries and parallel execution
 */
import { TeamSession, AgentResult } from './team-state.js';
import { Workflow, WorkflowStep } from './workflows.js';
export interface OrchestratorConfig {
    maxRetries: number;
    parallelEnabled: boolean;
    autoRetry: boolean;
    verbose: boolean;
}
/**
 * Initialize orchestrator
 */
export declare function initOrchestrator(customConfig?: Partial<OrchestratorConfig>): void;
/**
 * Start a new team session with a goal
 */
export declare function teamStart(goal: string, sessionName?: string): {
    success: boolean;
    session: TeamSession;
    suggestedWorkflow: string;
    allWorkflows: Array<{
        name: string;
        description: string;
    }>;
};
/**
 * Get current session status
 */
export declare function teamStatus(): {
    hasSession: boolean;
    summary: string;
    session: TeamSession | null;
};
/**
 * End current session
 */
export declare function teamEnd(status?: 'completed' | 'failed'): {
    success: boolean;
    summary: string;
    session: TeamSession | null;
};
/**
 * Execute a single workflow step
 */
export declare function executeStep(step: WorkflowStep, task: string): AgentResult;
/**
 * Run a complete workflow
 */
export declare function runWorkflow(workflowName: string, task: string): {
    success: boolean;
    workflow: Workflow | undefined;
    steps: Array<{
        step: WorkflowStep;
        prompt: string;
    }>;
    message: string;
};
/**
 * Handle step failure with retry logic
 */
export declare function handleStepFailure(step: WorkflowStep, error: string): {
    action: 'retry' | 'skip' | 'abort' | 'fallback';
    canRetry: boolean;
    retryCount: number;
    message: string;
};
/**
 * Smart routing: analyze task and return recommended workflow
 */
export declare function smartRoute(task: string): {
    workflow: Workflow;
    confidence: number;
    reasoning: string;
    alternativeWorkflows: string[];
};
/**
 * Get collaboration prompt for agent to consult another agent
 */
export declare function getCollaborationPrompt(fromAgent: string, toAgent: string, question: string, context: Record<string, unknown>): string;
/**
 * List past sessions
 */
export declare function getSessionHistory(): TeamSession[];
export type { TeamSession, AgentResult, Workflow, WorkflowStep };
