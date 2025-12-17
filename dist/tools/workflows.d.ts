/**
 * Workflow Definitions
 * Pre-defined workflows for common development patterns
 */
export interface WorkflowStep {
    agent: string;
    description: string;
    required: boolean;
    onFailure?: 'retry' | 'skip' | 'abort' | 'fallback';
    fallbackAgent?: string;
    maxRetries?: number;
    parallel?: boolean;
    condition?: (context: Record<string, unknown>) => boolean;
}
export interface Workflow {
    name: string;
    description: string;
    steps: WorkflowStep[];
    autoRetry: boolean;
    maxRetries: number;
}
/**
 * Pre-defined workflows
 */
export declare const WORKFLOWS: Record<string, Workflow>;
/**
 * Get workflow by name
 */
export declare function getWorkflow(name: string): Workflow | undefined;
/**
 * List all available workflows
 */
export declare function listWorkflows(): Array<{
    name: string;
    description: string;
}>;
/**
 * Smart routing: auto-select workflow based on task description
 */
export declare function autoSelectWorkflow(task: string): Workflow;
/**
 * Get workflow step prompt
 */
export declare function getStepPrompt(step: WorkflowStep, task: string, context: Record<string, unknown>): string;
