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
export const WORKFLOWS: Record<string, Workflow> = {
    // Full development cycle
    cook: {
        name: 'cook',
        description: 'Full development cycle: Plan → Scout → Code → Test → Review',
        autoRetry: true,
        maxRetries: 3,
        steps: [
            { agent: 'planner', description: 'Create implementation plan', required: true, onFailure: 'abort' },
            { agent: 'scout', description: 'Find relevant files', required: true, onFailure: 'abort' },
            { agent: 'coder', description: 'Implement changes', required: true, onFailure: 'retry', maxRetries: 2 },
            { agent: 'tester', description: 'Run tests', required: true, onFailure: 'retry', maxRetries: 3 },
            { agent: 'reviewer', description: 'Code review', required: false, onFailure: 'skip' },
        ],
    },

    // Quick fix workflow
    quickfix: {
        name: 'quickfix',
        description: 'Quick bug fix: Debug → Code → Test',
        autoRetry: true,
        maxRetries: 3,
        steps: [
            { agent: 'debugger', description: 'Analyze the issue', required: true, onFailure: 'abort' },
            { agent: 'coder', description: 'Apply fix', required: true, onFailure: 'retry', maxRetries: 2 },
            { agent: 'tester', description: 'Verify fix', required: true, onFailure: 'retry', maxRetries: 3 },
        ],
    },

    // Feature development
    feature: {
        name: 'feature',
        description: 'New feature: Design → Plan → Code → Test → Docs',
        autoRetry: true,
        maxRetries: 2,
        steps: [
            { agent: 'architect', description: 'Design architecture', required: true, onFailure: 'abort' },
            { agent: 'planner', description: 'Create detailed plan', required: true, onFailure: 'abort' },
            { agent: 'scout', description: 'Find related code', required: true, onFailure: 'skip' },
            { agent: 'coder', description: 'Implement feature', required: true, onFailure: 'retry', maxRetries: 2 },
            { agent: 'tester', description: 'Write and run tests', required: true, onFailure: 'retry', maxRetries: 3 },
            { agent: 'docs', description: 'Update documentation', required: false, onFailure: 'skip' },
        ],
    },

    // Code review workflow
    review: {
        name: 'review',
        description: 'Code review: Scout → Review → Security',
        autoRetry: false,
        maxRetries: 1,
        steps: [
            { agent: 'scout', description: 'Find files to review', required: true, onFailure: 'abort' },
            { agent: 'reviewer', description: 'Perform code review', required: true, onFailure: 'abort' },
            { agent: 'security', description: 'Security analysis', required: false, onFailure: 'skip' },
        ],
    },

    // Refactoring workflow
    refactor: {
        name: 'refactor',
        description: 'Refactoring: Scout → Plan → Code → Test → Review',
        autoRetry: true,
        maxRetries: 2,
        steps: [
            { agent: 'scout', description: 'Find code to refactor', required: true, onFailure: 'abort' },
            { agent: 'planner', description: 'Plan refactoring steps', required: true, onFailure: 'abort' },
            { agent: 'coder', description: 'Apply refactoring', required: true, onFailure: 'retry', maxRetries: 2 },
            { agent: 'tester', description: 'Ensure tests pass', required: true, onFailure: 'retry', maxRetries: 3 },
            { agent: 'reviewer', description: 'Review changes', required: false, onFailure: 'skip' },
        ],
    },

    // Test-driven development
    tdd: {
        name: 'tdd',
        description: 'TDD: Write tests first, then implement',
        autoRetry: true,
        maxRetries: 3,
        steps: [
            { agent: 'planner', description: 'Plan test cases', required: true, onFailure: 'abort' },
            { agent: 'tester', description: 'Write failing tests', required: true, onFailure: 'abort' },
            { agent: 'coder', description: 'Implement to pass tests', required: true, onFailure: 'retry', maxRetries: 3 },
            { agent: 'tester', description: 'Verify all tests pass', required: true, onFailure: 'retry', maxRetries: 2 },
            { agent: 'reviewer', description: 'Review implementation', required: false, onFailure: 'skip' },
        ],
    },

    // Parallel scout workflow
    multiScout: {
        name: 'multi-scout',
        description: 'Parallel scouting: Frontend + Backend + Tests',
        autoRetry: false,
        maxRetries: 1,
        steps: [
            { agent: 'scout-frontend', description: 'Scout frontend code', required: false, parallel: true, onFailure: 'skip' },
            { agent: 'scout-backend', description: 'Scout backend code', required: false, parallel: true, onFailure: 'skip' },
            { agent: 'scout-tests', description: 'Scout test files', required: false, parallel: true, onFailure: 'skip' },
        ],
    },

    // Documentation workflow
    docs: {
        name: 'docs',
        description: 'Documentation: Scout → Analyze → Write → Review',
        autoRetry: false,
        maxRetries: 1,
        steps: [
            { agent: 'scout', description: 'Find code to document', required: true, onFailure: 'abort' },
            { agent: 'analyst', description: 'Analyze code structure', required: true, onFailure: 'abort' },
            { agent: 'docs', description: 'Write documentation', required: true, onFailure: 'retry', maxRetries: 2 },
            { agent: 'reviewer', description: 'Review documentation', required: false, onFailure: 'skip' },
        ],
    },
};

/**
 * Get workflow by name
 */
export function getWorkflow(name: string): Workflow | undefined {
    return WORKFLOWS[name.toLowerCase()];
}

/**
 * List all available workflows
 */
export function listWorkflows(): Array<{ name: string; description: string }> {
    return Object.values(WORKFLOWS).map(w => ({
        name: w.name,
        description: w.description,
    }));
}

/**
 * Smart routing: auto-select workflow based on task description
 * Uses weight-based scoring to handle ambiguous tasks better
 */
export function autoSelectWorkflow(task: string): { workflow: Workflow; confidence: number } {
    const taskLower = task.toLowerCase();

    // Weight patterns - higher weight = stronger signal
    const workflowScores: Record<string, { score: number; workflow: Workflow }> = {
        quickfix: { score: 0, workflow: WORKFLOWS.quickfix },
        feature: { score: 0, workflow: WORKFLOWS.feature },
        refactor: { score: 0, workflow: WORKFLOWS.refactor },
        review: { score: 0, workflow: WORKFLOWS.review },
        tdd: { score: 0, workflow: WORKFLOWS.tdd },
        docs: { score: 0, workflow: WORKFLOWS.docs },
    };

    // Bug/fix patterns - strong signals
    if (/\b(fix|debug|broken|crash|not working)\b/.test(taskLower)) {
        workflowScores.quickfix.score += 10;
    }
    // Weaker bug signals (could be part of feature work)
    if (/\b(bug|error|issue)\b/.test(taskLower)) {
        workflowScores.quickfix.score += 3;
    }

    // Feature patterns - strong signals
    if (/\b(feature|implement|create|build)\b/.test(taskLower)) {
        workflowScores.feature.score += 10;
    }
    // Weaker feature signals
    if (/\b(add|new)\b/.test(taskLower)) {
        workflowScores.feature.score += 5;
    }

    // Refactor patterns
    if (/\b(refactor|restructure|reorganize)\b/.test(taskLower)) {
        workflowScores.refactor.score += 10;
    }
    if (/\b(clean|improve|optimize)\b/.test(taskLower)) {
        workflowScores.refactor.score += 5;
    }

    // Review patterns
    if (/\b(review|audit)\b/.test(taskLower)) {
        workflowScores.review.score += 10;
    }
    if (/\b(check|analyze)\b/.test(taskLower)) {
        workflowScores.review.score += 3;
    }

    // Test patterns
    if (/\b(test|tdd|spec)\b/.test(taskLower)) {
        workflowScores.tdd.score += 10;
    }
    if (/\b(coverage)\b/.test(taskLower)) {
        workflowScores.tdd.score += 5;
    }

    // Docs patterns
    if (/\b(document|documentation|readme)\b/.test(taskLower)) {
        workflowScores.docs.score += 10;
    }
    if (/\b(doc|comment)\b/.test(taskLower)) {
        workflowScores.docs.score += 3;
    }

    // Find the highest scoring workflow
    let bestMatch = { name: 'cook', score: 0, workflow: WORKFLOWS.cook };
    for (const [name, data] of Object.entries(workflowScores)) {
        if (data.score > bestMatch.score) {
            bestMatch = { name, score: data.score, workflow: data.workflow };
        }
    }

    // Calculate confidence based on score
    if (bestMatch.score >= 10) {
        return { workflow: bestMatch.workflow, confidence: 0.9 };
    } else if (bestMatch.score >= 5) {
        return { workflow: bestMatch.workflow, confidence: 0.7 };
    } else if (bestMatch.score > 0) {
        return { workflow: bestMatch.workflow, confidence: 0.5 };
    }

    // Default to cook (full cycle) with lower confidence
    return { workflow: WORKFLOWS.cook, confidence: 0.5 };
}

/**
 * Get workflow step prompt
 */
export function getStepPrompt(step: WorkflowStep, task: string, context: Record<string, unknown>): string {
    const agentPrompts: Record<string, string> = {
        planner: `You are a Planner agent. Create a detailed implementation plan for: ${task}`,
        scout: `You are a Scout agent. Find all relevant files and code for: ${task}`,
        coder: `You are a Coder agent. Implement the following based on the plan: ${task}`,
        tester: `You are a Tester agent. Write and run tests for: ${task}`,
        reviewer: `You are a Code Reviewer agent. Review the changes made for: ${task}`,
        debugger: `You are a Debugger agent. Analyze and debug the issue: ${task}`,
        architect: `You are an Architect agent. Design the architecture for: ${task}`,
        docs: `You are a Documentation agent. Write/update documentation for: ${task}`,
        security: `You are a Security agent. Perform security analysis for: ${task}`,
        analyst: `You are an Analyst agent. Analyze the code structure for: ${task}`,
    };

    // Add context from previous steps
    let contextStr = '';
    if (Object.keys(context).length > 0) {
        contextStr = '\n\nContext from previous steps:\n' + JSON.stringify(context, null, 2);
    }

    return (agentPrompts[step.agent] || `Execute ${step.agent} for: ${task}`) + contextStr;
}
